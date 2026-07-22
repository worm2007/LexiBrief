import os
from dotenv import load_dotenv

print("Step 1")

load_dotenv()

print("Step 2")

print("API Key Found:", os.getenv("GOOGLE_API_KEY") is not None)

from langchain_google_genai import GoogleGenerativeAIEmbeddings

print("Step 3")

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
)

print("Step 4")

result = embeddings.embed_query("Hello world")

print("Success!")
print(result[:5])
