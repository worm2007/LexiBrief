import { useState } from "react";
import { FileText, Settings as SettingsIcon, Layers } from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import HeroUpload from "../components/upload/HeroUpload";
import StatsGrid from "../components/dashboard/StatsGrid";
import Tabs from "../components/dashboard/Tabs";
import SummaryPanel from "../components/dashboard/SummaryPanel";
import RiskPanel from "../components/dashboard/RiskPanel";
import RecentDocuments from "../components/dashboard/RecentDocuments";
import ClausePanel from "../components/dashboard/ClausePanel";
import AIChat from "../components/chat/AIChat";

function ComingSoonPanel({ icon: Icon, title, description }) {
  return (
    <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-center sm:mt-8 sm:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
        <Icon size={28} />
      </div>

      <h2 className="mt-5 text-xl font-bold text-white sm:text-2xl">{title}</h2>

      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
        {description}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarNavigation = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);

    const tabMap = {
      Dashboard: "Overview",
      "AI Lawyer": "AI Chat",
      "Risk Analysis": "Risk Analysis",
      "Clause Library": "Clauses",
    };

    if (tabMap[section]) {
      setActiveTab(tabMap[section]);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    const sectionMap = {
      Overview: "Dashboard",
      Clauses: "Clause Library",
      "Risk Analysis": "Risk Analysis",
      "AI Chat": "AI Lawyer",
    };

    setActiveSection(sectionMap[tab] ?? "Dashboard");
  };

  const renderDashboardContent = () => (
    <>
      <HeroUpload />
      <StatsGrid />

      <Tabs activeTab={activeTab} setActiveTab={handleTabChange} />

      {activeTab === "Overview" && (
        <>
          <div className="mt-6 grid min-w-0 gap-6 xl:mt-8 xl:grid-cols-2 xl:gap-8">
            <div className="min-w-0"><SummaryPanel /></div>
            <div className="min-w-0"><RiskPanel /></div>
          </div>
          <RecentDocuments />
        </>
      )}

      {activeTab === "Clauses" && (
        <div className="mt-6 min-w-0 sm:mt-8"><ClausePanel /></div>
      )}

      {activeTab === "Risk Analysis" && (
        <div className="mt-6 min-w-0 sm:mt-8"><RiskPanel /></div>
      )}

      {activeTab === "AI Chat" && (
        <div className="mt-6 min-w-0 sm:mt-8"><AIChat /></div>
      )}
    </>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "Documents":
        return (
          <>
            <HeroUpload />
            <StatsGrid />
            <div className="mt-6 min-w-0 sm:mt-8"><RecentDocuments /></div>
          </>
        );

      case "AI Lawyer":
        return (
          <>
            <StatsGrid />
            <div className="mt-6 min-w-0 sm:mt-8"><AIChat /></div>
          </>
        );

      case "Risk Analysis":
        return (
          <>
            <StatsGrid />
            <div className="mt-6 min-w-0 sm:mt-8"><RiskPanel /></div>
          </>
        );

      case "Clause Library":
        return (
          <>
            <StatsGrid />
            <div className="mt-6 min-w-0 sm:mt-8"><ClausePanel /></div>
          </>
        );

      case "Templates":
        return (
          <ComingSoonPanel
            icon={Layers}
            title="Legal Templates"
            description="Reusable legal document templates can be added here after the core analysis workflow is complete."
          />
        );

      case "Settings":
        return (
          <ComingSoonPanel
            icon={SettingsIcon}
            title="Settings"
            description="Account preferences, API options and application settings will appear here."
          />
        );

      case "Dashboard":
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-[#020617] text-white">
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleSidebarNavigation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-10">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
