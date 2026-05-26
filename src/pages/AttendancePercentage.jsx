import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from '../api.js'

function AttendancePercentage() {
  const [percentages, setPercentages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPercentages();
  }, []);

  const fetchPercentages = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/attendance/percentage`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      setPercentages(data.percentages || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "safe":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/20";
      case "warning":
        return "bg-orange-500/15 text-orange-300 border-orange-500/20";
      case "danger":
        return "bg-red-500/15 text-red-300 border-red-500/20";
      default:
        return "bg-white/10 text-white/70 border-white/10";
    }
  };

  const getBarColor = (status) => {
    switch (status) {
      case "safe":
        return "from-emerald-400 to-cyan-400";
      case "warning":
        return "from-orange-400 to-yellow-400";
      case "danger":
        return "from-red-400 to-pink-500";
      default:
        return "from-slate-400 to-slate-500";
    }
  };

  const getStatusLabel = (status, percentage) => {
    switch (status) {
      case "safe":
        return "✅ Safe to write exam";
      case "warning":
        return "⚠️ Attendance dropping";
      case "danger":
        return "❌ At risk — below 60%";
      default:
        return `${percentage}%`;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050816] text-white">
      <div className="absolute inset-0">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-600/25 blur-3xl"></div>
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl"></div>
      </div>

      <nav className="relative z-20 border-b border-white/10 bg-white/5 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/30">
              <span className="font-black text-white">A</span>
            </div>
            <div>
              <p className="font-bold">AttendX</p>
              <p className="text-xs text-white/50">Attendance Summary</p>
            </div>
          </div>
          <Link
            to="/student"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Attendance</h1>
          <p className="mt-2 text-sm text-white/55">
            You need 80% attendance to write your exams.
          </p>
        </div>

        <div className="mb-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5 shadow-xl backdrop-blur-2xl">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">
              📋
            </div>
            <div>
              <p className="font-semibold text-cyan-200">
                University Attendance Policy
              </p>
              <p className="mt-1 text-sm text-cyan-100/70">
                Minimum 80% attendance required per course to qualify for exams.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl animate-pulse"
              >
                <div className="h-4 w-1/4 rounded bg-white/10 mb-3"></div>
                <div className="h-6 w-1/2 rounded bg-white/10 mb-4"></div>
                <div className="h-3 w-full rounded bg-white/10"></div>
              </div>
            ))}
          </div>
        ) : percentages.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-16 text-center shadow-2xl shadow-black/20 backdrop-blur-2xl">
            <p className="text-5xl">📚</p>
            <p className="mt-4 font-semibold text-white/80">No courses yet</p>
            <p className="mt-1 text-sm text-white/50">
              Join a course to start tracking attendance.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {percentages.map((item) => (
              <div
                key={item.course_id}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-2xl transition hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/15 px-3 py-1 text-xs font-bold text-cyan-300">
                        {item.course_code}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(
                          item.status,
                        )}`}
                      >
                        {getStatusLabel(item.status, item.percentage)}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white">
                      {item.course_name}
                    </h3>
                    <p className="mt-1 text-sm text-white/50">
                      Exam eligibility is based on the 80% attendance rule.
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-4xl font-black ${
                        item.status === "safe"
                          ? "text-emerald-300"
                          : item.status === "warning"
                            ? "text-orange-300"
                            : "text-red-300"
                      }`}
                    >
                      {item.percentage}%
                    </p>
                    <p className="mt-1 text-xs text-white/45">attendance</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r transition-all duration-500 ${getBarColor(
                        item.status,
                      )}`}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    ></div>
                  </div>

                  <div className="relative mt-2 h-5">
                    <div
                      className="absolute top-0 h-5 w-0.5 bg-white/25"
                      style={{ left: "80%" }}
                    ></div>
                    <p
                      className="absolute -top-0.5 text-xs text-white/45"
                      style={{ left: "78%" }}
                    >
                      80%
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <StatCard label="Classes Attended" value={item.attended} />
                  <StatCard label="Total Classes" value={item.total_sessions} />
                  <StatCard
                    label="Classes to 80%"
                    value={
                      item.percentage >= 80
                        ? "✅ Done"
                        : `${Math.ceil((0.8 * item.total_sessions - item.attended) / (1 - 0.8))} more`
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
      <p className="text-xs text-white/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white/85">{value}</p>
    </div>
  );
}

export default AttendancePercentage;
