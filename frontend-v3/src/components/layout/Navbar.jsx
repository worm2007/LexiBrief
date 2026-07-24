import {
  Search,
  Bell,
  Upload,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 h-20 bg-[#0B1120]/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-8">

      {/* Left */}

      <div className="flex items-center gap-6">

        <div>
          <h1 className="text-3xl font-bold text-white">
            Legal Intelligence
          </h1>

          <p className="text-slate-400 text-sm mt-1">
            AI-powered contract review platform
          </p>
        </div>

      </div>

      {/* Right */}

      <div className="flex items-center gap-5">

        {/* Search */}

        <div className="relative">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            placeholder="Search documents..."
            className="w-72 rounded-xl bg-slate-900 border border-slate-700 py-3 pl-11 pr-4 text-white outline-none focus:border-indigo-500"
          />

        </div>

        {/* Notification */}

        <button className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 flex items-center justify-center">

          <Bell size={20} />

        </button>

        {/* Upload */}

        <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 font-semibold hover:scale-105 transition">

          <Upload size={18} />

          Upload

        </button>

        {/* AI */}

        <button className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">

          <Sparkles size={20} />

        </button>

        {/* Avatar */}

        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center font-bold">

          A

        </div>

      </div>

    </header>
  );
}