from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AnalyzeRequest(BaseModel):
    doc_id: str
    type: str


class LegalChatRequest(BaseModel):
    question: str
    document_id: str | None = None
