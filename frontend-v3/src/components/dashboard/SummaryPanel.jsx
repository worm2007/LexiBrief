import {
  CheckCircle2,
  Clipboard,
  FileText,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useAnalysis } from "../../context/AnalysisContext";

export default function SummaryPanel() {
  const { analysis } = useAnalysis();
  const [copied, setCopied] = useState(false);

  const summary =
    analysis?.summary ||
    analysis?.document_summary ||
    analysis?.analysis_summary ||
    "";

  const handleCopySummary = async () => {
    if (!summary) {
      toast.error("No summary is available to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);

      toast.success("Summary copied to clipboard.");

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy summary error:", error);
      toast.error("Could not copy the summary.");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
      }}
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-slate-800
        bg-slate-900/70
        shadow-xl
        shadow-black/10
        backdrop-blur-xl
      "
    >
      <div
        className="
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-indigo-500/70
          to-transparent
        "
      />

      <div
        className="
          absolute
          -right-24
          -top-24
          h-64
          w-64
          rounded-full
          bg-indigo-500/5
          blur-3xl
        "
      />

      <div className="relative border-b border-slate-800/80 p-6 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{
                rotate: 5,
                scale: 1.06,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 18,
              }}
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                border-indigo-500/20
                bg-indigo-500/10
                shadow-lg
                shadow-indigo-500/5
              "
            >
              <FileText className="text-indigo-400" size={24} />
            </motion.div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Executive Summary
                </h2>

                {summary && (
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      border-emerald-500/20
                      bg-emerald-500/10
                      px-2.5
                      py-1
                      text-xs
                      font-medium
                      text-emerald-300
                    "
                  >
                    <Sparkles size={13} />
                    AI generated
                  </span>
                )}
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                A clear, structured overview of the uploaded legal document,
                including its purpose and important obligations.
              </p>
            </div>
          </div>

          {summary && (
            <button
              type="button"
              onClick={handleCopySummary}
              className="
                inline-flex
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-slate-700
                bg-slate-950/50
                px-4
                py-2.5
                text-sm
                font-medium
                text-slate-300
                transition
                hover:border-indigo-500/40
                hover:bg-slate-800
                hover:text-white
              "
            >
              {copied ? (
                <>
                  <CheckCircle2 size={17} className="text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Clipboard size={17} />
                  Copy summary
                </>
              )}
            </button>
          )}
        </div>

        {analysis?.filename && (
          <div
            className="
              mt-6
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-slate-800
              bg-slate-950/40
              px-4
              py-3.5
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-slate-800
              "
            >
              <FileText size={17} className="text-slate-400" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Analysed document
              </p>

              <p className="mt-1 truncate text-sm font-medium text-slate-300">
                {analysis.filename}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="relative p-6 sm:p-7">
        {summary ? (
          <div
            className="
              rounded-2xl
              border
              border-slate-800/80
              bg-slate-950/30
              p-5
              sm:p-6
            "
          >
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="mb-4 mt-8 text-2xl font-semibold tracking-tight text-white first:mt-0">
                    {children}
                  </h1>
                ),

                h2: ({ children }) => (
                  <div className="mb-4 mt-8 first:mt-0">
                    <h2 className="text-base font-semibold uppercase tracking-[0.12em] text-indigo-300">
                      {children}
                    </h2>

                    <div className="mt-2 h-px bg-gradient-to-r from-indigo-500/50 via-slate-800 to-transparent" />
                  </div>
                ),

                h3: ({ children }) => (
                  <h3 className="mb-3 mt-7 text-base font-semibold text-slate-100">
                    {children}
                  </h3>
                ),

                p: ({ children }) => (
                  <p className="mb-5 text-[15px] leading-8 text-slate-300 last:mb-0">
                    {children}
                  </p>
                ),

                ul: ({ children }) => (
                  <ul className="mb-6 space-y-3">
                    {children}
                  </ul>
                ),

                ol: ({ children }) => (
                  <ol className="mb-6 list-decimal space-y-3 pl-6 text-slate-300">
                    {children}
                  </ol>
                ),

                li: ({ children }) => (
                  <li className="flex items-start gap-3 text-[15px] leading-7 text-slate-300">
                    <span
                      className="
                        mt-[10px]
                        h-2
                        w-2
                        shrink-0
                        rounded-full
                        bg-gradient-to-r
                        from-indigo-400
                        to-cyan-400
                        shadow-sm
                        shadow-indigo-500/30
                      "
                    />

                    <span>{children}</span>
                  </li>
                ),

                strong: ({ children }) => (
                  <strong className="font-semibold text-white">
                    {children}
                  </strong>
                ),

                blockquote: ({ children }) => (
                  <blockquote
                    className="
                      my-6
                      rounded-r-xl
                      border-l-4
                      border-indigo-500
                      bg-indigo-500/5
                      px-5
                      py-4
                      text-slate-300
                    "
                  >
                    {children}
                  </blockquote>
                ),

                code: ({ children }) => (
                  <code
                    className="
                      rounded
                      bg-slate-800
                      px-1.5
                      py-0.5
                      text-sm
                      text-cyan-300
                    "
                  >
                    {children}
                  </code>
                ),

                hr: () => <hr className="my-8 border-slate-800" />,

                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-indigo-300 underline decoration-indigo-500/40 underline-offset-4 hover:text-indigo-200"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {summary}
            </ReactMarkdown>
          </div>
        ) : (
          <div
            className="
              flex
              min-h-64
              flex-col
              items-center
              justify-center
              rounded-2xl
              border
              border-dashed
              border-slate-700
              bg-slate-950/30
              p-8
              text-center
            "
          >
            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                border
                border-slate-800
                bg-slate-900
              "
            >
              <FileText className="text-slate-600" size={30} />
            </div>

            <p className="mt-5 text-base font-medium text-slate-300">
              No summary available
            </p>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Upload and analyse a PDF document to generate its executive
              summary.
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
}