import { FileText } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useAnalysis } from "../../context/AnalysisContext";

export default function SummaryPanel() {
  const { analysis } = useAnalysis();

  const summary =
    analysis?.summary ||
    analysis?.document_summary ||
    analysis?.analysis_summary ||
    "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="
        rounded-3xl
        border
        border-slate-800
        bg-slate-900/60
        p-7
        backdrop-blur-xl
      "
    >
      <div className="flex items-center gap-3">
        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-indigo-500/15
          "
        >
          <FileText
            className="text-indigo-400"
            size={23}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Document Summary
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            AI-generated overview of the uploaded document
          </p>
        </div>
      </div>

      {analysis?.filename && (
        <div
          className="
            mt-6
            rounded-xl
            border
            border-slate-800
            bg-slate-950/40
            px-4
            py-3
          "
        >
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Document
          </p>

          <p className="mt-1 truncate text-sm font-medium text-slate-300">
            {analysis.filename}
          </p>
        </div>
      )}

      <div className="mt-7">
        {summary ? (
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="mb-4 mt-7 text-xl font-semibold tracking-tight text-white first:mt-0">
                  {children}
                </h1>
              ),

              h2: ({ children }) => (
                <h2 className="mb-3 mt-7 border-b border-slate-800 pb-2 text-base font-semibold uppercase tracking-wide text-indigo-300 first:mt-0">
                  {children}
                </h2>
              ),

              h3: ({ children }) => (
                <h3 className="mb-2 mt-6 text-base font-semibold text-slate-100">
                  {children}
                </h3>
              ),

              p: ({ children }) => (
                <p className="mb-4 text-[15px] leading-7 text-slate-300">
                  {children}
                </p>
              ),

              ul: ({ children }) => (
                <ul className="mb-5 space-y-2 pl-1">
                  {children}
                </ul>
              ),

              ol: ({ children }) => (
                <ol className="mb-5 list-decimal space-y-2 pl-6 text-slate-300">
                  {children}
                </ol>
              ),

              li: ({ children }) => (
                <li className="flex items-start gap-3 text-[15px] leading-7 text-slate-300">
                  <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />

                  <span>{children}</span>
                </li>
              ),

              strong: ({ children }) => (
                <strong className="font-semibold text-slate-100">
                  {children}
                </strong>
              ),

              hr: () => (
                <hr className="my-6 border-slate-800" />
              ),
            }}
          >
            {summary}
          </ReactMarkdown>
        ) : (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-slate-700
              bg-slate-950/40
              p-8
              text-center
            "
          >
            <FileText
              className="mx-auto text-slate-600"
              size={30}
            />

            <p className="mt-4 text-sm font-medium text-slate-300">
              No summary available
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Upload and analyze a PDF to generate its summary.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}