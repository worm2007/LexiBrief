import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { getDocument, getDocuments } from "../services/api";

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  const [analysis, setAnalysis] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const refreshDocuments = useCallback(async () => {
    setDocumentsLoading(true);

    try {
      const savedDocuments = await getDocuments();

      setDocuments(Array.isArray(savedDocuments) ? savedDocuments : []);

      return savedDocuments;
    } catch (error) {
      setDocuments([]);

      throw error;
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  const openDocument = useCallback(async (documentId) => {
    if (!documentId) {
      throw new Error("Document ID is required.");
    }

    setAnalysisLoading(true);

    try {
      const savedDocument = await getDocument(documentId);

      const normalisedAnalysis = {
        ...savedDocument,
        documentId:
          savedDocument.document_id ??
          savedDocument.documentId ??
          documentId,
        document_id:
          savedDocument.document_id ??
          savedDocument.documentId ??
          documentId,
        summary: savedDocument.summary ?? "",
        clauses: Array.isArray(savedDocument.clauses)
          ? savedDocument.clauses
          : [],
        risks: savedDocument.risks ?? null,
      };

      setAnalysis(normalisedAnalysis);

      return normalisedAnalysis;
    } finally {
      setAnalysisLoading(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
  }, []);

  const value = useMemo(
    () => ({
      analysis,
      setAnalysis,
      clearAnalysis,

      documents,
      setDocuments,
      documentsLoading,
      refreshDocuments,

      analysisLoading,
      openDocument,
    }),
    [
      analysis,
      clearAnalysis,
      documents,
      documentsLoading,
      refreshDocuments,
      analysisLoading,
      openDocument,
    ]
  );

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);

  if (!context) {
    throw new Error(
      "useAnalysis must be used inside an AnalysisProvider."
    );
  }

  return context;
}