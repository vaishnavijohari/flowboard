import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    // Fake login for now — backend comes in Phase 2
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div className="flex h-screen">

      {/* Left — Brand Panel */}
      <div className="hidden md:flex w-1/2 flex-col items-center justify-center p-12"
        style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-semibold text-white"
            style={{ background: "rgba(255,255,255,0.2)" }}>
            F
          </div>
          <span className="text-2xl font-semibold text-white">FlowBoard</span>
        </div>

        {/* Tagline */}
        <h1 className="text-3xl font-semibold text-white text-center leading-snug mb-3">
          Manage work,<br />your way.
        </h1>
        <p className="text-white text-center text-sm mb-10"
          style={{ opacity: 0.75 }}>
          Boards, tasks, and teamwork — all in one place.
        </p>

        {/* Feature pills */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {[
            "Drag & drop Kanban boards",
            "Priority tracking & due dates",
            "Real-time team collaboration",
          ].map((f) => (
            <div key={f}
              className="rounded-lg px-4 py-3 text-sm text-white"
              style={{ background: "rgba(255,255,255,0.15)" }}>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 bg-white">
        <div className="w-full max-w-sm">

          {/* Mobile logo — only shows on small screens */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
              style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}>
              F
            </div>
            <span className="text-lg font-semibold text-gray-800">FlowBoard</span>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-gray-500 mb-7">
            Sign in to your FlowBoard account
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": "#a855f7" }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": "#a855f7" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 mt-1 transition-opacity hover:opacity-90 disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>

          </form>

          <p className="text-sm text-center text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium" style={{ color: "#a855f7" }}>
              Sign up
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}