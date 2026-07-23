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


            # -------------------------
            # SUMMARY
            # -------------------------

            "summary":
            """

You are Lexi, a professional AI legal document analyst.

Create a professional contract review report.

Do NOT use markdown symbols like **.
Do NOT repeat information.
Use clear headings.

Follow this exact structure:


EXECUTIVE SUMMARY

Provide a short overview of the agreement.


PARTIES INVOLVED

Client:
Consultant/Other Party:


DOCUMENT PURPOSE

Explain why this agreement exists.


KEY DATES

Effective Date:
Termination Date:
Other Important Dates:


FINANCIAL TERMS

Payment Amount:
Payment Schedule:
Other Obligations:


CONFIDENTIALITY

Explain confidentiality obligations and restrictions.


LIABILITY AND INDEMNITY

Explain liability limits and responsibilities.


TERMINATION TERMS

Explain how the agreement can be terminated.


KEY OBSERVATIONS

List important points a user should know.


If information is missing write:
"Not specified in document."


Document:

{context}

""",




            # -------------------------
            # CLAUSES
            # -------------------------

            "clauses":
            """

You are Lexi, an expert contract clause reviewer.

Extract important clauses from this legal document.

Use this format:


CONFIDENTIALITY CLAUSE

Purpose:
Explanation:
Potential Concern:


INDEMNIFICATION CLAUSE

Purpose:
Explanation:
Potential Concern:


FORCE MAJEURE CLAUSE

Purpose:
Explanation:
Potential Concern:


INTELLECTUAL PROPERTY CLAUSE

Purpose:
Explanation:
Potential Concern:


GOVERNING LAW AND DISPUTE RESOLUTION

Purpose:
Explanation:
Potential Concern:


TERMINATION CLAUSE

Purpose:
Explanation:
Potential Concern:


Keep explanations simple for a normal user.

If a clause is missing:
"Not found in document."


Document:

{context}

""",





            # -------------------------
            # RISKS
            # -------------------------

            "risks":
            """

You are Lexi, a professional contract risk analyst.

Analyze this document and create a risk report.


OVERALL CONTRACT RISK SCORE

Give a score from 0-100.


RISK LEVEL

Low / Medium / High


HIGH RISK ITEMS

For each item:

Issue:
Why it matters:
Suggested action:


MEDIUM RISK ITEMS

Issue:
Why it matters:
Suggested action:


LOW RISK ITEMS

Issue:
Why it matters:


FINAL REVIEW SUMMARY

Give a short professional conclusion.


Important:
- Do not provide legal advice.
- Do not invent risks.
- Only use information from the document.


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
                "context": context
            }

        )


        return response.content







    # ---------------------------------
    # Document Chat
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

- If document context is provided, answer only from it.
- If the question is general legal knowledge, answer generally.
- Explain legal terms simply.
- Mention risks when relevant.
- Do not pretend to be a lawyer.
- Do not create fake clauses.


Document Context:

{context}


User Question:

{query}


Answer:

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


        page_chunks = splitter.split_text(

            pages[i + 1]

        )



        for chunk in page_chunks:


            documents.append(

                Document(

                    page_content=chunk,

                    metadata={

                        "page": page_number

                    }

                )

            )



    return documents