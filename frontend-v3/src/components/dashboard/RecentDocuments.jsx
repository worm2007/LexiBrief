import { FileText, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAnalysis } from "../../context/AnalysisContext";

export default function RecentDocuments() {
  const { analysis } = useAnalysis();

  const riskCount = Array.isArray(analysis?.risks)
    ? analysis.risks.length
    : 0;

  const getRiskLabel = () => {
    if (!analysis) return "Waiting";
    if (riskCount >= 4) return "High Risk";
    if (riskCount >= 2) return "Medium Risk";
    return "Low Risk";
  };

  const document = analysis
    ? {
        name: analysis.filename || "Uploaded Document",
        type: "Legal Document",
        risk: getRiskLabel(),
        status: "Analyzed",
        date: "Today",
      }
    : null;

  return (
    <motion.div
      whileHover={{ y: -3 }}
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
      {/* Header */}

      <div className="flex items-center gap-3">
        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            bg-blue-500/20
          "
        >
          <FileText className="text-blue-400" size={25} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">
            Recent Documents
          </h2>

          <p className="text-sm text-slate-400">
            Recently analyzed legal documents
          </p>
        </div>
      </div>

      {/* Documents */}

      <div className="mt-8 space-y-4">
        {document ? (
          <div
            className="
              flex
              items-center
              justify-between
              rounded-2xl
              border
              border-slate-800
              bg-slate-950/50
              p-5
            "
          >
            <div className="flex items-center gap-4">
              <div
                className="
                  rounded-xl
                  bg-slate-800
                  p-3
                "
              >
                <FileText className="text-indigo-400" />
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  {document.name}
                </h3>

                <p className="text-sm text-slate-400">
                  {document.type} • {document.date}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <span
                className={`
                  hidden md:block
                  font-semibold
                  ${
                    document.risk === "High Risk"
                      ? "text-red-400"
                      : document.risk === "Medium Risk"
                      ? "text-yellow-400"
                      : "text-green-400"
                  }
                `}
              >
                {document.risk}
              </span>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  bg-green-500/10
                  px-3
                  py-2
                "
              >
                <CheckCircle
                  size={16}
                  className="text-green-400"
                />

                <span className="text-sm text-green-400">
                  {document.status}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="
              rounded-2xl
              border
              border-slate-800
              bg-slate-950/50
              p-5
            "
          >
            <p className="text-slate-400">
              Upload a document to see it here.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}