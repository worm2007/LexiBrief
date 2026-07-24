import json
import os
import shutil
import traceback
import uuid

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.ai_service import LegalAIService, chunk_legal_document
from services.legal_chat import ask_legal_question
from services.vector_store import VectorStoreService
from utils.pdf_handler import extract_text_from_pdf


# =============================
# Environment
# =============================

load_dotenv()


# =============================
# FastAPI App
# =============================

app = FastAPI(
    title="Lexi Brief API",
    version="1.0",
    description="AI-powered legal document analysis API",
)


# =============================
# CORS
# =============================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================
# Directories
# =============================

UPLOAD_DIR = "uploads"
VECTOR_DIR = "vector_indices"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(VECTOR_DIR, exist_ok=True)


# =============================
# Services
# =============================

ai_service = LegalAIService()
vector_service = VectorStoreService()


# =============================
# Request Models
# =============================

class AnalyzeRequest(BaseModel):
    doc_id: str
    type: str


class LegalChatRequest(BaseModel):
    question: str
    document_id: str | None = None


# =============================
# Helper Functions
# =============================

def validate_pdf(file: UploadFile) -> None:
    """
    Validate that a PDF file was selected.
    """

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was selected.",
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are currently supported.",
        )


def save_uploaded_pdf(file: UploadFile, doc_id: str) -> str:
    """
    Save an uploaded PDF and return its local path.
    """

    file_path = os.path.join(
        UPLOAD_DIR,
        f"{doc_id}.pdf",
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer,
        )

    return file_path


def prepare_document(file: UploadFile) -> dict:
    """
    Save a PDF, extract its text, split it into chunks,
    and create its vector index.
    """

    doc_id = str(uuid.uuid4())

    file_path = save_uploaded_pdf(
        file,
        doc_id,
    )

    text = extract_text_from_pdf(file_path)

    print(f"Document ID: {doc_id}")
    print(f"Text length: {len(text)}")
    print(text[:500])

    if not text or not text.strip():
        raise HTTPException(
            status_code=400,
            detail="No readable text found in PDF.",
        )

    chunks = chunk_legal_document(text)

    print(f"Chunks created: {len(chunks)}")

    if not chunks:
        raise HTTPException(
            status_code=400,
            detail="Unable to create document chunks.",
        )

    vector_service.create_and_save_index(
        chunks,
        doc_id,
    )

    return {
        "document_id": doc_id,
        "text": text,
        "chunks": chunks,
        "pages": text.count("--- PAGE"),
    }


def get_analysis_context(
    doc_id: str,
    search_query: str = "contract overview",
    result_count: int = 15,
) -> str:
    """
    Load a stored vector index and retrieve relevant document text.
    """

    vectorstore = vector_service.load_index(doc_id)

    docs = vectorstore.similarity_search(
        search_query,
        k=result_count,
    )

    context = "\n\n".join(
        doc.page_content
        for doc in docs
    )

    if not context.strip():
        raise HTTPException(
            status_code=404,
            detail="No relevant document content was found.",
        )

    return context


def parse_risk_response(risks: str) -> dict:
    """
    Convert the AI risk response from a JSON string
    into a Python dictionary.
    """

    fallback = {
        "risk_score": 0,
        "risk_level": "Unknown",
        "high_risks": [],
        "medium_risks": [],
        "low_risks": [],
        "summary": risks,
    }

    if not isinstance(risks, str) or not risks.strip():
        return fallback

    cleaned_risks = risks.strip()

    # Remove Markdown JSON code block if the AI includes one.
    if cleaned_risks.startswith("```json"):
        cleaned_risks = cleaned_risks[7:]
    elif cleaned_risks.startswith("```"):
        cleaned_risks = cleaned_risks[3:]

    if cleaned_risks.endswith("```"):
        cleaned_risks = cleaned_risks[:-3]

    try:
        parsed_risks = json.loads(
            cleaned_risks.strip()
        )

        if not isinstance(parsed_risks, dict):
            return fallback

        return {
            "risk_score": parsed_risks.get(
                "risk_score",
                0,
            ),
            "risk_level": parsed_risks.get(
                "risk_level",
                "Unknown",
            ),
            "high_risks": parsed_risks.get(
                "high_risks",
                [],
            ),
            "medium_risks": parsed_risks.get(
                "medium_risks",
                [],
            ),
            "low_risks": parsed_risks.get(
                "low_risks",
                [],
            ),
            "summary": parsed_risks.get(
                "summary",
                "No risk summary was generated.",
            ),
        }

    except (json.JSONDecodeError, TypeError):
        return fallback


# =============================
# Upload PDF
# =============================

@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
):
    try:
        validate_pdf(file)

        document = prepare_document(file)

        return {
            "document_id": document["document_id"],
            "filename": file.filename,
            "text_preview": document["text"][:500],
            "pages": document["pages"],
            "chunks": len(document["chunks"]),
            "status": "uploaded",
        }

    except HTTPException:
        raise

    except Exception as error:
        print("\n========== UPLOAD ERROR ==========")
        traceback.print_exc()
        print("==================================\n")

        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(error)}",
        ) from error


# =============================
# Individual Document Analysis
# =============================

@app.post("/analyze")
async def analyze_document(
    request: AnalyzeRequest,
):
    try:
        analysis_type = request.type.strip().lower()

        allowed_types = {
            "summary",
            "clauses",
            "risks",
        }

        if analysis_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid analysis type. "
                    "Use summary, clauses, or risks."
                ),
            )

        search_queries = {
            "summary": (
                "contract overview parties purpose dates "
                "payment confidentiality liability termination"
            ),
            "clauses": (
                "confidentiality indemnification "
                "intellectual property termination "
                "dispute resolution force majeure"
            ),
            "risks": (
                "legal risks liability penalties "
                "termination obligations indemnity "
                "disputes payment risks"
            ),
        }

        context = get_analysis_context(
            doc_id=request.doc_id,
            search_query=search_queries[analysis_type],
            result_count=15,
        )

        result = await ai_service.analyze_document(
            context,
            analysis_type,
        )

        # Return risks as a real JSON object.
        if analysis_type == "risks":
            result = parse_risk_response(result)

        return {
            "document_id": request.doc_id,
            "analysis_type": analysis_type,
            "result": result,
        }

    except HTTPException:
        raise

    except Exception as error:
        print("\n========== ANALYZE ERROR ==========")
        traceback.print_exc()
        print("===================================\n")

        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(error)}",
        ) from error


# =============================
# Full Document Analysis
# =============================

@app.post("/full-analysis")
async def full_analysis(
    file: UploadFile = File(...),
):
    try:
        validate_pdf(file)

        # Upload, extract, chunk and index document.
        document = prepare_document(file)

        doc_id = document["document_id"]

        # Retrieve relevant context for the summary.
        summary_context = get_analysis_context(
            doc_id=doc_id,
            search_query=(
                "contract overview parties purpose "
                "important dates payment confidentiality "
                "liability termination"
            ),
            result_count=15,
        )

        # Retrieve relevant context for clauses.
        clauses_context = get_analysis_context(
            doc_id=doc_id,
            search_query=(
                "confidentiality indemnification "
                "force majeure intellectual property "
                "termination dispute resolution"
            ),
            result_count=15,
        )

        # Retrieve relevant context for risks.
        risks_context = get_analysis_context(
            doc_id=doc_id,
            search_query=(
                "legal risks unlimited liability "
                "penalties indemnity termination "
                "obligations disputes payment risks"
            ),
            result_count=15,
        )

        # Generate summary.
        summary = await ai_service.analyze_document(
            summary_context,
            "summary",
        )

        # Generate clause analysis.
        clauses = await ai_service.analyze_document(
            clauses_context,
            "clauses",
        )

        # Generate risk analysis.
        risks = await ai_service.analyze_document(
            risks_context,
            "risks",
        )

        # Convert the risk JSON string into an object.
        risks_data = parse_risk_response(risks)

        return {
            "document_id": doc_id,
            "filename": file.filename,
            "pages": document["pages"],
            "chunks": len(document["chunks"]),
            "text_preview": document["text"][:500],
            "summary": summary,
            "clauses": clauses,
            "risks": risks_data,
            "status": "analyzed",
        }

    except HTTPException:
        raise

    except Exception as error:
        print("\n======= FULL ANALYSIS ERROR =======")
        traceback.print_exc()
        print("===================================\n")

        raise HTTPException(
            status_code=500,
            detail=f"Full analysis failed: {str(error)}",
        ) from error


# =============================
# Old Document Chat
# =============================

@app.post("/chat")
async def document_chat(
    doc_id: str,
    query: str,
):
    try:
        if not doc_id.strip():
            raise HTTPException(
                status_code=400,
                detail="Document ID is required.",
            )

        if not query.strip():
            raise HTTPException(
                status_code=400,
                detail="Question is required.",
            )

        context = get_analysis_context(
            doc_id=doc_id,
            search_query=query,
            result_count=5,
        )

        answer = await ai_service.ask_question(
            context,
            query,
        )

        return {
            "answer": answer,
            "mode": "document",
        }

    except HTTPException:
        raise

    except Exception as error:
        print("\n=========== CHAT ERROR ===========")
        traceback.print_exc()
        print("==================================\n")

        raise HTTPException(
            status_code=500,
            detail=f"Chat failed: {str(error)}",
        ) from error


# =============================
# Hybrid AI Lawyer
# =============================

@app.post("/legal-chat")
async def legal_chat(
    request: LegalChatRequest,
):
    try:
        question = request.question.strip()

        if not question:
            raise HTTPException(
                status_code=400,
                detail="Question is required.",
            )

        context = ""

        # Use document context when document_id exists.
        if request.document_id:
            context = vector_service.search_document(
                request.document_id,
                question,
            )

        answer = ask_legal_question(
            context,
            question,
        )

        return {
            "answer": answer,
            "mode": (
                "document"
                if request.document_id
                else "general"
            ),
        }

    except HTTPException:
        raise

    except Exception as error:
        print("\n======== LEGAL CHAT ERROR =========")
        traceback.print_exc()
        print("===================================\n")

        raise HTTPException(
            status_code=500,
            detail=f"Legal chat failed: {str(error)}",
        ) from error


# =============================
# Health Check
# =============================

@app.get("/")
def home():
    return {
        "message": "Lexi Brief API Running",
        "version": "1.0",
        "status": "healthy",
    }


# =============================
# Local Run
# =============================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
    )