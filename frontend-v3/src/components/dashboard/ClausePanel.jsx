import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useAnalysis } from "../../context/AnalysisContext";

export default function ClausePanel() {
  const { analysis } = useAnalysis();

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
    if (typeof clause === "string") {
      return `Clause ${index + 1}`;
    }

    return (
      clause?.title ||
      clause?.name ||
      clause?.clause_title ||
      clause?.type ||
      `Clause ${index + 1}`
    );
  };

  const getClauseText = (clause) => {
    if (typeof clause === "string") {
      return clause;
    }

    return (
      clause?.description ||
      clause?.text ||
      clause?.content ||
      clause?.clause ||
      clause?.explanation ||
      "Clause information is unavailable."
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        mt-8
        rounded-3xl
        border
        border-slate-800
        bg-slate-900/60
        p-8
        backdrop-blur-xl
      "
    >
      <div className="flex items-center gap-3">
        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            bg-green-500/20
          "
        >
          <ShieldCheck
            className="text-green-400"
            size={26}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Important Clauses
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Key clauses extracted from the uploaded document
          </p>
        </div>
      </div>

      <div className="mt-7 space-y-4">
        {clauses.length > 0 ? (
          clauses.map((clause, index) => (
            <div
              key={index}
              className="
                rounded-2xl
                border
                border-slate-800
                bg-slate-950/50
                p-5
              "
            >
              <div className="flex items-start gap-4">
                <div
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-indigo-500/10
                    text-sm
                    font-semibold
                    text-indigo-400
                  "
                >
                  {index + 1}
                </div>

                <div>
                  <h3 className="text-base font-semibold text-slate-100">
                    {getClauseTitle(clause, index)}
                  </h3>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-400">
                    {getClauseText(clause)}
                  </p>
                </div>
              </div>
            </div>
          ))
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
            <ShieldCheck
              size={30}
              className="mx-auto text-slate-600"
            />

            <p className="mt-4 text-sm font-medium text-slate-300">
              No clauses were returned
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Upload and analyze a document containing identifiable legal clauses.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}