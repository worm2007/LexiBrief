from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from dotenv import load_dotenv
load_dotenv()
import os
import re
class LegalAIService:
    def __init__(self):
      self.llm = ChatGroq(
    model="llama-3.1-8b-instant",
    groq_api_key=os.getenv("GROQ_API_KEY")
      )



    async def analyze_document(self, context, analysis_type):
        prompts = {
            "summary": "Summarize this into: Executive Summary, Parties, Purpose, Important Dates, Payment Terms, Confidentiality, Liability, Termination. Cite pages as [Page X].",
            "clauses": "Extract and categorize: Confidentiality, Indemnification, Force Majeure, Governing Law, Arbitration, IP. Use bullet points.",
            "risks": "Identify risky clauses. Assign Risk Level (Low, Medium, High). State that this is not legal advice."
        }
        prompt = ChatPromptTemplate.from_template(prompts[analysis_type] + "\n\nContext:\n{context}")
        chain = prompt | self.llm
        res = await chain.ainvoke({"context": context})
        return res.content

    async def ask_question(self, context, query):
        prompt = ChatPromptTemplate.from_template("Answer based ONLY on context. If unknown, say so.\nContext: {context}\nQuestion: {query}")
        chain = prompt | self.llm
        res = await chain.ainvoke({"context": context, "query": query})
        return res.content

def chunk_legal_document(text):
    pages = re.split(r'--- PAGE (\d+) ---', text)
    docs = []
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    for i in range(1, len(pages), 2):
        page_num = pages[i]
        chunks = splitter.split_text(pages[i+1])
        for c in chunks:
            docs.append(Document(page_content=c, metadata={"page": page_num}))
    return docs
def get_llm():
    return llm