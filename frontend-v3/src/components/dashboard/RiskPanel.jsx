import {
  AlertTriangle,
  TriangleAlert,
} from "lucide-react";

import { motion } from "framer-motion";
import { useAnalysis } from "../../context/AnalysisContext";

export default function RiskPanel() {
  const { analysis, loading } = useAnalysis();

  const riskData = analysis?.risks;

  const riskScore =
    riskData?.risk_score !== undefined &&
    riskData?.risk_score !== null
      ? Number(riskData.risk_score)
      : null;

  const riskLevel =
    riskData?.risk_level || "Unknown";

  const risks = riskData
    ? [
        ...(Array.isArray(riskData.high_risks)
          ? riskData.high_risks.map((risk) => ({
              ...risk,
              level: "High",
            }))
          : []),

        ...(Array.isArray(riskData.medium_risks)
          ? riskData.medium_risks.map((risk) => ({
              ...risk,
              level: "Medium",
            }))
          : []),

        ...(Array.isArray(riskData.low_risks)
          ? riskData.low_risks.map((risk) => ({
              ...risk,
              level: "Low",
            }))
          : []),
      ]
    : [];

  const getLevelStyles = (level) => {
    switch (level) {
      case "High":
        return {
          text: "text-red-400",
          badge: "bg-red-500/10 text-red-400",
          border: "border-red-500/20",
        };

      case "Medium":
        return {
          text: "text-amber-400",
          badge: "bg-amber-500/10 text-amber-400",
          border: "border-amber-500/20",
        };

      case "Low":
        return {
          text: "text-emerald-400",
          badge: "bg-emerald-500/10 text-emerald-400",
          border: "border-emerald-500/20",
        };

      default:
        return {
          text: "text-slate-400",
          badge: "bg-slate-500/10 text-slate-400",
          border: "border-slate-800",
        };
    }
  };

  const getScoreColor = () => {
    if (riskScore === null) {
      return "text-slate-400";
    }

    if (riskScore >= 75) {
      return "text-red-400";
    }

    if (riskScore >= 50) {
      return "text-amber-400";
    }

    return "text-emerald-400";
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="
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
            bg-red-500/20
          "
        >
          <AlertTriangle
            className="text-red-400"
            size={26}
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">
            Risk Analysis
          </h2>

          <p className="text-sm text-slate-400">
            AI detected legal concerns
          </p>
        </div>
      </div>

      <div
        className="
          mt-8
          flex
          items-center
          justify-between
          rounded-2xl
          border
          border-slate-800
          bg-slate-950/60
          p-6
        "
      >
        <div>
          <p className="text-slate-400">
            Overall Risk Score
          </p>

          <h1
            className={`
              mt-2
              text-5xl
              font-extrabold
              ${getScoreColor()}
            `}
          >
            {loading
              ? "..."
              : riskScore !== null
                ? `${riskScore}%`
                : "--"}
          </h1>

          {riskData && (
            <p className="mt-2 text-sm text-slate-400">
              Risk Level:{" "}
              <span className="font-semibold text-white">
                {riskLevel}
              </span>
            </p>
          )}
        </div>

        <div
          className="
            flex
            items-center
            gap-2
            rounded-xl
            bg-red-500/10
            px-5
            py-3
          "
        >
          <TriangleAlert className="text-red-400" />

          <span className="font-semibold text-red-400">
            {loading
              ? "Analyzing"
              : analysis
                ? "Analyzed"
                : "Waiting"}
          </span>
        </div>
      </div>

      {riskData?.summary && (
        <div
          className="
            mt-6
            rounded-2xl
            border
            border-slate-800
            bg-slate-950/40
            p-5
          "
        >
          <p className="text-sm font-semibold text-white">
            Overall Assessment
          </p>

          <p className="mt-2 leading-6 text-slate-400">
            {riskData.summary}
          </p>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-slate-400">
            Analyzing legal risks...
          </p>
        ) : risks.length > 0 ? (
          risks.map((risk, index) => {
            const styles = getLevelStyles(risk.level);

            return (
              <div
                key={`${risk.level}-${risk.issue}-${index}`}
                className={`
                  rounded-2xl
                  border
                  bg-slate-950/40
                  p-5
                  ${styles.border}
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-white">
                    {risk.issue || "Legal Risk"}
                  </h3>

                  <span
                    className={`
                      shrink-0
                      rounded-full
                      px-3
                      py-1
                      text-xs
                      font-semibold
                      ${styles.badge}
                    `}
                  >
                    {risk.level}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Impact
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {risk.impact ||
                      "No impact explanation was generated."}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Recommendation
                  </p>

                  <p className="mt-1 text-sm leading-6 text-indigo-300">
                    {risk.recommendation ||
                      "Review this clause with a legal professional."}
                  </p>
                </div>
              </div>
            );
          })
        ) : analysis ? (
          <p className="text-slate-400">
            No structured legal risks were detected in this document.
          </p>
        ) : (
          <p className="text-slate-400">
            Upload a document to detect risky clauses.
          </p>
        )}
      </div>
    </motion.div>
  );
}