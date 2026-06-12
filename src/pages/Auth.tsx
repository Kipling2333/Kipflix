import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Logo } from "../components/Logo";

export default function Auth({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as { from?: string })?.from || "/home";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(name, email, password);
      toast(mode === "login" ? "Welcome back!" : "Account created — enjoy KipFlix!", "success");
      nav(from, { replace: true });
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = (admin?: boolean) => {
    setEmail(admin ? "admin@kipflix.com" : "demo@kipflix.com");
    setPassword(admin ? "admin123" : "demo123");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      {/* backdrop */}
      <div className="absolute inset-0">
        <img src="/art/nightfall.jpg" alt="" className="h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-[#08080b]" />
      </div>

      <div className="animate-fade-up relative w-full max-w-md rounded-2xl border border-white/10 bg-black/70 p-7 shadow-2xl backdrop-blur-xl sm:p-9">
        <Logo variant="full" className="mb-6" />
        <h1 className="text-2xl font-black tracking-tight text-white">
          {mode === "login" ? "Sign in" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          {mode === "login" ? "Welcome back to KipFlix." : "Start streaming in seconds — it's free."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "register" && (
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jane Doe"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-red-500/50"
              />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm text-zinc-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-red-500/50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-zinc-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-red-500/50"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-red-600 py-3 font-bold text-white shadow-lg shadow-red-900/30 transition-colors hover:bg-red-500 disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {mode === "login" && (
          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Demo accounts</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => fillDemo(false)}
                className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/10"
              >
                👤 Viewer
              </button>
              <button
                onClick={() => fillDemo(true)}
                className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/10"
              >
                🛠 Admin
              </button>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-zinc-400">
          {mode === "login" ? (
            <>
              New to KipFlix?{" "}
              <Link to="/register" className="font-semibold text-red-400 hover:text-red-300">
                Sign up now
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-red-400 hover:text-red-300">
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
