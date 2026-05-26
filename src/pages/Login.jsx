import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_URL from '../api.js'

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ fixed: removed hardcoded localhost:5000
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const role = data.user?.role;
      const status = data.user?.status;

      if (role === "admin" && status === "active") {
        navigate("/admin");
      } else if (role === "lecturer" && status === "pending_lecturer") {
        navigate("/pending-approval");
      } else if (role === "lecturer" && status === "active") {
        navigate("/lecturer");
      } else if (role === "student" && status === "active") {
        navigate("/student");
      } else {
        setError("Your account is not ready yet");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } catch (err) {
      setError("Cannot connect to server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050816] text-white flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-600/30 blur-3xl"></div>
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:flex flex-col justify-center space-y-6 pr-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="text-sm text-white/80">AttendX Portal</span>
          </div>

          <div>
            <h1 className="text-5xl font-bold leading-tight">
              Smart attendance.
              <span className="block bg-gradient-to-r from-cyan-300 via-indigo-300 to-fuchsia-300 bg-clip-text text-transparent">
                Clean design.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/70 leading-7">
              Manage attendance, assignments, and courses in one powerful portal
              built for students and lecturers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 max-w-xl">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <p className="text-sm text-white/60">Attendance</p>
              <p className="mt-2 text-2xl font-semibold">Live history</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <p className="text-sm text-white/60">Assignments</p>
              <p className="mt-2 text-2xl font-semibold">Quick actions</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <p className="text-sm text-white/60">Courses</p>
              <p className="mt-2 text-2xl font-semibold">Organized view</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <p className="text-sm text-white/60">Security</p>
              <p className="mt-2 text-2xl font-semibold">Role-based</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden">
            <div className="px-8 py-8 border-b border-white/10 bg-gradient-to-r from-white/10 to-white/5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <span className="text-white font-black text-xl">A</span>
                </div>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
                  Secure Login
                </span>
              </div>
              <h2 className="mt-6 text-3xl font-bold">Welcome back</h2>
              <p className="mt-2 text-sm text-white/60">
                Sign in to continue to your dashboard.
              </p>
            </div>

            <div className="px-8 py-8">
              {error && (
                <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/30"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-medium text-white/80">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-cyan-300 hover:text-cyan-200 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-white placeholder:text-white/35 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-white/60 hover:text-white"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-fuchsia-500 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-[1.01] hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-white/60">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-cyan-300 hover:text-cyan-200 hover:underline"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
