import { useEffect } from "react";
import { CheckCircle, FileText, LoaderCircle, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { deleteDocument } from "../../services/api";
import { useAnalysis } from "../../context/AnalysisContext";

export default function RecentDocuments() {
  const {
  documents = [],
  documentsLoading = false,
  refreshDocuments = async () => {},
  openDocument = async () => {},
} = useAnalysis();

  useEffect(() => { refreshDocuments().catch(() => toast.error("Could not load saved documents.")); }, [refreshDocuments]);

  const remove = async (event, id) => {
    event.stopPropagation();
    if (!window.confirm("Delete this document and its saved analysis?")) return;
    try {
      await deleteDocument(id);
      await refreshDocuments();
      toast.success("Document deleted.");
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Could not delete document.");
    }
  };

  const open = async (id) => {
    try {
      await openDocument(id);
      toast.success("Saved analysis opened.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Could not open document.");
    }
  };

  return (
    <motion.div whileHover={{ y: -3 }} className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl sm:p-8">
      <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20"><FileText className="text-blue-400" size={25} /></div><div><h2 className="text-2xl font-bold text-white">Recent Documents</h2><p className="text-sm text-slate-400">Your private, saved legal analyses</p></div></div>
      <div className="mt-8 space-y-4">
        {documentsLoading ? <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-5 text-slate-400"><LoaderCircle className="animate-spin" size={18}/> Loading documents...</div> : documents?.length ? documents.slice(0, 8).map((document) => (
          <div role="button" tabIndex={0} onKeyDown={(event) => event.key === "Enter" && open(document.document_id)} onClick={() => open(document.document_id)} key={document.document_id} className="flex w-full flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-5 text-left transition hover:border-indigo-500/60 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4"><div className="rounded-xl bg-slate-800 p-3"><FileText className="text-indigo-400" /></div><div className="min-w-0"><h3 className="truncate font-semibold text-white">{document.filename}</h3><p className="text-sm text-slate-400">{document.pages || 1} pages · {new Date(document.created_at).toLocaleDateString()}</p></div></div>
            <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2"><CheckCircle size={16} className="text-green-400"/><span className="text-sm text-green-400">Saved</span></div><button type="button" aria-label="Delete document" onClick={(event) => remove(event, document.document_id)} className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400"><Trash2 size={18}/></button></div>
          </div>
        )) : <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center text-slate-400">Upload and analyse a PDF. It will be saved to your account automatically.</div>}
      </div>
    </motion.div>
  );
}
