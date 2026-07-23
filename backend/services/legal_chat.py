from services.ai_service import get_llm



def ask_legal_question(context, question):

    try:

        # Create LLM instance
        llm = get_llm()


        if context and context.strip():

            prompt = f"""
You are Lexi, an AI Legal Assistant.

Answer the user's question using ONLY the provided legal document.

Document:
{context}


Question:
{question}


Rules:
- Explain legal terms simply.
- Mention risks if present.
- Do not create information.
- If the answer is not in the document, say:
  "This information is not available in the uploaded document."
"""


        else:

            prompt = f"""
You are Lexi, an AI Legal Assistant.

Answer this general legal question:

Question:
{question}


Rules:
- Explain clearly.
- Give simple examples.
- Mention that laws depend on jurisdiction.
- Do not pretend to be a human lawyer.
"""



        response = llm.invoke(prompt)


        return response.content



    except Exception as e:

        print(
            "LEGAL CHAT FUNCTION ERROR:",
            repr(e)
        )

        raise e