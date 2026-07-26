import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clipboard,
  Clock3,
  Download,
  FileText,
  Landmark,
  RefreshCw,
  Scale,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { generatePDF } from "../../utils/pdfGenerator";
import { useAnalysis } from "../../context/AnalysisContext";

const FACT_CONFIG = [
  {
    key: "documentType",
    label: "Document type",
    icon: Landmark,
  },
  {
    key: "parties",
    label: "Parties",
    icon: Users,
  },
  {
    key: "effectiveDate",
    label: "Effective date",
    icon: CalendarDays,
  },
  {
    key: "duration",
    label: "Duration",
    icon: Clock3,
  },
  {
    key: "payment",
    label: "Payment terms",
    icon: WalletCards,
  },
  {
    key: "governingLaw",
    label: "Governing law",
    icon: Scale,
  },
];

function cleanValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "string"
          ? item
          : item?.name || item?.title || JSON.stringify(item),
      )
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    return (
      value.name ||
      value.title ||
      value.value ||
      value.text ||
      JSON.stringify(value)
    );
  }

  return String(value).trim();
}

function findFirstValue(source, keys) {
  if (!source || typeof source !== "object") {
    return "";
  }

  for (const key of keys) {
    const value = cleanValue(source[key]);

    if (value) {
      return value;
    }
  }

  return "";
}

function extractMarkdownValue(summary, labels) {
  if (!summary || typeof summary !== "string") {
    return "";
  }

  const escapedLabels = labels.map((label) =>
    label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );

  const labelPattern = escapedLabels.join("|");

  const patterns = [
    new RegExp(
      `(?:^|\\n)\\s*(?:[-*]\\s*)?(?:\\*\\*)?(?:${labelPattern})(?:\\*\\*)?\\s*[:\\-]\\s*(.+)`,
      "i",
    ),
    new RegExp(
      `(?:^|\\n)\\s*#{1,4}\\s*(?:${labelPattern})\\s*\\n+([^\\n#]+)`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = summary.match(pattern);

    if (match?.[1]) {
      return match[1]
        .replace(/\*\*/g, "")
        .replace(/^[*-]\s*/, "")
        .trim();
    }
  }

  return "";
}

function shortenValue(value, maximumLength = 110) {
  if (!value) {
    return "";
  }

  return value.length > maximumLength
    ? `${value.slice(0, maximumLength).trim()}…`
    : value;
}

function createKeyFacts(analysis, summary) {
  const metadata =
    analysis?.metadata ||
    analysis?.document_metadata ||
    analysis?.key_details ||
    analysis?.details ||
    {};

  const sources = [metadata, analysis];

  const readValue = (keys, markdownLabels) => {
    for (const source of sources) {
      const value = findFirstValue(source, keys);

      if (value) {
        return shortenValue(value);
      }
    }

    return shortenValue(extractMarkdownValue(summary, markdownLabels));
  };

  return {
    documentType: readValue(
      [
        "document_type",
        "documentType",
        "contract_type",
        "contractType",
        "type",
      ],
      ["Document Type", "Contract Type", "Agreement Type"],
    ),

    parties: readValue(
      [
        "parties",
        "contracting_parties",
        "contractingParties",
        "entities",
      ],
      ["Parties", "Contracting Parties", "Entities"],
    ),

    effectiveDate: readValue(
      [
        "effective_date",
        "effectiveDate",
        "start_date",
        "startDate",
        "date",
      ],
      ["Effective Date", "Start Date", "Agreement Date"],
    ),

    duration: readValue(
      ["duration", "term", "contract_duration", "contractDuration"],
      ["Duration", "Term", "Contract Period"],
    ),

    payment: readValue(
      [
        "payment",
        "payment_terms",
        "paymentTerms",
        "consideration",
        "fees",
      ],
      ["Payment", "Payment Terms", "Fees", "Consideration"],
    ),

    governingLaw: readValue(
      [
        "governing_law",
        "governingLaw",
        "jurisdiction",
        "applicable_law",
      ],
      ["Governing Law", "Jurisdiction", "Applicable Law"],
    ),
  };
}

function KeyFactCard({ icon: Icon, label, value, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.05,
      }}
      whileHover={{ y: -2 }}
      className="
        group/fact
        rounded-2xl
        border
        border-slate-800
        bg-slate-950/40
        p-4
        transition
        hover:border-indigo-500/30
        hover:bg-indigo-500/[0.04]
      "
    >
      <div className="flex items-start gap-3">
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-indigo-500/15
            bg-indigo-500/10
            transition
            group-hover/fact:border-indigo-500/30
          "
        >
          <Icon size={18} className="text-indigo-400" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
            {label}
          </p>

          <p
            className={`mt-2 text-sm leading-6 ${
              value ? "font-medium text-slate-200" : "text-slate-600"
            }`}
          >
            {value || "Not identified"}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

export default function SummaryPanel() {
  const { analysis } = useAnalysis();

  const [copied, setCopied] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);

  const summary =
    analysis?.summary ||
    analysis?.document_summary ||
    analysis?.analysis_summary ||
    "";

  const keyFacts = useMemo(
    () => createKeyFacts(analysis, summary),
    [analysis, summary],
  );

  const availableFacts = FACT_CONFIG.filter(
    (fact) => keyFacts[fact.key],
  ).length;

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
      }, 1800);
    } catch (error) {
      console.error("Copy summary error:", error);
      toast.error("Could not copy the summary.");
    }
  };

const handleDownloadSummary = () => {
  if (!analysis) {
    toast.error("No analysis is available to download.");
    return;
  }

  try {
    generatePDF(analysis);
    toast.success("PDF report downloaded successfully.");
  } catch (error) {
    console.error("PDF generation error:", error);
    toast.error("Could not generate the PDF report.");
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
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/70 to-transparent" />

      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl" />

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
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                    <Sparkles size={13} />
                    AI generated
                  </span>
                )}
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Important facts, obligations and commercial terms extracted from
                the uploaded legal document.
              </p>
            </div>
          </div>

          {summary && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopySummary}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-950/50
                  px-3.5
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
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Clipboard size={16} />
                    Copy
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadSummary}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-950/50
                  px-3.5
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
                <Download size={16} />
                Download
              </button>
            </div>
          )}
        </div>

        {analysis?.filename && (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800">
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

            {summary && (
              <div className="hidden shrink-0 items-center gap-2 text-xs text-slate-500 sm:flex">
                <CheckCircle2 size={15} className="text-emerald-400" />
                {availableFacts} key facts identified
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative p-6 sm:p-7">
        {summary ? (
          <>
            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">
                    Key document facts
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Automatically extracted from the AI analysis
                  </p>
                </div>

                <span className="rounded-full border border-slate-800 bg-slate-950/50 px-3 py-1 text-xs font-medium text-slate-400">
                  {availableFacts}/{FACT_CONFIG.length} found
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {FACT_CONFIG.map((fact, index) => (
                  <KeyFactCard
                    key={fact.key}
                    icon={fact.icon}
                    label={fact.label}
                    value={keyFacts[fact.key]}
                    index={index}
                  />
                ))}
              </div>
            </div>

            <div className="mt-7">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                  <Sparkles size={17} className="text-indigo-400" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">
                    AI document overview
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Plain-language explanation of the document
                  </p>
                </div>
              </div>

              <div
                className={`
                  relative
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-800/80
                  bg-slate-950/30
                  p-5
                  sm:p-6
                  ${
                    !showFullSummary
                      ? "max-h-[34rem]"
                      : ""
                  }
                `}
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
                      <ul className="mb-6 space-y-3">{children}</ul>
                    ),

                    ol: ({ children }) => (
                      <ol className="mb-6 list-decimal space-y-3 pl-6 text-slate-300">
                        {children}
                      </ol>
                    ),

                    li: ({ children }) => (
                      <li className="flex items-start gap-3 text-[15px] leading-7 text-slate-300">
                        <span className="mt-[10px] h-2 w-2 shrink-0 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400 shadow-sm shadow-indigo-500/30" />

                        <span>{children}</span>
                      </li>
                    ),

                    strong: ({ children }) => (
                      <strong className="font-semibold text-white">
                        {children}
                      </strong>
                    ),

                    blockquote: ({ children }) => (
                      <blockquote className="my-6 rounded-r-xl border-l-4 border-indigo-500 bg-indigo-500/5 px-5 py-4 text-slate-300">
                        {children}
                      </blockquote>
                    ),

                    code: ({ children }) => (
                      <code className="rounded bg-slate-800 px-1.5 py-0.5 text-sm text-cyan-300">
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

                {!showFullSummary && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent" />
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowFullSummary((current) => !current)}
                className="
                  mx-auto
                  mt-4
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-950/40
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-slate-400
                  transition
                  hover:border-indigo-500/30
                  hover:text-white
                "
              >
                <RefreshCw
                  size={15}
                  className={showFullSummary ? "rotate-180 transition" : "transition"}
                />

                {showFullSummary ? "Show less" : "Read complete summary"}
              </button>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-4">
              <Scale
                size={18}
                className="mt-0.5 shrink-0 text-amber-300"
              />

              <p className="text-xs leading-6 text-slate-400">
                This AI-generated summary is provided for informational purposes
                and does not replace advice from a qualified legal professional.
              </p>
            </div>
          </>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/30 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
              <FileText className="text-slate-600" size={30} />
            </div>

            <p className="mt-5 text-base font-medium text-slate-300">
              No summary available
            </p>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Upload and analyse a PDF to generate its executive summary, key
              facts and important commercial terms.
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
}