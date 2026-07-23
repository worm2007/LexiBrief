from dotenv import load_dotenv
load_dotenv()

import os
import uuid
import shutil

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from utils.pdf_handler import extract_text_from_pdf
from services.ai_service import LegalAIService, chunk_legal_document
from services.vector_store import VectorStoreService
from services.legal_chat import ask_legal_question


# -----------------------------
# Create FastAPI App
# -----------------------------

app = FastAPI(
    title="Lexi Brief API",
    version="1.0"
)


# -----------------------------
# CORS
# -----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Directories
# -----------------------------

UPLOAD_DIR = "uploads"
VECTOR_DIR = "vector_indices"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(VECTOR_DIR, exist_ok=True)



# -----------------------------
# Initialize Services
# -----------------------------

ai_service = LegalAIService()
vector_service = VectorStoreService()



# -----------------------------
# Request Models
# -----------------------------

class AnalyzeRequest(BaseModel):
    doc_id: str
    type: str



# -----------------------------
# Upload PDF
# -----------------------------

@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...)
):

    try:

        doc_id = str(uuid.uuid4())


        file_path = os.path.join(
            UPLOAD_DIR,
            f"{doc_id}.pdf"
        )


        with open(file_path, "wb") as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )


        # Extract PDF text
        text = extract_text_from_pdf(
            file_path
        )


        # Split into chunks
        chunks = chunk_legal_document(
            text
        )


        # Create FAISS index
        vector_service.create_and_save_index(
            chunks,
            doc_id
        )


        return {

            "document_id": doc_id,

            "text_preview": text[:500]

        }


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )



# -----------------------------
# Analyze Document
# -----------------------------

@app.post("/analyze")
async def analyze_document(
    req: AnalyzeRequest
):

    try:


        vectorstore = vector_service.load_index(
            req.doc_id
        )


        docs = vectorstore.similarity_search(
            "General overview of contract",
            k=15
        )


        context = "\n\n".join(

            [
                doc.page_content
                for doc in docs
            ]

        )


        result = await ai_service.analyze_document(
            context,
            req.type
        )


        return {

            "result": result

        }


    except Exception as e:


        raise HTTPException(
            status_code=500,
            detail=str(e)
        )



# -----------------------------
# Existing Document Chat
# -----------------------------

@app.post("/chat")
async def document_chat(
    doc_id: str,
    query: str
):

    try:


        vectorstore = vector_service.load_index(
            doc_id
        )


        retriever = vectorstore.as_retriever(
            search_kwargs={
                "k": 5
            }
        )


        docs = retriever.get_relevant_documents(
            query
        )


        context = "\n\n".join(

            [
                doc.page_content
                for doc in docs
            ]

        )


        answer = await ai_service.ask_question(
            context,
            query
        )


        return {

            "answer": answer

        }


    except Exception as e:


        raise HTTPException(
            status_code=500,
            detail=str(e)
        )



# -----------------------------
# Hybrid AI Lawyer
# Document + General Questions
# -----------------------------

@app.post("/legal-chat")
async def legal_chat(
    data: dict
):

    try:


        document_id = data.get(
            "document_id"
        )


        question = data.get(
            "question"
        )


        if not question:

            raise HTTPException(

                status_code=400,

                detail="Question is required"

            )


        context = ""


        # If document exists,
        # search inside document

        if document_id:


            context = vector_service.search_document(

                document_id,

                question

            )


        # Generate Lexi response

        answer = ask_legal_question(

            context,

            question

        )


        return {


            "answer": answer,


            "mode":
            "document"
            if document_id
            else "general"


        }


    except Exception as e:


        raise HTTPException(

            status_code=500,

            detail=str(e)

        )



# -----------------------------
# Run Server
# -----------------------------

if __name__ == "__main__":

    import uvicorn


    uvicorn.run(

        app,

        host="0.0.0.0",

        port=8000

    )