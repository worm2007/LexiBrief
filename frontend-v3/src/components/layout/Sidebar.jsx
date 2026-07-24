import {
  FiHome,
  FiFileText,
  FiShield,
  FiMessageSquare,
  FiSettings,
  FiFolder,
  FiStar,
  FiLayers,
} from "react-icons/fi";

import { Scale } from "lucide-react";
import { motion } from "framer-motion";

const menu = [
  { name: "Dashboard", icon: FiHome },
  { name: "Documents", icon: FiFolder },
  { name: "AI Lawyer", icon: FiMessageSquare },
  { name: "Risk Analysis", icon: FiShield },
  { name: "Clause Library", icon: FiFileText },
  { name: "Templates", icon: FiLayers },
  { name: "Settings", icon: FiSettings },
];

export default function Sidebar({
  activeSection,
  onNavigate,
}) {
  return (
    <aside className="w-72 min-h-screen bg-[#0B1220] border-r border-slate-800 flex flex-col justify-between">
      <div>
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
              <Scale size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                LexiBrief
              </h1>

              <p className="text-xs text-slate-400">
                AI Legal Intelligence
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 mt-4 space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.name;

            return (
              <motion.button
                type="button"
                whileHover={{ x: 6 }}
                key={item.name}
                onClick={() => onNavigate(item.name)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-xl">
                  <Icon />
                </span>

                <span className="font-medium">
                  {item.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="p-5">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-600 p-5">
          <div className="flex items-center gap-2">
            <FiStar />

            <h3 className="font-semibold">
              Upgrade to Pro
            </h3>
          </div>

          <p className="text-sm text-blue-100 mt-3 leading-6">
            Unlock advanced AI legal analysis, unlimited uploads and premium
            clause detection.
          </p>

          <button
            type="button"
            onClick={() => onNavigate("Settings")}
            className="mt-5 w-full rounded-xl bg-white text-indigo-700 font-semibold py-3 hover:scale-105 transition"
          >
            Upgrade
          </button>
        </div>

        <div className="mt-6 flex items-center gap-4 rounded-2xl bg-slate-900 p-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center font-bold">
            A
          </div>

          <div>
            <h4 className="font-semibold">
              Anubhav
            </h4>

            <p className="text-xs text-slate-400">
              Legal Analyst
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
