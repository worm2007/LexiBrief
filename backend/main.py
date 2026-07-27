import json
import os
import shutil
import traceback
import uuid

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

load_dotenv()

from auth import create_access_token, get_current_user, hash_password, verify_password
from database import Base, engine, get_db
from models import ChatMessage, Document, User
from schemas import (
    AnalyzeRequest,
    GuestLegalChatRequest,
    LegalChatRequest,
    LoginRequest,
    RegisterRequest,
)
from services.ai_service import LegalAIService, chunk_legal_document
from services.legal_chat import ask_legal_question
from services.vector_store import VectorStoreService
from utils.pdf_handler import extract_text_from_pdf


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LexiBrief API",
    version="2.1",
    description="AI legal document analysis and general legal-information chat",
)

origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

from fastapi.middleware.cors import CORSMiddleware

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://lexi-brief-izqwnvyz1-bots07.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
VECTOR_DIR = os.getenv("VECTOR_DIR", "vector_indices")
MAX_FILE_SIZE = 10 * 1024 * 1024
GUEST_CHAT_LIMIT = 10

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(VECTOR_DIR, exist_ok=True)

ai_service = LegalAIService()
vector_service = VectorStoreService()

# Development-friendly guest counter. It resets when the server restarts.
# Use Redis or a database before scaling to multiple production instances.
guest_chat_counts: dict[str, int] = {}


def user_payload(user: User) -> dict:
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "created_at": user.created_at,
    }


def parse_stored_json(value, fallback):
    if value is None:
        return fallback
    if isinstance(value, (list, dict)):
        return value
    if isinstance(value, str):
        try:
            return json.loads(value)
        except (json.JSONDecodeError, TypeError):
            return fallback
    return fallback


def document_payload(document: Document, include_analysis: bool = True) -> dict:
    data = {
        "document_id": document.id,
        "filename": document.filename,
        "pages": document.pages,
        "chunks": document.chunks,
        "text_preview": document.text_preview,
        "status": document.status,
        "created_at": document.created_at,
        "updated_at": document.updated_at,
    }

    if include_analysis:
        data.update(
            {
                "summary": document.summary,
                "clauses": parse_stored_json(document.clauses, []),
                "risks": parse_stored_json(
                    document.risks,
                    {
                        "risk_score": 0,
                        "risk_level": "Unknown",
                        "high_risks": [],
                        "medium_risks": [],
                        "low_risks": [],
                        "summary": "",
                    },
                ),
            }
        )

    return data


def validate_pdf(file: UploadFile) -> None:
    if not file.filename:
        raise HTTPException(400, "No file was selected.")
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are currently supported.")


def save_uploaded_pdf(file: UploadFile, doc_id: str) -> str:
    path = os.path.join(UPLOAD_DIR, f"{doc_id}.pdf")
    total = 0

    with open(path, "wb") as buffer:
        while chunk := file.file.read(1024 * 1024):
            total += len(chunk)
            if total > MAX_FILE_SIZE:
                buffer.close()
                if os.path.exists(path):
                    os.remove(path)
                raise HTTPException(413, "PDF size must be 10 MB or less.")
            buffer.write(chunk)

    return path


def prepare_document(file: UploadFile) -> dict:
    doc_id = str(uuid.uuid4())
    path = save_uploaded_pdf(file, doc_id)

    try:
        text = extract_text_from_pdf(path)
        if not text or not text.strip():
            raise HTTPException(400, "No readable text found in PDF.")

        chunks = chunk_legal_document(text)
        if not chunks:
            raise HTTPException(400, "Unable to create document chunks.")

        vector_service.create_and_save_index(chunks, doc_id)

        return {
            "document_id": doc_id,
            "path": path,
            "text": text,
            "chunks": chunks,
            "pages": max(1, text.count("--- PAGE")),
        }
    except Exception:
        if os.path.exists(path):
            os.remove(path)
        vector_path = os.path.join(VECTOR_DIR, doc_id)
        if os.path.isdir(vector_path):
            shutil.rmtree(vector_path, ignore_errors=True)
        raise


def get_owned_document(db: Session, user: User, doc_id: str) -> Document:
    document = db.scalar(
        select(Document).where(Document.id == doc_id, Document.user_id == user.id)
    )
    if not document:
        raise HTTPException(404, "Document not found.")
    return document


def vector_index_exists(doc_id: str) -> bool:
    return bool(doc_id) and os.path.isdir(os.path.join(VECTOR_DIR, doc_id))


def get_analysis_context(doc_id: str, search_query: str, result_count: int = 15) -> str:
    try:
        vectorstore = vector_service.load_index(doc_id)
        docs = vectorstore.similarity_search(search_query, k=result_count)
    except Exception as error:
        raise HTTPException(404, "Document index was not found or could not be loaded.") from error

    context = "\n\n".join(doc.page_content for doc in docs if doc.page_content)
    if not context.strip():
        raise HTTPException(404, "No relevant document content was found.")
    return context


def parse_risk_response(risks) -> dict:
    fallback = {
        "risk_score": 0,
        "risk_level": "Unknown",
        "high_risks": [],
        "medium_risks": [],
        "low_risks": [],
        "summary": str(risks or ""),
    }

    if isinstance(risks, dict):
        return risks
    if not isinstance(risks, str) or not risks.strip():
        return fallback

    cleaned = risks.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]

    try:
        parsed = json.loads(cleaned.strip())
        return parsed if isinstance(parsed, dict) else fallback
    except (json.JSONDecodeError, TypeError):
        return fallback


def chat_context(document_id: str | None) -> tuple[str | None, str]:
    """Return optional document context and the response mode."""
    if not document_id:
        return None, "general"

    if not vector_index_exists(document_id):
        raise HTTPException(
            404,
            "The uploaded document expired or was not found. Please upload it again.",
        )

    # Retrieve a broad set of relevant chunks. The chat prompt then decides
    # whether the user's question is document-specific or general.
    return "", "document_available"


@app.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    email = request.email.lower().strip()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(409, "An account with this email already exists.")

    user = User(
        full_name=request.full_name.strip(),
        email=email,
        password_hash=hash_password(request.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "access_token": create_access_token(user.id),
        "token_type": "bearer",
        "user": user_payload(user),
    }


@app.post("/auth/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == request.email.lower().strip()))
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(401, "Incorrect email or password.")

    return {
        "access_token": create_access_token(user.id),
        "token_type": "bearer",
        "user": user_payload(user),
    }


@app.get("/auth/me")
def me(user: User = Depends(get_current_user)):
    return user_payload(user)


@app.get("/documents")
def list_documents(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    documents = db.scalars(
        select(Document)
        .where(Document.user_id == user.id)
        .order_by(Document.created_at.desc())
    ).all()
    return [document_payload(document, include_analysis=False) for document in documents]


@app.get("/documents/{doc_id}")
def read_document(
    doc_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return document_payload(get_owned_document(db, user, doc_id))


@app.delete("/documents/{doc_id}", status_code=204)
def delete_document(
    doc_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    document = get_owned_document(db, user, doc_id)

    for path in [document.stored_path, os.path.join(VECTOR_DIR, doc_id)]:
        if os.path.isdir(path):
            shutil.rmtree(path, ignore_errors=True)
        elif os.path.isfile(path):
            os.remove(path)

    db.delete(document)
    db.commit()


@app.post("/full-analysis")
async def full_analysis(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        validate_pdf(file)
        prepared = prepare_document(file)
        doc_id = prepared["document_id"]

        summary_context = get_analysis_context(
            doc_id,
            "contract overview parties purpose important dates payment confidentiality liability termination",
        )
        clauses_context = get_analysis_context(
            doc_id,
            "confidentiality indemnification force majeure intellectual property termination dispute resolution",
        )
        risks_context = get_analysis_context(
            doc_id,
            "legal risks unlimited liability penalties indemnity termination obligations disputes payment risks",
        )

        summary = await ai_service.analyze_document(summary_context, "summary")
        clauses = await ai_service.analyze_document(clauses_context, "clauses")
        risks = parse_risk_response(
            await ai_service.analyze_document(risks_context, "risks")
        )

        document = Document(
            id=doc_id,
            user_id=user.id,
            filename=file.filename,
            stored_path=prepared["path"],
            pages=prepared["pages"],
            chunks=len(prepared["chunks"]),
            text_preview=prepared["text"][:500],
            summary=summary,
            clauses=json.dumps(clauses),
            risks=risks,
            status="analyzed",
        )
        db.add(document)
        db.commit()
        db.refresh(document)
        return document_payload(document)

    except HTTPException:
        raise
    except Exception as error:
        traceback.print_exc()
        raise HTTPException(500, f"Full analysis failed: {error}") from error


@app.post("/analyze-guest")
async def analyze_guest(file: UploadFile = File(...)):
    try:
        validate_pdf(file)
        prepared = prepare_document(file)
        doc_id = prepared["document_id"]

        summary_context = get_analysis_context(
            doc_id,
            "contract overview parties purpose important dates payment confidentiality liability termination",
        )
        clauses_context = get_analysis_context(
            doc_id,
            "confidentiality indemnification force majeure intellectual property termination dispute resolution",
        )
        risks_context = get_analysis_context(
            doc_id,
            "legal risks unlimited liability penalties indemnity termination obligations disputes payment risks",
        )

        summary = await ai_service.analyze_document(summary_context, "summary")
        clauses = await ai_service.analyze_document(clauses_context, "clauses")
        risks = parse_risk_response(
            await ai_service.analyze_document(risks_context, "risks")
        )

        # The original PDF is temporary for guests, but the vector index stays
        # available so they can ask document questions during the session.
        if os.path.exists(prepared["path"]):
            os.remove(prepared["path"])

        return {
            "guest": True,
            "document_id": doc_id,
            "filename": file.filename,
            "pages": prepared["pages"],
            "summary": summary,
            "clauses": clauses,
            "risks": risks,
        }

    except HTTPException:
        raise
    except Exception as error:
        traceback.print_exc()
        raise HTTPException(500, f"Guest analysis failed: {error}") from error


@app.post("/analyze")
async def analyze_document(
    request: AnalyzeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    document = get_owned_document(db, user, request.doc_id)
    analysis_type = request.type.strip().lower()
    queries = {
        "summary": "contract overview parties purpose dates payment confidentiality liability termination",
        "clauses": "confidentiality indemnification intellectual property termination dispute resolution force majeure",
        "risks": "legal risks liability penalties termination obligations indemnity disputes payment risks",
    }

    if analysis_type not in queries:
        raise HTTPException(400, "Use summary, clauses, or risks.")

    result = await ai_service.analyze_document(
        get_analysis_context(document.id, queries[analysis_type]),
        analysis_type,
    )

    if analysis_type == "risks":
        result = parse_risk_response(result)
        document.risks = result
    elif analysis_type == "clauses":
        document.clauses = json.dumps(result)
    else:
        document.summary = result

    document.status = "analyzed"
    db.commit()

    return {
        "document_id": document.id,
        "analysis_type": analysis_type,
        "result": result,
    }


@app.post("/legal-chat")
def legal_chat(
    request: LegalChatRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    question = request.question.strip()
    document_id = request.document_id.strip() if request.document_id else None

    if not question:
        raise HTTPException(400, "Question is required.")

    context = None
    mode = "general"

    if document_id:
        get_owned_document(db, user, document_id)
        context = get_analysis_context(document_id, question, result_count=18)
        mode = "document_or_general"

    answer = ask_legal_question(context, question)

    db.add(
        ChatMessage(
            user_id=user.id,
            document_id=document_id,
            role="user",
            content=question,
        )
    )
    db.add(
        ChatMessage(
            user_id=user.id,
            document_id=document_id,
            role="ai",
            content=answer,
        )
    )
    db.commit()

    return {
        "answer": answer,
        "mode": mode,
        "guest": False,
    }


@app.post("/legal-chat-guest")
def legal_chat_guest(request: GuestLegalChatRequest):
    question = request.question.strip()
    document_id = request.document_id.strip() if request.document_id else None
    session_id = request.session_id.strip()

    if not question:
        raise HTTPException(400, "Question is required.")
    if not session_id:
        raise HTTPException(400, "Guest session ID is required.")

    current_count = guest_chat_counts.get(session_id, 0)
    if current_count >= GUEST_CHAT_LIMIT:
        raise HTTPException(
            403,
            "You have used all 10 free AI chats. Create a free account to continue.",
        )

    context = None
    mode = "general"

    if document_id:
        if not vector_index_exists(document_id):
            raise HTTPException(
                404,
                "Guest document expired or was not found. Please upload it again.",
            )
        context = get_analysis_context(document_id, question, result_count=18)
        mode = "document_or_general"

    answer = ask_legal_question(context, question)

    new_count = current_count + 1
    guest_chat_counts[session_id] = new_count

    return {
        "answer": answer,
        "mode": mode,
        "guest": True,
        "used": new_count,
        "remaining": max(0, GUEST_CHAT_LIMIT - new_count),
        "limit": GUEST_CHAT_LIMIT,
    }


@app.get("/chat-history")
def chat_history(
    document_id: str | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if document_id:
        get_owned_document(db, user, document_id)

    query = select(ChatMessage).where(ChatMessage.user_id == user.id)
    if document_id:
        query = query.where(ChatMessage.document_id == document_id)
    else:
        query = query.where(ChatMessage.document_id.is_(None))

    messages = db.scalars(query.order_by(ChatMessage.created_at.asc())).all()
    return [
        {
            "id": item.id,
            "role": item.role,
            "content": item.content,
            "created_at": item.created_at,
        }
        for item in messages
    ]


@app.get("/")
def home():
    return {
        "message": "LexiBrief API Running",
        "version": "2.1",
        "status": "healthy",
        "features": {
            "general_legal_chat": True,
            "document_chat": True,
            "guest_chat_limit": GUEST_CHAT_LIMIT,
        },
    }
