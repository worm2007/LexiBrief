from services.ai_service import get_llm


def ask_legal_question(context, question):

    try:

        llm = get_llm()


        # -----------------------------
        # Document Based Legal Assistant
        # -----------------------------

        if context and context.strip():


            prompt = f"""

You are Lexi, an AI Legal Assistant.

You are answering a question about an uploaded legal document.

Use ONLY the provided document context.

Document Context:
-----------------
{context}
-----------------

User Question:
{question}


Instructions:

- Explain legal terms in simple language.
- Answer directly from the document.
- Mention risks if they exist.
- Mention important clauses if relevant.
- Do not create information that is not present.
- If the answer is not available in the document, say:
  "This information is not present in the uploaded document."

"""


        # -----------------------------
        # General Legal Assistant
        # -----------------------------

        else:


            prompt = f"""

You are Lexi, an AI Legal Assistant.

Answer the following general legal question.

Question:
{question}


Instructions:

- Explain clearly in simple language.
- Provide useful legal information.
- Explain concepts with examples when helpful.
- Mention that laws can vary by country and jurisdiction.
- Do not pretend to be a human lawyer.
- Do not provide false legal claims.

"""



        response = llm.invoke(prompt)


        return response.content



    except Exception as e:


        print(
            "LEGAL CHAT ERROR:",
            str(e)
        )


        return (
            "Sorry, I am unable to answer "
            "your legal question right now."
        )