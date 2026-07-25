
import { UploadCloud, FileText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAnalysis } from "../../context/AnalysisContext";
import { analyzeDocument } from "../../services/api";
import { toast } from "sonner";
export default function HeroUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setAnalysis } = useAnalysis();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      alert("Please select a PDF file.");
      event.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

 const handleUpload = async () => {
  if (!file) {
    toast.error("Please select a PDF document first.");
    return;
  }

  const loadingToast = toast.loading("Analysing your document...");

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
    <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-[#0B1120] p-10">
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

      <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative z-10 grid items-center gap-12 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-indigo-300">
            <Sparkles size={16} />
            AI Powered Legal Intelligence
          </div>

          <h1 className="mt-8 text-6xl font-extrabold leading-tight text-white">
            Analyze Contracts

            <span className="block bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              in Seconds
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
            Upload agreements, contracts, NDAs, or legal documents and let
            LexiBrief summarize them, detect risky clauses, explain legal
            language, and answer your questions using AI.
          </p>

          <div className="mt-10 flex flex-wrap gap-5">
            <button
              type="button"
              onClick={handleUpload}
              disabled={loading || !file}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-4 font-semibold text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? "Analyzing Document..." : "Analyze Document"}
            </button>

            <button
              type="button"
              className="rounded-xl border border-slate-700 bg-slate-900 px-8 py-4 font-semibold text-white transition hover:border-indigo-500"
            >
              View Demo
            </button>
          </div>

          {file && (
            <div className="mt-5 flex items-center gap-3 text-sm text-slate-300">
              <FileText size={18} className="text-indigo-400" />

              <span className="max-w-md truncate">{file.name}</span>
            </div>
          )}
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-3xl border-2 border-dashed border-indigo-500/40 bg-slate-900/60 p-10 backdrop-blur-xl"
        >
          <div className="flex flex-col items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
              <UploadCloud size={42} />
            </div>

            <h3 className="mt-8 text-2xl font-bold text-white">
              Upload Your PDF
            </h3>

            <p className="mt-3 text-center text-slate-400">
              Select a legal document for complete AI analysis.
            </p>

            <label className="mt-8 cursor-pointer rounded-xl bg-white px-8 py-4 font-semibold text-slate-900 transition hover:scale-105">
              {file ? "Change File" : "Choose File"}

              <input
                type="file"
                accept="application/pdf,.pdf"
                hidden
                disabled={loading}
                onChange={handleFileChange}
              />
            </label>

            <div className="mt-10 flex items-center gap-3 rounded-xl bg-slate-800 px-5 py-4">
              <FileText className="text-indigo-400" />

              <span className="text-slate-300">
                {file ? file.name : "PDF files supported"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

