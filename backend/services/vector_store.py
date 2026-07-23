import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS


class VectorStoreService:

    def __init__(self):
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=os.getenv("GOOGLE_API_KEY"),
        )


    def create_and_save_index(self, chunks, doc_id):
        vectorstore = FAISS.from_documents(
            chunks,
            self.embeddings
        )

        vectorstore.save_local(
            f"vector_indices/{doc_id}"
        )


    def load_index(self, doc_id):
        return FAISS.load_local(
            f"vector_indices/{doc_id}",
            self.embeddings,
            allow_dangerous_deserialization=True,
        )


    def search_document(self, doc_id, question):

        vectorstore = self.load_index(doc_id)

        results = vectorstore.similarity_search(
            question,
            k=5
        )

        context = "\n\n".join(
            [doc.page_content for doc in results]
        )

        return context