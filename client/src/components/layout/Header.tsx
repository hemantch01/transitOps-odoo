import { useDispatch } from "react-redux";
import { signOut, useSession } from "../../lib/auth-client";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Bell } from "lucide-react";

export function Header() {
  const { data: session } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur-md">
      <div>
        {/* breadcrumb area */}
      </div>

      <div className="flex items-center gap-2">
        {/* notification bell */}
        <button className="relative rounded-xl p-2.5 text-slate-400 transition-all hover:bg-amber-50 hover:text-amber-600">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
          </span>
        </button>

        {/* user info */}
        {session?.user && (
          <div className="ml-1 flex items-center gap-2.5 rounded-xl bg-slate-50 px-3.5 py-2 border border-slate-100">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <User className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-700 leading-tight">
                {session.user.name || session.user.email}
              </span>
              <span className="text-[11px] font-medium text-violet-500 leading-tight">
                {(session.user as any).role || "viewer"}
              </span>
            </div>
          </div>
        )}

        {/* logout */}
        <button
          onClick={handleLogout}
          className="rounded-xl p-2.5 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-500"
          title="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
