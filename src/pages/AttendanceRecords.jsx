import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API_URL from '../api.js'

function AttendanceRecords() {
  const { sessionId } = useParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecords();
    const interval = setInterval(fetchRecords, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/attendance/session/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      setRecords(data.records || []);
    } catch (err) {
      setError("Could not load records");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050816] text-white">
      <div className="absolute inset-0">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-600/25 blur-3xl"></div>
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl"></div>
      </div>

      <nav className="relative z-20 border-b border-white/10 bg-white/5 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/30">
              <span className="font-black text-white">A</span>
            </div>
            <div>
              <p className="font-bold">AttendX</p>
              <p className="text-xs text-white/50">Attendance Records</p>
            </div>
          </div>
          <Link
            to="/lecturer"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Attendance Records</h1>
            <p className="mt-2 text-sm text-white/55">
              Updates automatically every 10 seconds
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3">
            <span className="text-2xl font-bold text-emerald-300">
              {records.length}
            </span>
            <span className="text-sm text-emerald-200/80">present</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          {loading ? (
            <div className="p-12 text-center text-white/60">
              Loading records...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-300">{error}</div>
          ) : records.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-5xl">👥</p>
              <p className="mt-4 font-medium text-white/75">No students yet</p>
              <p className="mt-1 text-sm text-white/50">
                Waiting for students to submit the token.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-12 border-b border-white/10 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white/45">
                <div className="col-span-1">#</div>
                <div className="col-span-5">Name</div>
                <div className="col-span-3">Matric No</div>
                <div className="col-span-3">Time</div>
              </div>

              <div>
                {records.map((record, index) => (
                  <div
                    key={record.id}
                    className="grid grid-cols-12 items-center border-b border-white/5 px-6 py-4 transition hover:bg-white/5"
                  >
                    <div className="col-span-1 text-sm text-white/45">
                      {index + 1}
                    </div>
                    <div className="col-span-5">
                      <p className="text-sm font-medium text-white">
                        {record.users.name}
                      </p>
                      <p className="text-xs text-white/45">
                        {record.users.email}
                      </p>
                    </div>
                    <div className="col-span-3">
                      <span className="font-mono text-sm text-cyan-300">
                        {record.users.student_id || "N/A"}
                      </span>
                    </div>
                    <div className="col-span-3">
                      <span className="text-sm font-medium text-emerald-300">
                        {formatTime(record.submitted_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {records.length > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4">
            <p className="text-sm font-medium text-emerald-200">
              {records.length} student{records.length !== 1 ? "s" : ""} marked
              present
            </p>
            <span className="text-xl">✅</span>
          </div>
        )}
      </main>
    </div>
  );
}

export default AttendanceRecords;
