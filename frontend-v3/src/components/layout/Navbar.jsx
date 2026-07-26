import { Bell, LogOut, Menu, Search, Upload, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials =
    user?.full_name
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  const scrollToUpload = () =>
    document
      .getElementById("upload-area")
      ?.scrollIntoView({ behavior: "smooth" });

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0B1120]/95 backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:min-h-20 sm:px-6 lg:px-8">
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
              {user
                ? `Welcome, ${user.full_name}`
                : "AI-powered legal document analysis"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="relative hidden lg:block">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              placeholder="Search documents..."
              className="w-64 rounded-xl border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="button"
            aria-label="Notifications"
            className="hidden h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 sm:flex"
          >
            <Bell size={20} />
          </button>

          <button
            type="button"
            onClick={scrollToUpload}
            className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-3 font-semibold sm:h-12 sm:px-5"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {user ? (
            <>
              <div
                title={user.email}
                className="hidden h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 font-bold xl:flex"
              >
                {initials}
              </div>

              <button
                type="button"
                onClick={logout}
                title="Sign out"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:border-red-500/50 hover:text-red-400 sm:h-12 sm:w-12"
              >
                <LogOut size={19} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex h-10 items-center gap-2 rounded-xl border border-indigo-500 px-4 font-semibold text-indigo-400 hover:bg-indigo-500 hover:text-white sm:h-12"
            >
              <LogIn size={18} />
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}