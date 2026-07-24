import {
  FileText,
  AlertTriangle,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";

export default function Tabs({ activeTab, setActiveTab }) {
  const tabs = [
    {
      name: "Overview",
      icon: FileText,
    },
    {
      name: "Clauses",
      icon: ShieldCheck,
    },
    {
      name: "Risk Analysis",
      icon: AlertTriangle,
    },
    {
      name: "AI Chat",
      icon: MessageSquare,
    },
  ];

  return (
    <div
      className="
        mt-8
        rounded-2xl
        border
        border-slate-800
        bg-slate-900/60
        p-2
        backdrop-blur-xl
      "
    >
      <div
        className="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-2
        "
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              type="button"
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                px-4
                py-3
                transition
                ${
                  activeTab === tab.name
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              <Icon size={18} />

              <span className="text-sm font-medium">
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}