import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import API_URL from '../api.js'

// ✅ Moved outside the component
const Background = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
    <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
    <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
  </div>
);

// ✅ Moved outside the component
const Navbar = () => (
  <nav className="border-b border-white/10 bg-white/5 backdrop-blur-2xl sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-cyan-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white font-black text-lg">A</span>
        </div>
        <span className="text-white font-bold text-xl">AttendX</span>
      </Link>
      <Link to="/" className="text-sm font-semibold text-white/70 hover:text-white transition">
        Sign In
      </Link>
    </div>
  </nav>
);

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-hidden">
        <Background />
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
          <div className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-2xl p-8 text-center max-w-md w-full">
            <p className="text-5xl mb-4">❌</p>
            <h2 className="text-xl font-bold text-white mb-2">Invalid Link</h2>
            <p className="text-white/60 text-sm mb-6">
              This password reset link is invalid or has expired
            </p>
            <Link
              to="/forgot-password"
              className="inline-block bg-gradient-to-r from-indigo-500 via-cyan-500 to-fuchsia-500 text-white font-bold px-6 py-3 rounded-2xl hover:from-indigo-600 hover:via-cyan-600 hover:to-fuchsia-600 transition duration-200 shadow-lg shadow-indigo-500/20"
            >
              Request New Link
            </Link>
            <p className="text-center text-sm text-white/60 mt-6">
              Remember your password?{" "}
              <Link to="/" className="text-cyan-400 hover:text-cyan-300 font-semibold transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-hidden">
      <Background />
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md">
          {!success ? (
            <>
              <div className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Create New Password
                </h2>
                <p className="text-white/60 text-sm mb-6">
                  Enter your new password below
                </p>

                {error && (
                  <div className="bg-red-500/15 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-2xl mb-6">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl px-4 py-3 text-white placeholder:text-white/35 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl px-4 py-3 text-white placeholder:text-white/35 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-200"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-fuchsia-500 hover:from-indigo-600 hover:via-cyan-600 hover:to-fuchsia-600 text-white font-bold py-3 rounded-2xl transition duration-200 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              </div>

              <p className="text-center text-sm text-white/60 mt-6">
                Remember your password?{" "}
                <Link to="/" className="text-cyan-400 hover:text-cyan-300 font-semibold transition">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-2xl p-8 text-center">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Password Reset!
              </h2>
              <p className="text-white/60 text-sm">
                Your password has been reset successfully. Redirecting to login...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;