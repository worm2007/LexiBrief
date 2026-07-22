import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS


class VectorStoreService:

    def __init__(self):

        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )


    def create_and_save_index(self, chunks, doc_id):

        vs = FAISS.from_documents(chunks, self.embeddings)
        vs.save_local(f"vector_indices/{doc_id}")


    def load_index(self, doc_id):

        return FAISS.load_local(
            f"vector_indices/{doc_id}",
            self.embeddings,
            allow_dangerous_deserialization=True
        )