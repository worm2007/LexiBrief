from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from dotenv import load_dotenv

import os
import re


load_dotenv()



# ---------------------------------
# LLM Configuration
# ---------------------------------

def get_llm():

    return ChatGroq(

        model="llama-3.1-8b-instant",

        groq_api_key=os.getenv("GROQ_API_KEY"),

        temperature=0.2

    )





# ---------------------------------
# Legal AI Service
# ---------------------------------

class LegalAIService:


    def __init__(self):

        self.llm = get_llm()





    async def analyze_document(
        self,
        context,
        analysis_type
    ):


        prompts = {


            # =========================
            # SUMMARY
            # =========================

            "summary":

            """

You are Lexi, a professional AI legal document analyst.

Create a clean professional contract report.

Rules:

- Use simple professional language.
- Do not use markdown symbols.
- Do not repeat information.
- If information is missing write:
Not specified in document.


Format:


EXECUTIVE SUMMARY

Brief overview of the agreement.


PARTIES INVOLVED

Client:
Other Party:


DOCUMENT PURPOSE

Purpose of agreement.


KEY DATES

Effective Date:
Expiry/Termination Date:


FINANCIAL TERMS

Payment:
Payment Schedule:
Other obligations:


CONFIDENTIALITY

Explain confidentiality obligations.


LIABILITY AND INDEMNITY

Explain responsibilities and limitations.


TERMINATION TERMS

Explain termination conditions.


KEY OBSERVATIONS

Important points user should know.



Document:

{context}

""",





            # =========================
            # CLAUSES
            # =========================

            "clauses":

            """

You are Lexi, an expert contract reviewer.


Extract important clauses.


Format:


CONFIDENTIALITY CLAUSE

Purpose:
Explanation:
Risk:


INDEMNIFICATION CLAUSE

Purpose:
Explanation:
Risk:


FORCE MAJEURE CLAUSE

Purpose:
Explanation:
Risk:


INTELLECTUAL PROPERTY CLAUSE

Purpose:
Explanation:
Risk:


GOVERNING LAW

Purpose:
Explanation:
Risk:


TERMINATION CLAUSE

Purpose:
Explanation:
Risk:



Rules:

- Explain for normal users.
- Do not invent clauses.
- If missing say:
Not found in document.


Document:

{context}

""",





            # =========================
            # RISKS
            # =========================

            "risks":

            """

You are Lexi, a professional contract risk analyst.


Analyze the legal document.

Return ONLY valid JSON.

Do not add markdown.
Do not add explanations outside JSON.


Use exactly this structure:


{
 "risk_score": 0,
 "risk_level": "",
 "high_risks": [
   {
    "issue":"",
    "impact":"",
    "recommendation":""
   }
 ],
 "medium_risks": [
   {
    "issue":"",
    "impact":"",
    "recommendation":""
   }
 ],
 "low_risks": [
   {
    "issue":"",
    "impact":""
   }
 ],
 "summary":""
}



Rules:

- risk_score must be between 0 and 100.
- 0 means very safe.
- 100 means very risky.
- Only use information from the document.
- Do not provide legal advice.


Document:

{context}

"""

        }




        if analysis_type not in prompts:

            return "Invalid analysis type"




        prompt = ChatPromptTemplate.from_template(

            prompts[analysis_type]

        )



        chain = prompt | self.llm



        response = await chain.ainvoke(

            {
                "context":context
            }

        )



        return response.content






    # ---------------------------------
    # AI Lawyer Chat
    # ---------------------------------

    async def ask_question(
        self,
        context,
        query
    ):


        prompt = ChatPromptTemplate.from_template(

            """

You are Lexi, an AI legal assistant.


Answer the user's question.


Rules:

- Use document context when available.
- For general questions answer normally.
- Explain legal terms simply.
- Mention risks when required.
- Do not claim to be a human lawyer.
- Do not create fake information.



Document Context:

{context}



Question:

{query}



Answer:

"""

        )



        chain = prompt | self.llm



        response = await chain.ainvoke(

            {

            "context":context,

            "query":query

            }

        )



        return response.content






# ---------------------------------
# Document Chunking
# ---------------------------------

def chunk_legal_document(text):


    pages = re.split(

        r'--- PAGE (\d+) ---',

        text

    )


    documents = []



    splitter = RecursiveCharacterTextSplitter(

        chunk_size=1000,

        chunk_overlap=150

    )



    for i in range(

        1,

        len(pages),

        2

    ):


        page_number = pages[i]



        chunks = splitter.split_text(

            pages[i+1]

        )



        for chunk in chunks:


            documents.append(

                Document(

                    page_content=chunk,

                    metadata={

                        "page":page_number

                    }

                )

            )



    return documents