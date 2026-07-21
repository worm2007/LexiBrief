from dotenv import load_dotenv
load_dotenv()
import os, uuid, shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from utils.pdf_handler import extract_text_from_pdf
from services.ai_service import LegalAIService, chunk_legal_document
from services.vector_store import VectorStoreService

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ai_service = LegalAIService()
vector_service = VectorStoreService()

class AnalyzeRequest(BaseModel):
    doc_id: str
    type: str  # 'summary', 'clauses', or 'risks'

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    doc_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}.pdf")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    text = extract_text_from_pdf(file_path)
    chunks = chunk_legal_document(text)
    vector_service.create_and_save_index(chunks, doc_id)
    
    return {"document_id": doc_id, "text_preview": text[:500]}

@app.post("/analyze")
async def analyze_doc(req: AnalyzeRequest):
    # Load full context for summary/clauses/risks
    vectorstore = vector_service.load_index(req.doc_id)
    # Get top 15 chunks to have enough context for a full analysis
    docs = vectorstore.similarity_search("General overview of contract", k=15)
    context = "\n\n".join([f"[Page {d.metadata['page']}]: {d.page_content}" for d in docs])
    
    result = await ai_service.analyze_document(context, req.type)
    return {"result": result}

@app.post("/chat")
async def chat(doc_id: str, query: str):
    vectorstore = vector_service.load_index(doc_id)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
    # Simple RAG call
    context_docs = retriever.get_relevant_documents(query)
    context = "\n\n".join([d.page_content for d in context_docs])
    
    ans = await ai_service.ask_question(context, query)
    return {"answer": ans}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)