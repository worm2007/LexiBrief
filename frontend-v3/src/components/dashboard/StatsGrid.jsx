import {
  FileText,
  ShieldAlert,
  Brain,
  Clock,
} from "lucide-react";

import StatCard from "./StatCard";
import { useAnalysis } from "../../context/AnalysisContext";

export default function StatsGrid() {
  const { analysis, loading } = useAnalysis();

  const clauseCount = Array.isArray(analysis?.clauses)
    ? analysis.clauses.length
    : 0;

  const rawRiskScore = analysis?.risks?.risk_score;
  const parsedRiskScore = Number(rawRiskScore);

  const riskScore = Number.isFinite(parsedRiskScore)
    ? Math.min(Math.max(parsedRiskScore, 0), 100)
    : null;

  const analysisStatus = loading
    ? "Analyzing"
    : analysis
      ? "Completed"
      : "Waiting";

  const stats = [
    {
      title: "Document Pages",
      value: analysis?.pages ?? "--",
      icon: FileText,
      color: "text-blue-400",
    },
    {
      title: "Risk Score",
      value: riskScore !== null ? `${riskScore}%` : "--",
      icon: ShieldAlert,
      color: "text-red-400",
    },
    {
      title: "Clauses Detected",
      value: analysis ? clauseCount : "--",
      icon: Brain,
      color: "text-indigo-400",
    },
    {
      title: "Analysis Status",
      value: analysisStatus,
      icon: Clock,
      color: "text-cyan-400",
    },
  ];

  return (
    <div
      className="
        mt-8
        grid
        grid-cols-1
        sm:grid-cols-2
        xl:grid-cols-4
        gap-6
      "
    >
      {stats.map((item) => (
        <StatCard
          key={item.title}
          title={item.title}
          value={item.value}
          icon={item.icon}
          color={item.color}
        />
      ))}
    </div>
  );
}
