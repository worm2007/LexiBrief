from __future__ import annotations

import json
import os
import re
from typing import Any

from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_text_splitters import RecursiveCharacterTextSplitter


load_dotenv()


# ----------------------------
# LLM
# ----------------------------

def get_llm() -> ChatGroq:
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise ValueError(
            "GROQ_API_KEY is missing. Add it to the backend .env file."
        )

    return ChatGroq(
        model="llama-3.1-8b-instant",
        groq_api_key=api_key,
        temperature=0.2,
    )


# ----------------------------
# JSON Helpers
# ----------------------------

def clean_json_response(text: str) -> str:
    """
    Remove common Markdown code fences and surrounding text from an AI JSON response.
    """
    cleaned = (text or "").strip()

    if cleaned.startswith("```json"):
        cleaned = cleaned[7:].strip()
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:].strip()

    if cleaned.endswith("```"):
        cleaned = cleaned[:-3].strip()

    return cleaned


def parse_clause_response(text: str) -> list[dict[str, str]]:
    """
    Convert the clause response into a safe list of clause dictionaries.
    """
    cleaned = clean_json_response(text)

    try:
        parsed: Any = json.loads(cleaned)
    except (json.JSONDecodeError, TypeError):
        return []

    if isinstance(parsed, dict):
        parsed = parsed.get("clauses", [])

    if not isinstance(parsed, list):
        return []

    clauses: list[dict[str, str]] = []

    for item in parsed:
        if isinstance(item, str):
            value = item.strip()

            if value:
                clauses.append(
                    {
                        "title": "Legal Clause",
                        "description": value,
                    }
                )

            continue

        if not isinstance(item, dict):
            continue

        title = str(
            item.get("title")
            or item.get("name")
            or item.get("clause_name")
            or "Legal Clause"
        ).strip()

        description = str(
            item.get("description")
            or item.get("explanation")
            or item.get("content")
            or item.get("text")
            or ""
        ).strip()

        if not description:
            continue

        clause = {
            "title": title,
            "description": description,
        }

        purpose = item.get("purpose")
        concern = item.get("potential_concern") or item.get("concern")

        if purpose:
            clause["purpose"] = str(purpose).strip()

        if concern:
            clause["potential_concern"] = str(concern).strip()

        clauses.append(clause)

    return clauses


def validate_risk_response(text: str) -> str:
    """
    Return a valid JSON string for the existing main.py risk parser.
    """
    cleaned = clean_json_response(text)

    fallback = {
        "risk_score": 50,
        "risk_level": "Medium",
        "high_risks": [],
        "medium_risks": [],
        "low_risks": [],
        "summary": text.strip() if text else "Risk analysis could not be generated.",
    }

    try:
        parsed: Any = json.loads(cleaned)

        if not isinstance(parsed, dict):
            return json.dumps(fallback)

        result = {
            "risk_score": parsed.get("risk_score", 50),
            "risk_level": parsed.get("risk_level", "Medium"),
            "high_risks": parsed.get("high_risks", []),
            "medium_risks": parsed.get("medium_risks", []),
            "low_risks": parsed.get("low_risks", []),
            "summary": parsed.get(
                "summary",
                "No overall risk summary was generated.",
            ),
        }

        return json.dumps(result)

    except (json.JSONDecodeError, TypeError):
        return json.dumps(fallback)


# ----------------------------
# AI Service
# ----------------------------

class LegalAIService:
    def __init__(self) -> None:
        self.llm = get_llm()

    async def analyze_document(
        self,
        context: str,
        analysis_type: str,
    ) -> Any:
        prompts = {
            "summary": """
You are Lexi Brief, a senior legal document analyst.

Create a clear, accurate and professional contract review using only the
information present in the supplied document context.

Use exactly these Markdown headings:

## Executive Summary
## Parties Involved
## Document Purpose
## Important Dates
## Payment Terms
## Confidentiality
## Liability
## Termination
## Key Observations

Formatting rules:

- Use proper Markdown headings beginning with ##.
- Use concise paragraphs.
- Use bullet points where they improve readability.
- Use bold labels only inside bullet points when useful.
- Do not repeat the same information across sections.
- Do not invent facts, dates, parties, amounts or obligations.
- When information is absent, write: Not specified in the document.
- Keep the tone professional and easy to understand.
- Do not include a legal disclaimer in this summary.

Document context:

{context}
""",
            "clauses": """
You are Lexi Brief, a senior legal contract analyst.

Extract the important legal clauses that are actually present in the supplied
document context.

Return ONLY a valid JSON array. Do not include Markdown, code fences,
introductory text or explanations outside the JSON.

Use this exact structure:

[
  {{
    "title": "Payment Terms",
    "description": "The client must pay the stated amount within the specified period.",
    "purpose": "Explains the payment obligation.",
    "potential_concern": "State a genuine concern found in the document, or write None."
  }},
  {{
    "title": "Termination",
    "description": "Either party may terminate under the stated conditions.",
    "purpose": "Explains how the agreement can end.",
    "potential_concern": "State a genuine concern found in the document, or write None."
  }}
]

Rules:

- Return a JSON array, even when only one clause is found.
- Include only clauses supported by the document context.
- Do not invent missing clauses.
- Keep each description specific and concise.
- Use "None" when a clause has no obvious concern.
- Look for clauses including payment, confidentiality, termination, liability,
  indemnification, intellectual property, governing law, force majeure,
  dispute resolution, renewal, notice and warranties.
- If no identifiable clauses are found, return [].

Document context:

{context}
""",
            "risks": """
You are Lexi Brief, an expert legal risk analyst.

Analyze only the supplied document context and identify practical contractual
risks.

Return ONLY valid JSON. Do not include Markdown or code fences.

Use exactly this structure:

{{
  "risk_score": 72,
  "risk_level": "Medium",
  "high_risks": [
    {{
      "issue": "Unlimited liability",
      "impact": "Could create substantial financial exposure.",
      "recommendation": "Negotiate a reasonable liability cap."
    }}
  ],
  "medium_risks": [
    {{
      "issue": "Short termination notice",
      "impact": "Could cause operational disruption.",
      "recommendation": "Consider a longer notice period."
    }}
  ],
  "low_risks": [
    {{
      "issue": "Minor drafting ambiguity",
      "impact": "May create limited uncertainty.",
      "recommendation": "Clarify the wording."
    }}
  ],
  "summary": "Overall assessment of the contract risk."
}}

Rules:

- risk_score must be an integer from 0 to 100.
- risk_level must be Low, Medium, High or Critical.
- Each risk must contain issue, impact and recommendation.
- Use empty arrays when no risks exist in a category.
- Do not invent risks unsupported by the document.
- Return only the JSON object.

Document context:

{context}
""",
        }

        if analysis_type not in prompts:
            raise ValueError(
                "Invalid analysis type. Use summary, clauses, or risks."
            )

        prompt = ChatPromptTemplate.from_template(
            prompts[analysis_type]
        )

        chain = prompt | self.llm

        response = await chain.ainvoke(
            {
                "context": context,
            }
        )

        text = str(response.content).strip()

        if analysis_type == "clauses":
            return parse_clause_response(text)

        if analysis_type == "risks":
            return validate_risk_response(text)

        return text

    async def ask_question(
        self,
        context: str,
        query: str,
    ) -> str:
        prompt = ChatPromptTemplate.from_template(
            """
You are Lexi Brief AI, a professional legal document assistant.

Instructions:

- When document context is available, answer from that context.
- Clearly state when the document does not contain the requested information.
- Never invent clauses, dates, amounts, parties or obligations.
- Explain legal concepts in simple English.
- Keep the answer concise but useful.
- Mention that the response is not legal advice when appropriate.

Document context:

{context}

Question:

{query}
"""
        )

        chain = prompt | self.llm

        response = await chain.ainvoke(
            {
                "context": context,
                "query": query,
            }
        )

        return str(response.content).strip()


# ----------------------------
# Chunk PDF
# ----------------------------

def chunk_legal_document(text: str) -> list[Document]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200,
        chunk_overlap=200,
    )

    documents: list[Document] = []

    page_matches = re.split(
        r"--- PAGE (\d+) ---",
        text,
    )

    # Handle PDFs whose extracted text contains page markers.
    if len(page_matches) > 1:
        for index in range(1, len(page_matches), 2):
            if index + 1 >= len(page_matches):
                continue

            page_number = page_matches[index]
            page_text = page_matches[index + 1].strip()

            if not page_text:
                continue

            for chunk in splitter.split_text(page_text):
                documents.append(
                    Document(
                        page_content=chunk,
                        metadata={
                            "page": int(page_number),
                        },
                    )
                )

        return documents

    # Fallback for extracted text without page markers.
    for chunk in splitter.split_text(text.strip()):
        if not chunk:
            continue

        documents.append(
            Document(
                page_content=chunk,
                metadata={
                    "page": 1,
                },
            )
        )

    return documents