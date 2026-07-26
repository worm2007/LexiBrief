import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useAnalysis } from "../../context/AnalysisContext";

export default function ClausePanel() {
  const { analysis, loading } = useAnalysis();
  const [expandedClauses, setExpandedClauses] = useState({});
  const [copiedIndex, setCopiedIndex] = useState(null);

  const rawClauses =
    analysis?.clauses ||
    analysis?.key_clauses ||
    analysis?.important_clauses ||
    analysis?.extracted_clauses ||
    [];

  const clauses = Array.isArray(rawClauses)
    ? rawClauses
    : typeof rawClauses === "string"
      ? rawClauses
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const getClauseTitle = (clause, index) => {
    if (typeof clause === "string") return `Clause ${index + 1}`;

    return (
      clause?.title ||
      clause?.name ||
      clause?.clause_title ||
      clause?.type ||
      `Clause ${index + 1}`
    );
  };

  const getClauseText = (clause) => {
    if (typeof clause === "string") return clause;

    return (
      clause?.description ||
      clause?.text ||
      clause?.content ||
      clause?.clause ||
      clause?.explanation ||
      "Clause information is unavailable."
    );
  };

  const toggleClause = (index) => {
    setExpandedClauses((current) => ({
      ...current,
      [index]: !current[index],
    }));
  };

  const copyClause = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success("Clause copied to clipboard");

      window.setTimeout(() => {
        setCopiedIndex((current) => (current === index ? null : current));
      }, 1800);
    } catch (error) {
      console.error("Unable to copy clause:", error);
      toast.error("Unable to copy clause");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative mt-8 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/10 backdrop-blur-xl"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl" />

      <div className="relative border-b border-slate-800/80 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.06 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10"
            >
              <ShieldCheck size={25} className="text-indigo-400" />
            </motion.div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Important Clauses
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Key contractual terms extracted from the uploaded legal document.
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-2 text-sm font-medium text-indigo-300">
            <Sparkles size={15} />
            {loading
              ? "Extracting clauses"
              : `${clauses.length} ${clauses.length === 1 ? "clause" : "clauses"}`}
          </div>
        </div>
      </div>

      <div className="relative p-6 sm:p-8">
        {loading ? (
          <ClauseSkeletons />
        ) : clauses.length > 0 ? (
          <div className="space-y-5">
            {clauses.map((clause, index) => {
              const title = getClauseTitle(clause, index);
              const text = getClauseText(clause);
              const isExpanded = Boolean(expandedClauses[index]);
              const isLong = text.length > 320;
              const displayNumber = String(index + 1).padStart(2, "0");

              return (
                <motion.article
                  key={`${title}-${index}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(index * 0.05, 0.3),
                  }}
                  whileHover={{ y: -2 }}
                  className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40 transition hover:border-indigo-500/25 hover:bg-slate-950/60 hover:shadow-lg hover:shadow-indigo-950/10"
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-indigo-400 via-violet-500 to-fuchsia-500" />

                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-sm font-bold text-indigo-300">
                          {displayNumber}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold leading-6 text-white sm:text-lg">
                              {title}
                            </h3>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/15 bg-indigo-500/5 px-2.5 py-1 text-xs font-medium text-indigo-300">
                              <Sparkles size={12} />
                              AI Extracted
                            </span>
                          </div>
                          <p className="mt-2 text-xs uppercase tracking-[0.13em] text-slate-600">
                            Contract provision
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyClause(text, index)}
                        className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                        aria-label={`Copy ${title}`}
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check size={15} className="text-emerald-400" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={15} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>

                    <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/45 p-4 sm:p-5">
                      <AnimatePresence initial={false}>
                        <motion.div
                          key={isExpanded ? "expanded" : "collapsed"}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <p
                            className={`whitespace-pre-wrap text-sm leading-7 text-slate-300 ${
                              !isExpanded && isLong ? "line-clamp-4" : ""
                            }`}
                          >
                            {text}
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {isLong && (
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => toggleClause(index)}
                          className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-indigo-400 transition hover:bg-indigo-500/10 hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? (
                            <>
                              Show less
                              <ChevronUp size={16} />
                            </>
                          ) : (
                            <>
                              Read full clause
                              <ChevronDown size={16} />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <EmptyClauseState hasAnalysis={Boolean(analysis)} />
        )}
      </div>
    </motion.section>
  );
}

function ClauseSkeletons() {
  return (
    <div className="space-y-5">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-2xl border border-slate-800 bg-slate-950/40 p-6"
        >
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-slate-800" />
            <div className="flex-1">
              <div className="h-5 w-48 rounded bg-slate-800" />
              <div className="mt-3 h-3 w-32 rounded bg-slate-800/70" />
            </div>
          </div>
          <div className="mt-5 h-28 rounded-xl bg-slate-800/60" />
        </div>
      ))}
    </div>
  );
}

function EmptyClauseState({ hasAnalysis }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/30 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
        <FileText size={29} className="text-slate-600" />
      </div>

      <p className="mt-5 font-medium text-slate-300">
        {hasAnalysis ? "No clauses were returned" : "No document analysed"}
      </p>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasAnalysis
          ? "The AI did not identify any structured legal clauses in this document."
          : "Upload and analyse a legal document to extract its important contractual clauses."}
      </p>
    </div>
  );
}