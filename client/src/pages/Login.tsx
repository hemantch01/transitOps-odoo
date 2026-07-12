import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signUp } from "../lib/auth-client";
import { Grid, Map, Zap, Shield, BarChart3, AlertCircle, Loader2 } from "lucide-react";

// Added specific, distinct colors for each feature subdivision
const platformFeatures = [
  {
    icon: Map,
    title: "Real-time Tracking",
    desc: "Monitor your entire fleet with live GPS telemetry and instant location updates.",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    iconBorder: "border-blue-100"
  },
  {
    icon: Zap,
    title: "Smart Dispatching",
    desc: "AI-driven route optimization and automated scheduling to maximize efficiency.",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
    iconBorder: "border-amber-100"
  },
  {
    icon: Shield,
    title: "Safety & Compliance",
    desc: "Automated maintenance alerts, compliance tracking, and driver behavior logs.",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    iconBorder: "border-emerald-100"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    desc: "Actionable insights for fuel consumption, operational expenses, and ROI.",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
    iconBorder: "border-purple-100"
  }
];

export function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("admin");
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
          setError(res.error.message || "Signup failed. Please try again.");
          return;
        }
      } else {
        const res = await signIn.email({ email, password });
        if (res.error) {
          setError(res.error.message || "Invalid credentials. Please verify your details.");
          return;
        }
      }
      navigate("/");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900 antialiased selection:bg-slate-200 selection:text-slate-900">
      
      {/* Left Column: Pure White, with colorful subdivisions - Perfectly Centered */}
      <div className="relative hidden w-1/2 flex-col justify-center overflow-hidden bg-white border-r border-slate-100 p-12 lg:flex lg:p-16 xl:p-24">
        
        {/* Ultra-faint Dot Grid for Texture */}
        <div 
          className="absolute inset-0 opacity-[0.4]"
          style={{ 
            backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)", 
            backgroundSize: "24px 24px" 
          }}
        ></div>

        {/* Inner Centered Container */}
        <div className="relative z-10 mx-auto w-full max-w-[480px]">
          {/* Brand Header */}
          <div className="mb-10 inline-flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 shadow-sm">
              <Grid className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-900">TransitOps</span>
          </div>
          
          <h1 className="text-3xl font-medium leading-[1.15] tracking-tight text-slate-900 xl:text-4xl">
            The operating system for <br/>
            <span className="text-slate-400">modern enterprise fleets.</span>
          </h1>

          {/* Crisp Feature List */}
          <div className="mt-12 space-y-8 pr-12">
            {platformFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="group flex items-start space-x-4 rounded-xl border border-transparent p-2 -ml-2 transition-colors hover:bg-slate-50">
                  <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border ${feature.iconBg} ${feature.iconColor} ${feature.iconBorder}`}>
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-medium text-slate-900">{feature.title}</h3>
                    <p className="mt-1 text-[14px] font-normal leading-relaxed text-slate-500">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Footer - Absolute positioned to the bottom */}
        <div className="absolute bottom-8 left-12 right-12 z-10 flex items-center justify-between border-t border-slate-100 pt-6 text-[13px] font-medium text-slate-500 lg:bottom-12 lg:left-16 lg:right-16 xl:bottom-16 xl:left-24 xl:right-24">
          <span>© 2026 TransitOps Inc.</span>
          <span className="flex items-center space-x-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-slate-500">All systems operational</span>
          </span>
        </div>
      </div>

      {/* Right Column: Perfectly centered vertically and horizontally */}
      <div className="flex w-full flex-col justify-center bg-white p-6 sm:p-12 lg:w-1/2 lg:p-16 xl:p-24">
        <div className="mx-auto w-full max-w-[400px]">
          
          <div className="mb-10">
            <h2 className="text-[28px] font-semibold tracking-tight text-slate-900">
              {isSignUp ? "Create an account" : "Sign in to TransitOps"}
            </h2>
            <p className="mt-2 text-[15px] text-slate-500">
              {isSignUp ? "Enter your details to get started." : "Welcome back! Please enter your details."}
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start space-x-3 rounded-xl border border-red-100 bg-red-50 p-4 text-[14px] text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="mb-2 block text-[13px] font-medium text-slate-700">
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 disabled:bg-slate-50"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-[13px] font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 disabled:bg-slate-50"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 disabled:bg-slate-50"
                placeholder="••••••••"
              />
            </div>

            {isSignUp && (
              <div>
                <label className="mb-2 block text-[13px] font-medium text-slate-700">
                  Role
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={loading}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 outline-none transition-all focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 cursor-pointer disabled:bg-slate-50"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Fleet Manager</option>
                    <option value="dispatcher">Dispatcher</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center space-x-2.5">
                <input type="checkbox" disabled={loading} className="h-4 w-4 rounded border-slate-300 text-slate-900 transition-colors focus:ring-slate-900 focus:ring-offset-0 cursor-pointer disabled:opacity-50" />
                <span className="text-[14px] text-slate-600 hover:text-slate-900 transition-colors">Remember for 30 days</span>
              </label>
              {!isSignUp && (
                <a href="#" className="text-[14px] font-medium text-slate-900 transition-colors hover:underline underline-offset-4">
                  Forgot password?
                </a>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center space-x-2 rounded-lg bg-slate-900 px-4 py-2.5 text-[15px] font-medium text-white transition-all hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              ) : (
                <span>{isSignUp ? "Create account" : "Sign in"}</span>
              )}
            </button>
          </form>

          {/* Minimalist Role Indicator */}
          {!isSignUp && (
            <div className="mt-10 rounded-xl bg-slate-50 p-5 border border-slate-100">
              <p className="mb-3 text-[13px] font-medium text-slate-700">Available Workspaces</p>
              <div className="flex flex-wrap gap-2">
                {["Fleet", "Dispatch", "Safety", "Finance"].map((r) => (
                  <span key={r} className="inline-flex items-center rounded-md bg-white px-2.5 py-1 text-[12px] font-medium text-slate-600 shadow-sm border border-slate-200">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 text-left">
            <p className="text-[14px] text-slate-500">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
                className="font-medium text-slate-900 hover:underline underline-offset-4"
              >
                {isSignUp ? "Sign in" : "Request access"}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}