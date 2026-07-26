import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://lexibrief-backend.onrender.com",
  timeout: 180000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("lexibrief_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
export const analyzeDocument = async (file) => {
  if (!file) {
    throw new Error("Please select a PDF file.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/full-analysis", formData);

  return response.data;
};
export const analyzeGuestDocument = async (file) => {
  if (!file) {
    throw new Error("Please select a PDF file.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/analyze-guest", formData);

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

export const getDocuments = async () => {
  const response = await api.get("/documents");

  return Array.isArray(response.data) ? response.data : [];
};

export const getDocument = async (documentId) => {
  if (!documentId) {
    throw new Error("Document ID is required.");
  }

  const response = await api.get(`/documents/${documentId}`);

  return response.data;
};

export const deleteDocument = async (documentId) => {
  if (!documentId) {
    throw new Error("Document ID is required.");
  }

  const response = await api.delete(`/documents/${documentId}`);

  return response.data;
};

export default api;