import { Search, Bell, Upload, Sparkles, Menu } from "lucide-react";

export default function Navbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0B1120]/95 backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:min-h-20 sm:px-6 lg:px-8">
        {/* Left: mobile menu + title */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-white hover:bg-slate-800 md:hidden"
          >
            <Menu size={21} />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-white sm:text-2xl lg:text-3xl">
              Legal Intelligence
            </h1>
            <p className="hidden truncate text-sm text-slate-400 sm:block">
              AI-powered contract review platform
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-5">
          <div className="relative hidden lg:block">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              placeholder="Search documents..."
              className="w-64 rounded-xl border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-white outline-none focus:border-indigo-500 xl:w-72"
            />
          </div>

          <button
            type="button"
            aria-label="Notifications"
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 sm:flex sm:h-12 sm:w-12"
          >
            <Bell size={20} />
          </button>

          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-3 font-semibold transition hover:scale-105 sm:h-12 sm:px-5 lg:px-6"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">Upload</span>
          </button>

          <button
            type="button"
            aria-label="AI tools"
            className="hidden h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 xl:flex"
          >
            <Sparkles size={20} />
          </button>

          <div className="hidden h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 font-bold xl:flex">
            A
          </div>
        </div>
      </div>

      {/* Mobile/tablet search */}
      <div className="px-4 pb-3 lg:hidden">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            placeholder="Search documents..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-indigo-500"
          />
        </div>
      </div>
    </header>
  );
}
