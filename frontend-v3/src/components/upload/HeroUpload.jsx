import {
  UploadCloud,
  FileText,
  Sparkles,
  X,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAnalysis } from "../../context/AnalysisContext";
import { analyzeDocument } from "../../services/api";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ANALYSIS_STEPS = [
  "Reading document",
  "Extracting text",
  "Detecting important clauses",
  "Calculating legal risks",
  "Generating summary",
  "Preparing AI assistant",
];

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export default function HeroUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const { setAnalysis } = useAnalysis();

  useEffect(() => {
    if (!loading) {
      return undefined;
    }

    setProgress(8);
    setActiveStep(0);

    const interval = setInterval(() => {
      setProgress((currentProgress) => {
        if (currentProgress >= 92) {
          return currentProgress;
        }

        const increase = Math.floor(Math.random() * 7) + 2;

        return Math.min(currentProgress + increase, 92);
      });
    }, 700);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      return;
    }

    const stepSize = 92 / ANALYSIS_STEPS.length;

    const calculatedStep = Math.min(
      Math.floor(progress / stepSize),
      ANALYSIS_STEPS.length - 1
    );

    setActiveStep(calculatedStep);
  }, [progress, loading]);

  const resetProgress = () => {
    setProgress(0);
    setActiveStep(0);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) {
      return;
    }

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
    setAnalysis(null);
    resetProgress();

    toast.success("PDF selected successfully.");
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    validateAndSetFile(selectedFile);

    event.target.value = "";
  };

  const handleDragOver = (event) => {
    event.preventDefault();

    if (!loading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    if (loading) {
      return;
    }

    const droppedFile = event.dataTransfer.files?.[0];

    validateAndSetFile(droppedFile);
  };

  const handleRemoveFile = () => {
    if (loading) {
      return;
    }

    setFile(null);
    setAnalysis(null);
    resetProgress();

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
      setAnalysis(null);

      const data = await analyzeDocument(file);

      setProgress(100);
      setActiveStep(ANALYSIS_STEPS.length - 1);
      setAnalysis(data);

      toast.success("Document analysed successfully!", {
        id: loadingToast,
      });

      await wait(700);
    } catch (error) {
      console.error("Upload error:", error);

      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "Document analysis failed.";

      toast.error(errorMessage, {
        id: loadingToast,
      });
    } finally {
      setLoading(false);
      resetProgress();
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-[#0B1120] p-6 sm:p-10">
      <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

      <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative z-10 grid items-start gap-12 lg:grid-cols-2">
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
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex max-w-xl items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-slate-900/80 p-4"
            >
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
            </motion.div>
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 max-w-xl rounded-2xl border border-indigo-500/20 bg-slate-900/80 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">
                    LexiBrief AI is analysing your document
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Please keep this page open while your legal report is
                    prepared.
                  </p>
                </div>

                <LoaderCircle className="shrink-0 animate-spin text-indigo-400" />
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-4 text-xs">
                  <span className="text-slate-400">
                    {ANALYSIS_STEPS[activeStep]}
                  </span>

                  <span className="font-medium text-indigo-300">
                    {progress}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                  />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {ANALYSIS_STEPS.map((step, index) => {
                  const isComplete =
                    progress === 100 || index < activeStep;

                  const isCurrent =
                    progress !== 100 && index === activeStep;

                  return (
                    <div
                      key={step}
                      className="flex items-center gap-3 text-sm"
                    >
                      {isComplete ? (
                        <CheckCircle2
                          size={18}
                          className="shrink-0 text-emerald-400"
                        />
                      ) : isCurrent ? (
                        <LoaderCircle
                          size={18}
                          className="shrink-0 animate-spin text-indigo-400"
                        />
                      ) : (
                        <span className="h-[18px] w-[18px] shrink-0 rounded-full border border-slate-700" />
                      )}

                      <span
                        className={
                          isComplete
                            ? "text-slate-300"
                            : isCurrent
                              ? "font-medium text-white"
                              : "text-slate-600"
                        }
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
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
                  <LoaderCircle size={20} className="animate-spin" />
                  Analysing document...
                </span>
              ) : (
                "Analyse document"
              )}
            </button>

            <button
              type="button"
              disabled={loading}
              className="rounded-xl border border-slate-700 bg-slate-900 px-8 py-4 font-semibold text-white transition hover:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
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
              : loading
                ? "border-slate-700 bg-slate-900/40 opacity-70"
                : "border-indigo-500/40 bg-slate-900/60"
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full text-white transition ${
                isDragging
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                  : loading
                    ? "bg-slate-700"
                    : "bg-gradient-to-r from-indigo-600 to-blue-600"
              }`}
            >
              {loading ? (
                <LoaderCircle size={42} className="animate-spin" />
              ) : (
                <UploadCloud size={42} />
              )}
            </div>

            <h3 className="mt-8 text-2xl font-bold text-white">
              {loading
                ? "Analysis in progress"
                : isDragging
                  ? "Drop your document here"
                  : "Upload your legal document"}
            </h3>

            <p className="mt-3 max-w-sm text-slate-400">
              {loading
                ? "Your document is being processed by LexiBrief AI."
                : "Drag and drop a PDF here, or choose one from your computer."}
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
              <FileText className="shrink-0 text-indigo-400" />

              <span className="text-sm text-slate-300">
                {loading
                  ? "Document analysis in progress"
                  : file
                    ? "Document ready for analysis"
                    : "PDF files supported"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}