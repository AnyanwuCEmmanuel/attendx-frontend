import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from '../api.js'

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    role: "student",
    password: "",
    confirmPassword: "",
    lecturerCode: "",
    adminCode: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            studentId: formData.studentId,
            lecturerCode: formData.lecturerCode,
            adminCode: formData.adminCode,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      if (formData.role === "lecturer") {
        setSuccess(
          "Account created! Your account is pending admin approval. " +
            "You will be able to access lecturer features once approved.",
        );
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Cannot connect to server");
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl px-4 py-3 text-white placeholder:text-white/35 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-200";
  const labelClass = "block text-sm font-medium text-white/70 mb-2";

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
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
          <Link
            to="/"
            className="text-sm font-semibold text-white/70 hover:text-white transition"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md">
          {success ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-2xl p-8 text-center">
              <div className="w-16 h-16 bg-yellow-500/20 border border-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⏳</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Pending Approval
              </h2>
              <p className="text-white/60 text-sm mb-6">{success}</p>
              <Link
                to="/"
                className="inline-block bg-gradient-to-r from-indigo-500 via-cyan-500 to-fuchsia-500 text-white font-bold px-6 py-3 rounded-2xl hover:from-indigo-600 hover:via-cyan-600 hover:to-fuchsia-600 transition duration-200 shadow-lg shadow-indigo-500/20"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-1">
                Create Account
              </h2>
              <p className="text-white/60 text-sm mb-6">
                Register as a student or lecturer
              </p>

              {error && (
                <div className="bg-red-500/15 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-2xl mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Role Selector */}
                <div className="flex rounded-2xl border border-white/10 overflow-hidden mb-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, role: "student" })
                    }
                    className={`flex-1 py-2.5 text-sm font-semibold transition ${
                      formData.role === "student"
                        ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white"
                        : "bg-white/5 text-white/50 hover:bg-white/10"
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, role: "lecturer" })
                    }
                    className={`flex-1 py-2.5 text-sm font-semibold transition ${
                      formData.role === "lecturer"
                        ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white"
                        : "bg-white/5 text-white/50 hover:bg-white/10"
                    }`}
                  >
                    Lecturer
                  </button>
                </div>

                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@university.edu"
                    className={inputClass}
                  />
                </div>

                {formData.role === "student" && (
                  <div>
                    <label className={labelClass}>Matric Number</label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="e.g. CSC/2023/001"
                      className={inputClass}
                    />
                  </div>
                )}

                {formData.role === "lecturer" && (
                  <div>
                    <label className={labelClass}>
                      Lecturer Registration Code
                    </label>
                    <input
                      type="password"
                      name="lecturerCode"
                      required
                      value={formData.lecturerCode}
                      onChange={handleChange}
                      placeholder="Enter code provided by admin"
                      className={inputClass}
                    />
                    <p className="text-xs text-white/40 mt-1.5">
                      This code is provided by your department admin
                    </p>
                  </div>
                )}

                <div>
                  <label className={labelClass}>Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-fuchsia-500 hover:from-indigo-600 hover:via-cyan-600 hover:to-fuchsia-600 text-white font-bold py-3 rounded-2xl transition duration-200 shadow-lg shadow-indigo-500/20 mt-2"
                >
                  Create Account
                </button>
              </form>

              <p className="text-center text-sm text-white/60 mt-6">
                Already have an account?{" "}
                <Link
                  to="/"
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;
