import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { toggleTheme } from "../../store/themeSlice";
import { signOut, useSession } from "../../lib/auth-client";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, LogOut, User } from "lucide-react";

export function Header() {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.mode);
  const { data: session } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/80 px-6 backdrop-blur-sm dark:border-dark-border dark:bg-dark-surface/80">
      <div>
        <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
          {/* page title set by each page */}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* theme toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-secondary dark:text-dark-text-secondary dark:hover:bg-dark-surface-secondary"
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

        {/* user info */}
        {session?.user && (
          <div className="flex items-center gap-2 rounded-lg bg-surface-secondary px-3 py-1.5 dark:bg-dark-surface-secondary">
            <User className="h-4 w-4 text-text-secondary dark:text-dark-text-secondary" />
            <span className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
              {session.user.name || session.user.email}
            </span>
            <span className="rounded-md bg-primary-100 px-1.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
              {(session.user as any).role || "viewer"}
            </span>
          </div>
        )}

        {/* logout */}
        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger dark:text-dark-text-secondary"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
