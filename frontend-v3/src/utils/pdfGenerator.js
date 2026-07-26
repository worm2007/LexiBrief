import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function getText(value) {
  if (value === null || value === undefined) return "";

  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;

        return (
          item?.title ||
          item?.name ||
          item?.clause ||
          item?.description ||
          item?.text ||
          JSON.stringify(item)
        );
      })
      .filter(Boolean)
      .join("\n");
  }

  if (typeof value === "object") {
    return (
      value.title ||
      value.name ||
      value.description ||
      value.text ||
      JSON.stringify(value)
    );
  }

  return String(value);
}

function cleanMarkdown(text = "") {
  return String(text)
    .replace(/#{1,6}\s?/g, "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim();
}

function addWrappedText(doc, text, x, y, width, options = {}) {
  const {
    fontSize = 10,
    fontStyle = "normal",
    lineHeight = 5,
  } = options;

  doc.setFont("helvetica", fontStyle);
  doc.setFontSize(fontSize);

  const lines = doc.splitTextToSize(cleanMarkdown(text), width);

  doc.text(lines, x, y);

  return y + lines.length * lineHeight;
}

function addPageIfNeeded(doc, y, requiredSpace = 35) {
  const pageHeight = doc.internal.pageSize.getHeight();

  if (y + requiredSpace > pageHeight - 20) {
    doc.addPage();
    return 25;
  }

  return y;
}

function addSectionTitle(doc, title, y) {
  y = addPageIfNeeded(doc, y, 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(30, 41, 59);

  doc.text(title, 14, y);

  doc.setDrawColor(99, 102, 241);
  doc.line(14, y + 2, 196, y + 2);

  doc.setTextColor(0, 0, 0);

  return y + 10;
}

function formatRiskItems(items = [], level) {
  if (!Array.isArray(items)) return [];

  return items.map((risk) => ({
    level,
    issue: risk?.issue || risk?.title || "Legal risk",
    clause: risk?.clause || "Not specified",
    impact: risk?.impact || "No impact explanation generated.",
    recommendation:
      risk?.recommendation ||
      "Review this issue with a qualified legal professional.",
  }));
}

function addRiskSection(doc, title, risks, y) {
  if (!risks.length) return y;

  y = addSectionTitle(doc, title, y);

  risks.forEach((risk, index) => {
    y = addPageIfNeeded(doc, y, 55);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${index + 1}. ${risk.issue}`, 14, y);

    y += 7;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Clause", 14, y);

    y += 5;

    y = addWrappedText(doc, risk.clause, 14, y, 182, {
      fontSize: 9,
      lineHeight: 4.5,
    });

    y += 3;

    doc.setFont("helvetica", "bold");
    doc.text("Potential impact", 14, y);

    y += 5;

    y = addWrappedText(doc, risk.impact, 14, y, 182, {
      fontSize: 9,
      lineHeight: 4.5,
    });

    y += 3;

    doc.setFont("helvetica", "bold");
    doc.text("Recommended action", 14, y);

    y += 5;

    y = addWrappedText(doc, risk.recommendation, 14, y, 182, {
      fontSize: 9,
      lineHeight: 4.5,
    });

    y += 8;

    doc.setDrawColor(220, 220, 220);
    doc.line(14, y, 196, y);

    y += 8;
  });

  return y;
}

export function generatePDF(analysis) {
  if (!analysis) {
    throw new Error("Analysis data is required.");
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const summary =
    analysis.summary ||
    analysis.document_summary ||
    analysis.analysis_summary ||
    "No summary available.";

  const riskData = analysis.risks || {};

  const highRisks = formatRiskItems(riskData.high_risks, "High");
  const mediumRisks = formatRiskItems(riskData.medium_risks, "Medium");
  const lowRisks = formatRiskItems(riskData.low_risks, "Low");

  const riskScore =
    riskData.risk_score !== null &&
    riskData.risk_score !== undefined
      ? riskData.risk_score
      : "Not available";

  const riskLevel = riskData.risk_level || "Unknown";

  const metadata =
    analysis.metadata ||
    analysis.document_metadata ||
    analysis.key_details ||
    analysis.details ||
    {};

  const keyFacts = [
    [
      "Document type",
      metadata.document_type ||
        metadata.documentType ||
        analysis.document_type ||
        "Not identified",
    ],
    [
      "Parties",
      getText(
        metadata.parties ||
          metadata.contracting_parties ||
          analysis.parties,
      ) || "Not identified",
    ],
    [
      "Effective date",
      metadata.effective_date ||
        metadata.effectiveDate ||
        analysis.effective_date ||
        "Not identified",
    ],
    [
      "Duration",
      metadata.duration ||
        metadata.term ||
        analysis.duration ||
        "Not identified",
    ],
    [
      "Payment terms",
      getText(
        metadata.payment_terms ||
          metadata.payment ||
          analysis.payment_terms,
      ) || "Not identified",
    ],
    [
      "Governing law",
      metadata.governing_law ||
        metadata.jurisdiction ||
        analysis.governing_law ||
        "Not identified",
    ],
  ];

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 52, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(23);
  doc.text("LexiBrief", pageWidth / 2, 20, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("AI Legal Document Analysis Report", pageWidth / 2, 29, {
    align: "center",
  });

  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(
    "Automated summary, clauses and legal risk assessment",
    pageWidth / 2,
    37,
    {
      align: "center",
    },
  );

  doc.setTextColor(0, 0, 0);

  autoTable(doc, {
    startY: 62,
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: {
        fontStyle: "bold",
        cellWidth: 42,
      },
    },
    body: [
      [
        "Document",
        analysis.filename || "Uploaded legal document",
      ],
      [
        "Generated",
        new Date().toLocaleString(),
      ],
    ],
  });

  let y = doc.lastAutoTable.finalY + 14;

  y = addSectionTitle(doc, "Executive Summary", y);

  y = addWrappedText(doc, summary, 14, y, 182, {
    fontSize: 10,
    lineHeight: 5,
  });

  y += 10;

  y = addSectionTitle(doc, "Key Facts", y);

  autoTable(doc, {
    startY: y,
    theme: "striped",
    head: [["Field", "Extracted value"]],
    body: keyFacts,
    styles: {
      fontSize: 9,
      cellPadding: 4,
      overflow: "linebreak",
    },
    columnStyles: {
      0: {
        fontStyle: "bold",
        cellWidth: 45,
      },
      1: {
        cellWidth: 137,
      },
    },
  });

  y = doc.lastAutoTable.finalY + 14;

  y = addSectionTitle(doc, "Risk Analysis", y);

  autoTable(doc, {
    startY: y,
    theme: "grid",
    body: [
      ["Risk score", `${riskScore} / 100`],
      ["Risk level", riskLevel],
      [
        "High-risk issues",
        String(highRisks.length),
      ],
      [
        "Medium-risk issues",
        String(mediumRisks.length),
      ],
      [
        "Low-risk issues",
        String(lowRisks.length),
      ],
    ],
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: {
        fontStyle: "bold",
        cellWidth: 50,
      },
    },
  });

  y = doc.lastAutoTable.finalY + 10;

  if (riskData.summary) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Overall assessment", 14, y);

    y += 7;

    y = addWrappedText(doc, riskData.summary, 14, y, 182, {
      fontSize: 10,
      lineHeight: 5,
    });

    y += 10;
  }

  y = addRiskSection(doc, "High Risks", highRisks, y);
  y = addRiskSection(doc, "Medium Risks", mediumRisks, y);
  y = addRiskSection(doc, "Low Risks", lowRisks, y);

  y = addSectionTitle(doc, "Important Clauses", y);

  const clauses = analysis.clauses;

  if (Array.isArray(clauses) && clauses.length > 0) {
    clauses.forEach((clause, index) => {
      y = addPageIfNeeded(doc, y, 28);

      const title =
        clause?.title ||
        clause?.name ||
        `Clause ${index + 1}`;

      const content =
        clause?.description ||
        clause?.text ||
        clause?.clause ||
        getText(clause);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`${index + 1}. ${title}`, 14, y);

      y += 6;

      y = addWrappedText(doc, content, 14, y, 182, {
        fontSize: 9,
        lineHeight: 4.5,
      });

      y += 8;
    });
  } else {
    y = addWrappedText(
      doc,
      getText(clauses) || "No important clauses were identified.",
      14,
      y,
      182,
      {
        fontSize: 10,
        lineHeight: 5,
      },
    );
  }

  y = addPageIfNeeded(doc, y + 12, 35);

  y = addSectionTitle(doc, "Disclaimer", y);

  addWrappedText(
    doc,
    "This report was generated using artificial intelligence and is provided for informational purposes only. It does not constitute legal advice and should not replace consultation with a qualified legal professional.",
    14,
    y,
    182,
    {
      fontSize: 9,
      lineHeight: 4.5,
    },
  );

  const totalPages = doc.getNumberOfPages();

  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);

    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(220, 220, 220);
    doc.line(14, pageHeight - 14, 196, pageHeight - 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    doc.text("Generated by LexiBrief AI", 14, pageHeight - 8);

    doc.text(
      `Page ${page} of ${totalPages}`,
      196,
      pageHeight - 8,
      {
        align: "right",
      },
    );
  }

  const originalFilename =
    analysis.filename || "legal-document";

  const safeFilename = originalFilename
    .replace(/\.pdf$/i, "")
    .replace(/[^a-zA-Z0-9-_]/g, "_");

  doc.save(`${safeFilename}_LexiBrief_Report.pdf`);
}