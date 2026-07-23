from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from dotenv import load_dotenv

import os
import re


load_dotenv()



# -----------------------------
# Global LLM function
# -----------------------------

def get_llm():

    return ChatGroq(

        model="llama-3.1-8b-instant",

        groq_api_key=os.getenv(
            "GROQ_API_KEY"
        ),

        temperature=0.2

    )




# -----------------------------
# Legal AI Service
# -----------------------------

class LegalAIService:


    def __init__(self):

        self.llm = get_llm()



    async def analyze_document(
        self,
        context,
        analysis_type
    ):


        prompts = {


            "summary":
            """
Summarize this legal document into:

- Executive Summary
- Parties
- Purpose
- Important Dates
- Payment Terms
- Confidentiality
- Liability
- Termination

Mention page numbers where possible.
""",



            "clauses":
            """
Extract and categorize these clauses:

- Confidentiality
- Indemnification
- Force Majeure
- Governing Law
- Arbitration
- Intellectual Property

Use bullet points.
""",



            "risks":
            """
Analyze risky clauses.

For each risk provide:

- Risk Level (Low/Medium/High)
- Explanation
- Possible impact

Mention this is not legal advice.
"""

        }



        prompt = ChatPromptTemplate.from_template(

            prompts[analysis_type]
            +
            """

Document:

{context}

"""

        )


        chain = prompt | self.llm


        response = await chain.ainvoke(

            {
                "context": context
            }

        )


        return response.content





    async def ask_question(
        self,
        context,
        query
    ):


        prompt = ChatPromptTemplate.from_template(

            """
Answer the legal question.

Use ONLY the provided context.

Context:

{context}


Question:

{query}


If the answer is not available,
say it is not present.
"""

        )


        chain = prompt | self.llm


        response = await chain.ainvoke(

            {
                "context": context,

                "query": query
            }

        )


        return response.content





# -----------------------------
# Document Chunking
# -----------------------------

def chunk_legal_document(text):


    pages = re.split(
        r'--- PAGE (\d+) ---',
        text
    )


    docs = []


    splitter = RecursiveCharacterTextSplitter(

        chunk_size=1000,

        chunk_overlap=100

    )


    for i in range(
        1,
        len(pages),
        2
    ):


        page_num = pages[i]


        chunks = splitter.split_text(
            pages[i+1]
        )


        for chunk in chunks:


            docs.append(

                Document(

                    page_content=chunk,

                    metadata={
                        "page": page_num
                    }

                )

            )


    return docs