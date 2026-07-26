from services.ai_service import get_llm


def ask_legal_question(context: str | None, question: str) -> str:
    """Answer general legal questions and document-related questions.

    When document context is supplied, the model decides whether the question
    concerns that document. It must use the context for document-specific
    claims, but may still answer unrelated general legal questions normally.
    """
    llm = get_llm()
    clean_question = (question or "").strip()
    clean_context = (context or "").strip()

    if clean_context:
        prompt = f"""
You are LexiBrief AI, a careful legal-information assistant.

An uploaded legal document is available below. First decide whether the user's
question is about that document or is a general legal question.

UPLOADED DOCUMENT CONTEXT:
{clean_context}

USER QUESTION:
{clean_question}

Instructions:
- If the question refers to the uploaded document, contract, agreement,
  clauses, parties, dates, payment terms, obligations, risks, termination, or
  asks words such as "this", "it", "the document" or "my contract", answer
  from the supplied document context.
- For a document-specific answer, do not invent facts. Clearly say when the
  requested information is not present in the supplied context.
- If the question is general and unrelated to the uploaded document, answer it
  using general legal knowledge even though a document is available.
- Explain legal terms in simple language and use short headings or bullet
  points when helpful.
- Mention that laws vary by jurisdiction when that matters.
- Do not claim to be a lawyer and do not present the answer as personalised
  legal advice.
"""
    else:
        prompt = f"""
You are LexiBrief AI, a careful legal-information assistant.

USER QUESTION:
{clean_question}

Instructions:
- Answer the general legal question clearly and accurately.
- Explain legal terms in simple language and use short examples when helpful.
- Mention that laws vary by jurisdiction when that matters.
- Do not claim to be a lawyer and do not present the answer as personalised
  legal advice.
- If the user asks for a conclusion that depends on facts, jurisdiction, or a
  document you have not received, explain what information would be needed.
"""

    response = llm.invoke(prompt)
    content = getattr(response, "content", response)
    return str(content).strip()
