import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from '../api.js'

function AttendanceHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/attendance/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) =>
    new Date(timestamp).toLocaleDateString("en-NG", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });

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
              <p className="text-xs text-white/50">Attendance History</p>
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
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Attendance History</h1>
            <p className="mt-2 text-sm text-white/55">
              All your attendance records.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3">
            <span className="text-2xl font-bold text-cyan-300">
              {history.length}
            </span>
            <span className="text-sm text-cyan-100/80">
              session{history.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          {loading ? (
            <div className="p-12 text-center text-white/60">
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-5xl">📋</p>
              <p className="mt-4 font-semibold text-white/80">
                No attendance records yet
              </p>
              <p className="mt-1 text-sm text-white/50">
                Your attendance will appear here after you mark it.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-12 border-b border-white/10 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white/45">
                <div className="col-span-4">Course</div>
                <div className="col-span-4">Date</div>
                <div className="col-span-2">Time</div>
                <div className="col-span-2">Status</div>
              </div>

              <div>
                {history.map((record) => (
                  <div
                    key={record.id}
                    className="grid grid-cols-12 items-center border-b border-white/5 px-6 py-4 transition hover:bg-white/5"
                  >
                    <div className="col-span-12 mb-3 sm:col-span-4 sm:mb-0">
                      <p className="text-sm font-medium text-white">
                        {record.attendance_sessions.courses.course_code}
                      </p>
                      <p className="text-xs text-white/45">
                        {record.attendance_sessions.courses.course_name}
                      </p>
                    </div>

                    <div className="col-span-12 mb-3 sm:col-span-4 sm:mb-0">
                      <p className="text-sm text-white/75">
                        {formatDate(record.submitted_at)}
                      </p>
                    </div>

                    <div className="col-span-6 sm:col-span-2">
                      <p className="text-sm text-cyan-300">
                        {formatTime(record.submitted_at)}
                      </p>
                    </div>

                    <div className="col-span-6 sm:col-span-2">
                      <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                        Present
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default AttendanceHistory;
