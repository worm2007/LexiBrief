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

import { Scale, X } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

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
  isOpen = false,
  onClose = () => {},
}) {
  const { user } = useAuth();
  const initials = user?.full_name?.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "U";

  const handleNavigation = (section) => {
    onNavigate(section);
    onClose();
  };

  return (
    <>
      {/* Mobile background overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex min-h-screen w-72 flex-col justify-between
          overflow-y-auto border-r border-slate-800
          bg-[#0B1220]
          transition-transform duration-300 ease-in-out

          md:static md:z-auto md:flex-shrink-0 md:translate-x-0

          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Mobile close button */}
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-300 hover:bg-slate-800 md:hidden"
        >
          <X size={22} />
        </button>

        <div>
          <div className="px-8 pb-6 pt-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500">
                <Scale size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  LexiBrief
                </h1>

                <p className="text-xs text-slate-400">
                  AI Legal Intelligence
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2 px-4">
            {menu.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.name;

              return (
                <motion.button
                  type="button"
                  whileHover={{ x: 6 }}
                  key={item.name}
                  onClick={() => handleNavigation(item.name)}
                  className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 transition-all ${
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

              <h3 className="font-semibold text-white">
                Upgrade to Pro
              </h3>
            </div>

            <p className="mt-3 text-sm leading-6 text-blue-100">
              Unlock advanced AI legal analysis, unlimited uploads and premium
              clause detection.
            </p>

            <button
              type="button"
              onClick={() => handleNavigation("Settings")}
              className="mt-5 w-full rounded-xl bg-white py-3 font-semibold text-indigo-700 transition hover:scale-105"
            >
              Upgrade
            </button>
          </div>

          <div className="mt-6 flex items-center gap-4 rounded-2xl bg-slate-900 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 font-bold text-white">
              {initials}
            </div>

            <div>
              <h4 className="font-semibold text-white">
                {user?.full_name || "LexiBrief User"}
              </h4>

              <p className="text-xs text-slate-400">
                {user?.email || "Secure account"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}