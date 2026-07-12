import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signUp } from "../lib/auth-client";
import { Truck } from "lucide-react";

export function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const res = await signUp.email({ email, password, name });
        if (res.error) {
          setError(res.error.message || "signup failed");
          return;
        }
      } else {
        const res = await signIn.email({ email, password });
        if (res.error) {
          setError(res.error.message || "invalid credentials");
          return;
        }
      }
      navigate("/");
    } catch (err: any) {
      setError(err.message || "something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-dark-surface dark:via-dark-surface dark:to-dark-surface-secondary">
      <div className="w-full max-w-md animate-slide-up">
        {/* logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary-500/25">
            <Truck className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-text-primary dark:text-dark-text-primary">
            TransitOps
          </h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-dark-text-secondary">
            transport operations platform
          </p>
        </div>

        {/* form card */}
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm dark:border-dark-border dark:bg-dark-surface">
          <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">
            {isSignUp ? "create account" : "sign in"}
          </h2>
          <p className="mt-1 text-sm text-text-secondary dark:text-dark-text-secondary">
            {isSignUp ? "get started with TransitOps" : "welcome back"}
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-danger/10 px-4 py-2.5 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {isSignUp && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-dark-text-primary">
                  name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary"
                  placeholder="your name"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-dark-text-primary">
                email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-dark-text-primary">
                password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg gradient-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "..." : isSignUp ? "create account" : "sign in"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              {isSignUp ? "already have an account? sign in" : "need an account? sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}