import { UploadCloud, FileText, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAnalysis } from "../../context/AnalysisContext";
import { analyzeDocument } from "../../services/api";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function HeroUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { setAnalysis } = useAnalysis();

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      toast.error("Please select a valid PDF file.");
      setFile(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("PDF size must be less than 10 MB.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    toast.success("PDF selected successfully.");
  };

  const handleFileChange = (event) => {
    validateAndSetFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    if (!loading) setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (loading) return;
    validateAndSetFile(event.dataTransfer.files?.[0]);
  };

  const handleRemoveFile = () => {
    if (loading) return;
    setFile(null);
    toast.info("Selected document removed.");
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a PDF document first.");
      return;
    }

    const loadingToast = toast.loading(
      "LexiBrief is analysing your document..."
    );

    try {
      setLoading(true);
      const data = await analyzeDocument(file);
      setAnalysis(data);

      toast.success("Document analysed successfully!", {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Upload error:", error);

      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Document analysis failed.";

      toast.error(errorMessage, {
        id: loadingToast,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-[#0B1120] p-6 sm:p-10">
      <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative z-10 grid items-center gap-12 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300">
            <Sparkles size={16} />
            AI-Powered Legal Intelligence
          </div>

          <h1 className="mt-8 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            Analyse contracts
            <span className="block bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              in seconds
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
            Upload contracts, NDAs, agreements, or other legal documents.
            LexiBrief summarises them, highlights risky clauses, explains legal
            language, and prepares the document for AI-assisted questions.
          </p>

          {file && (
            <div className="mt-8 flex max-w-xl items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
                  <FileText size={22} className="text-indigo-400" />
                </div>

                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-200">
                    {file.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB · PDF document
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveFile}
                disabled={loading}
                aria-label="Remove selected file"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={handleUpload}
              disabled={loading || !file}
              className="flex min-w-52 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-4 font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Analysing document...
                </span>
              ) : (
                "Analyse document"
              )}
            </button>

            <button
              type="button"
              className="rounded-xl border border-slate-700 bg-slate-900 px-8 py-4 font-semibold text-white transition hover:border-indigo-500"
            >
              View demo
            </button>
          </div>
        </div>

        <motion.div
          whileHover={!loading ? { scale: 1.01 } : undefined}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`rounded-3xl border-2 border-dashed p-8 backdrop-blur-xl transition-all duration-300 sm:p-10 ${
            isDragging
              ? "border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
              : "border-indigo-500/40 bg-slate-900/60"
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full text-white transition ${
                isDragging
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                  : "bg-gradient-to-r from-indigo-600 to-blue-600"
              }`}
            >
              <UploadCloud size={42} />
            </div>

            <h3 className="mt-8 text-2xl font-bold text-white">
              {isDragging
                ? "Drop your document here"
                : "Upload your legal document"}
            </h3>

            <p className="mt-3 max-w-sm text-slate-400">
              Drag and drop a PDF here, or choose one from your computer.
            </p>

            <p className="mt-2 text-xs text-slate-500">
              PDF only · Maximum size 10 MB
            </p>

            <label
              className={`mt-8 rounded-xl bg-white px-8 py-4 font-semibold text-slate-900 transition ${
                loading
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:scale-105"
              }`}
            >
              {file ? "Change file" : "Choose file"}

              <input
                type="file"
                accept="application/pdf,.pdf"
                hidden
                disabled={loading}
                onChange={handleFileChange}
              />
            </label>

            <div className="mt-8 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/70 px-5 py-4">
              <FileText className="text-indigo-400" />
              <span className="text-sm text-slate-300">
                {file ? "Document ready for analysis" : "PDF files supported"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}