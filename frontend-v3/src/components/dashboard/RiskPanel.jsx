import {
  AlertTriangle,
  BadgeAlert,
  CheckCircle2,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAnalysis } from "../../context/AnalysisContext";

export default function RiskPanel() {
  const { analysis, loading } = useAnalysis();

  const riskData = analysis?.risks;

  const parsedRiskScore =
    riskData?.risk_score !== undefined &&
    riskData?.risk_score !== null
      ? Number(riskData.risk_score)
      : null;

  const riskScore = Number.isFinite(parsedRiskScore)
    ? Math.min(Math.max(parsedRiskScore, 0), 100)
    : null;

  const riskLevel = riskData?.risk_level || "Unknown";

  const highRisks = Array.isArray(riskData?.high_risks)
    ? riskData.high_risks
    : [];

  const mediumRisks = Array.isArray(riskData?.medium_risks)
    ? riskData.medium_risks
    : [];

  const lowRisks = Array.isArray(riskData?.low_risks)
    ? riskData.low_risks
    : [];

  const risks = [
    ...highRisks.map((risk) => ({
      ...risk,
      level: "High",
    })),

    ...mediumRisks.map((risk) => ({
      ...risk,
      level: "Medium",
    })),

    ...lowRisks.map((risk) => ({
      ...risk,
      level: "Low",
    })),
  ];

  const getLevelStyles = (level) => {
    switch (level) {
      case "High":
        return {
          text: "text-red-300",
          badge:
            "border-red-500/20 bg-red-500/10 text-red-300",
          border: "border-red-500/20",
          iconBackground: "bg-red-500/10",
          icon: "text-red-400",
          accent: "bg-red-500",
        };

      case "Medium":
        return {
          text: "text-amber-300",
          badge:
            "border-amber-500/20 bg-amber-500/10 text-amber-300",
          border: "border-amber-500/20",
          iconBackground: "bg-amber-500/10",
          icon: "text-amber-400",
          accent: "bg-amber-500",
        };

      case "Low":
        return {
          text: "text-emerald-300",
          badge:
            "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
          border: "border-emerald-500/20",
          iconBackground: "bg-emerald-500/10",
          icon: "text-emerald-400",
          accent: "bg-emerald-500",
        };

      default:
        return {
          text: "text-slate-300",
          badge:
            "border-slate-700 bg-slate-800 text-slate-300",
          border: "border-slate-800",
          iconBackground: "bg-slate-800",
          icon: "text-slate-400",
          accent: "bg-slate-500",
        };
    }
  };

  const getScoreStyles = () => {
    if (riskScore === null) {
      return {
        text: "text-slate-400",
        ring: "stroke-slate-700",
        badge:
          "border-slate-700 bg-slate-800 text-slate-300",
      };
    }

    if (riskScore >= 75) {
      return {
        text: "text-red-400",
        ring: "stroke-red-500",
        badge:
          "border-red-500/20 bg-red-500/10 text-red-300",
      };
    }

    if (riskScore >= 50) {
      return {
        text: "text-amber-400",
        ring: "stroke-amber-500",
        badge:
          "border-amber-500/20 bg-amber-500/10 text-amber-300",
      };
    }

    return {
      text: "text-emerald-400",
      ring: "stroke-emerald-500",
      badge:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    };
  };

  const scoreStyles = getScoreStyles();

  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  const progressOffset =
    riskScore !== null
      ? circumference - (riskScore / 100) * circumference
      : circumference;

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
      }}
      className="
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
          via-red-500/50
          to-transparent
        "
      />

      <div
        className="
          absolute
          -right-28
          -top-28
          h-72
          w-72
          rounded-full
          bg-red-500/5
          blur-3xl
        "
      />

      <div className="relative border-b border-slate-800/80 p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
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
                border-red-500/20
                bg-red-500/10
              "
            >
              <ShieldAlert className="text-red-400" size={25} />
            </motion.div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Risk Analysis
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                AI-detected legal concerns, possible consequences, and
                recommended actions.
              </p>
            </div>
          </div>

          <div
            className={`
              inline-flex
              w-fit
              shrink-0
              items-center
              gap-2
              rounded-full
              border
              px-3.5
              py-2
              text-sm
              font-medium
              ${scoreStyles.badge}
            `}
          >
            {loading ? (
              <TriangleAlert size={16} className="animate-pulse" />
            ) : analysis ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertTriangle size={16} />
            )}

            {loading
              ? "Analysis in progress"
              : analysis
                ? "Analysis completed"
                : "Waiting for document"}
          </div>
        </div>
      </div>

      <div className="relative p-6 sm:p-8">
        <div className="grid gap-6">
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              rounded-2xl
              border
              border-slate-800
              bg-slate-950/40
              p-6
              text-center
            "
          >
            <div className="relative h-40 w-40">
              <svg
                viewBox="0 0 128 128"
                className="-rotate-90"
                role="img"
                aria-label={
                  riskScore !== null
                    ? `Risk score ${riskScore} percent`
                    : "Risk score unavailable"
                }
              >
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  strokeWidth="9"
                  className="stroke-slate-800"
                />

                <motion.circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{
                    strokeDashoffset: circumference,
                  }}
                  animate={{
                    strokeDashoffset: progressOffset,
                  }}
                  transition={{
                    duration: 1,
                    ease: "easeOut",
                  }}
                  className={scoreStyles.ring}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`
                    text-4xl
                    font-extrabold
                    tracking-tight
                    ${scoreStyles.text}
                  `}
                >
                  {loading
                    ? "..."
                    : riskScore !== null
                      ? riskScore
                      : "--"}
                </span>

                <span className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                  out of 100
                </span>
              </div>
            </div>

            <p className="mt-5 text-sm text-slate-400">
              Overall risk level
            </p>

            <span
              className={`
                mt-2
                rounded-full
                border
                px-4
                py-1.5
                text-sm
                font-semibold
                ${scoreStyles.badge}
              `}
            >
              {loading ? "Analysing" : riskLevel}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <RiskCountCard
              title="High Risk"
              count={loading ? "--" : highRisks.length}
              description="Requires immediate review"
              icon={TriangleAlert}
              styles={getLevelStyles("High")}
            />

            <RiskCountCard
              title="Medium Risk"
              count={loading ? "--" : mediumRisks.length}
              description="Should be reviewed"
              icon={BadgeAlert}
              styles={getLevelStyles("Medium")}
            />

            <RiskCountCard
              title="Low Risk"
              count={loading ? "--" : lowRisks.length}
              description="Minor concern"
              icon={CheckCircle2}
              styles={getLevelStyles("Low")}
            />
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
              sm:p-6
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-indigo-500/10
                "
              >
                <ShieldAlert size={18} className="text-indigo-400" />
              </div>

              <p className="font-semibold text-white">
                Overall assessment
              </p>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              {riskData.summary}
            </p>
          </div>
        )}

        <div className="mt-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Detected legal risks
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Review each issue and its recommended action.
              </p>
            </div>

            {risks.length > 0 && !loading && (
              <span className="text-sm text-slate-500">
                {risks.length}{" "}
                {risks.length === 1 ? "issue" : "issues"} detected
              </span>
            )}
          </div>

          <div className="mt-5 space-y-4">
            {loading ? (
              <LoadingRisks />
            ) : risks.length > 0 ? (
              risks.map((risk, index) => {
                const styles = getLevelStyles(risk.level);

                return (
                  <motion.article
                    key={`${risk.level}-${risk.issue || "risk"}-${index}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.3,
                    }}
                    whileHover={{ y: -2 }}
                    className={`
                      relative
                      overflow-hidden
                      rounded-2xl
                      border
                      bg-slate-950/40
                      p-5
                      transition
                      hover:bg-slate-950/60
                      sm:p-6
                      ${styles.border}
                    `}
                  >
                    <div
                      className={`
                        absolute
                        inset-y-0
                        left-0
                        w-1
                        ${styles.accent}
                      `}
                    />

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            ${styles.iconBackground}
                          `}
                        >
                          <AlertTriangle
                            size={19}
                            className={styles.icon}
                          />
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-semibold leading-6 text-white">
                            {risk.issue || "Legal risk"}
                          </h4>

                          {risk.clause && (
                            <p className="mt-2 text-sm italic leading-6 text-slate-500">
                              “{risk.clause}”
                            </p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`
                          w-fit
                          shrink-0
                          rounded-full
                          border
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          ${styles.badge}
                        `}
                      >
                        {risk.level} risk
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                      <div
                        className="
                          rounded-xl
                          border
                          border-slate-800
                          bg-slate-900/50
                          p-4
                        "
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Potential impact
                        </p>

                        <p className="mt-2 text-sm leading-7 text-slate-300">
                          {risk.impact ||
                            "No impact explanation was generated."}
                        </p>
                      </div>

                      <div
                        className="
                          rounded-xl
                          border
                          border-indigo-500/15
                          bg-indigo-500/5
                          p-4
                        "
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-400">
                          Recommended action
                        </p>

                        <p className="mt-2 text-sm leading-7 text-indigo-200">
                          {risk.recommendation ||
                            "Review this clause with a qualified legal professional."}
                        </p>
                      </div>
                    </div>
                  </motion.article>
                );
              })
            ) : analysis ? (
              <EmptyRiskState
                icon={CheckCircle2}
                title="No structured risks detected"
                description="The AI did not return any high, medium, or low risk items for this document."
                success
              />
            ) : (
              <EmptyRiskState
                icon={ShieldAlert}
                title="No document analysed"
                description="Upload and analyse a legal document to identify risky clauses and obligations."
              />
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function RiskCountCard({
  title,
  count,
  description,
  icon: Icon,
  styles,
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`
        min-w-0
        rounded-2xl
        border
        bg-slate-950/40
        p-5
        transition
        hover:bg-slate-950/60
        ${styles.border}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="whitespace-nowrap text-sm font-medium text-slate-400">
            {title}
          </p>

          <p className={`mt-3 text-3xl font-bold ${styles.text}`}>
            {count}
          </p>
        </div>

        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${styles.iconBackground}
          `}
        >
          <Icon size={19} className={styles.icon} />
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </motion.div>
  );
}

function LoadingRisks() {
  return (
    <>
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="
            animate-pulse
            rounded-2xl
            border
            border-slate-800
            bg-slate-950/40
            p-6
          "
        >
          <div className="flex items-start justify-between gap-4">
            <div className="h-5 w-48 rounded bg-slate-800" />
            <div className="h-7 w-20 rounded-full bg-slate-800" />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="h-28 rounded-xl bg-slate-800/70" />
            <div className="h-28 rounded-xl bg-slate-800/70" />
          </div>
        </div>
      ))}
    </>
  );
}

function EmptyRiskState({
  icon: Icon,
  title,
  description,
  success = false,
}) {
  return (
    <div
      className="
        flex
        min-h-52
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
        className={`
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-2xl
          border
          ${
            success
              ? "border-emerald-500/20 bg-emerald-500/10"
              : "border-slate-800 bg-slate-900"
          }
        `}
      >
        <Icon
          size={29}
          className={
            success ? "text-emerald-400" : "text-slate-600"
          }
        />
      </div>

      <p className="mt-5 font-medium text-slate-300">
        {title}
      </p>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}