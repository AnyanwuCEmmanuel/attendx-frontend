import { useState } from "react";
import { Link } from "react-router-dom";
import API_URL from '../api.js'

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        fetch(`${API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      ));

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      <nav className="border-b border-white/10 bg-white/5 backdrop-blur-2xl sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-cyan-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg">A</span>
            </div>
            <span className="text-white font-bold text-xl">AttendX</span>
          </Link>
          <div className="flex gap-4">
            <Link
              to="/"
              className="text-white/70 hover:text-white text-sm font-medium transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-2xl transition duration-200"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md">
          {!success ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Reset Password
              </h2>
              <p className="text-white/60 text-sm mb-6">
                Enter your email and we will send you a reset link
              </p>

              {error && (
                <div className="bg-red-500/15 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-2xl mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl px-4 py-3 text-white placeholder:text-white/35 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-fuchsia-500 hover:from-indigo-600 hover:via-cyan-600 hover:to-fuchsia-600 text-white font-bold py-3 rounded-2xl transition duration-200 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-2xl p-8 text-center">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📧</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-3">
                Check Your Email
              </h2>
              <p className="text-white/60 text-sm mb-2">
                We sent a password reset link to:
              </p>
              <p className="text-cyan-300 font-semibold mb-4">{email}</p>
              <p className="text-white/50 text-xs">
                The link expires in 1 hour. Check your spam folder if you do not
                see it.
              </p>
            </div>
          )}

          <p className="text-center text-sm text-white/60 mt-6">
            Remember your password?{" "}
            <Link
              to="/"
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
