import axios from "axios";

const api = axios.create({
baseURL:
  import.meta.env.VITE_API_URL ||
  "https://lexibrief-backend.onrender.com",
  timeout: 180000,
});

export const analyzeDocument = async (file) => {
  if (!file) {
    throw new Error("Please select a PDF file.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/full-analysis", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const askLegalQuestion = async ({
  question,
  documentId = null,
}) => {
  if (!question?.trim()) {
    throw new Error("Please enter a question.");
  }

  const response = await api.post("/legal-chat", {
    question: question.trim(),
    document_id: documentId,
  });

  return response.data;
};

export default api;