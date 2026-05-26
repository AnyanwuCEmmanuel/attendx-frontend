import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from '../api.js'

function ManageSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/attendance/open-sessions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async (sessionId) => {
    setClosing(sessionId);
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `${API_URL}/api/attendance/close/${sessionId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSessions(sessions.filter((s) => s.id !== sessionId));
    } catch (err) {
      console.log(err);
    } finally {
      setClosing(null);
    }
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getTimeLeft = (expiresAt) => {
    const diff = Math.floor((new Date(expiresAt) - new Date()) / 1000);
    if (diff <= 0) return "Expired";
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return `${m}m ${s}s left`;
  };

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
              <p className="text-xs text-white/50">Session Manager</p>
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

      <main className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Open Sessions</h1>
            <p className="mt-2 text-sm text-white/55">
              {sessions.length} session{sessions.length !== 1 ? "s" : ""}{" "}
              currently running
            </p>
          </div>
          <Link
            to="/start-attendance"
            className="rounded-2xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-[1.01]"
          >
            + New Session
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 py-16 text-center backdrop-blur-2xl">
            <p className="text-white/60">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-16 text-center backdrop-blur-2xl shadow-2xl shadow-black/20">
            <p className="text-5xl">✅</p>
            <p className="mt-4 font-semibold text-white/75">No open sessions</p>
            <p className="mt-1 text-sm text-white/50">
              All attendance sessions are closed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-2xl transition hover:bg-white/10"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-bold text-cyan-300">
                        {session.courses.course_code}
                      </span>
                      <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                        ● Live
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white">
                      {session.courses.course_name}
                    </h3>

                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                      <InfoBlock label="Token" value={session.token} mono />
                      <InfoBlock
                        label="Started"
                        value={formatTime(session.started_at)}
                      />
                      <InfoBlock
                        label="Time Left"
                        value={getTimeLeft(session.expires_at)}
                        accent
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:w-40">
                    <Link
                      to={`/attendance-records/${session.id}`}
                      className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center text-xs font-semibold text-white/80 transition hover:bg-white/10"
                    >
                      👥 View Records
                    </Link>
                    <button
                      onClick={() => handleClose(session.id)}
                      disabled={closing === session.id}
                      className="rounded-2xl bg-red-500 px-3 py-3 text-xs font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {closing === session.id
                        ? "Closing..."
                        : "✕ Close Session"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function InfoBlock({ label, value, mono = false, accent = false }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
      <p className="text-xs text-white/45">{label}</p>
      <p
        className={`mt-1 ${
          mono ? "font-mono text-lg tracking-[0.2em]" : "text-sm"
        } font-semibold ${accent ? "text-orange-300" : "text-white/80"}`}
      >
        {value}
      </p>
    </div>
  );
}

export default ManageSessions;
