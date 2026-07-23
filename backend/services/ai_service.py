from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from dotenv import load_dotenv

import os
import re
import json

load_dotenv()


# ----------------------------
# LLM
# ----------------------------

def get_llm():
    return ChatGroq(
        model="llama-3.1-8b-instant",
        groq_api_key=os.getenv("GROQ_API_KEY"),
        temperature=0.2
    )


# ----------------------------
# AI Service
# ----------------------------

class LegalAIService:

    def __init__(self):
        self.llm = get_llm()


    async def analyze_document(self, context, analysis_type):

        prompts = {

            "summary": """
You are Lexi Brief, a senior legal document analyst.

Create a professional contract review.

Use these headings:

EXECUTIVE SUMMARY

PARTIES INVOLVED

DOCUMENT PURPOSE

IMPORTANT DATES

PAYMENT TERMS

CONFIDENTIALITY

LIABILITY

TERMINATION

KEY OBSERVATIONS

Write professionally.
Do NOT use markdown.
Do NOT repeat information.

If something is missing write:
"Not specified in document."

Document:

{context}
""",

            "clauses": """
You are Lexi Brief.

Extract the major legal clauses.

For each clause include

Clause Name

Purpose

Simple Explanation

Potential Concern

Include

Confidentiality

Indemnification

Force Majeure

Intellectual Property

Termination

Dispute Resolution

Only use document information.

Document:

{context}
""",

            "risks": """
You are an expert legal risk analyst.

Analyze the document.

Return ONLY valid JSON.

Use exactly these keys.

risk_score
risk_level
high_risks
medium_risks
low_risks
summary

Example format

{{
  "risk_score":72,
  "risk_level":"Medium",
  "high_risks":[
    {{
      "issue":"Unlimited liability",
      "impact":"Financial exposure",
      "recommendation":"Negotiate liability cap"
    }}
  ],
  "medium_risks":[
    {{
      "issue":"Termination notice",
      "impact":"Business disruption",
      "recommendation":"Increase notice period"
    }}
  ],
  "low_risks":[
    {{
      "issue":"Minor ambiguity",
      "impact":"Low impact"
    }}
  ],
  "summary":"Overall moderate risk."
}}

Return ONLY JSON.

Document:

{context}
"""
        }

        prompt = ChatPromptTemplate.from_template(
            prompts[analysis_type]
        )

        chain = prompt | self.llm

        response = await chain.ainvoke({
            "context": context
        })

        text = response.content.strip()

        # Make sure JSON is valid
        if analysis_type == "risks":

            try:
                json.loads(text)
                return text

            except Exception:

                fallback = {
                    "risk_score": 50,
                    "risk_level": "Medium",
                    "high_risks": [],
                    "medium_risks": [],
                    "low_risks": [],
                    "summary": text
                }

                return json.dumps(fallback)

        return text


    async def ask_question(self, context, query):

        prompt = ChatPromptTemplate.from_template(
            """
You are Lexi Brief AI.

If document context exists,
answer ONLY from the document.

If no document context exists,
answer as a professional legal assistant.

Never invent clauses.

Explain legal concepts in simple English.

Mention this is not legal advice whenever appropriate.

Document:

{context}

Question:

{query}
"""
        )

        chain = prompt | self.llm

        response = await chain.ainvoke({
            "context": context,
            "query": query
        })

        return response.content


# ----------------------------
# Chunk PDF
# ----------------------------
def chunk_legal_document(text):

    pages = re.split(r'--- PAGE (\d+) ---', text)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200,
        chunk_overlap=200
    )

    docs = []

    for i in range(1, len(pages), 2):

        page = pages[i]

        # Prevent IndexError
        if i + 1 >= len(pages):
            continue

        page_text = pages[i + 1].strip()

        if not page_text:
            continue

        chunks = splitter.split_text(page_text)

        for chunk in chunks:
            docs.append(
                Document(
                    page_content=chunk,
                    metadata={
                        "page": int(page)
                    }
                )
            )

    return docs


    