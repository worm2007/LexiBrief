from services.ai_service import get_llm


def ask_legal_question(context, question):

    llm = get_llm()

    if context:

        prompt = f"""
You are Lexi, an AI Legal Assistant.

Answer using the document context.

Document:
{context}

Question:
{question}

Rules:
- Explain clearly.
- Mention risks.
- Do not invent clauses.
"""

    else:

        prompt = f"""
You are Lexi, an AI Legal Assistant.

Answer this general legal question.

Question:
{question}

Rules:
- Give accurate legal information.
- Explain simply.
- Mention that laws vary by country/jurisdiction.
- Do not pretend to be a human lawyer.
"""


    response = llm.invoke(prompt)

    return response.content