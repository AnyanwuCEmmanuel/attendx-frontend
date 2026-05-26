import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from '../api.js'

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint =
        user.role === "lecturer"
          ? `${API_URL}/api/assignments/my-assignments`
          : `${API_URL}/api/assignments/student-assignments`;

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getDeadlineStatus = (deadline) => {
    const now = new Date();
    const due = new Date(deadline);
    const diffHours = (due - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return {
        label: "Overdue",
        color: "bg-red-500/15 text-red-300 border-red-500/20",
      };
    } else if (diffHours < 24) {
      return {
        label: "Due Today",
        color: "bg-orange-500/15 text-orange-300 border-orange-500/20",
      };
    } else if (diffHours < 72) {
      return {
        label: "Due Soon",
        color: "bg-yellow-500/15 text-yellow-300 border-yellow-500/20",
      };
    } else {
      return {
        label: "Upcoming",
        color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
      };
    }
  };

  const formatDeadline = (deadline) =>
    new Date(deadline).toLocaleDateString("en-NG", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(
        `${API_URL}/api/assignments/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setAssignments(assignments.filter((a) => a.id !== id));
    } catch (err) {
      console.log(err);
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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/30">
              <span className="font-black text-white">A</span>
            </div>
            <div>
              <p className="font-bold">AttendX</p>
              <p className="text-xs text-white/50">Assignment Board</p>
            </div>
          </div>

          <Link
            to={user.role === "lecturer" ? "/lecturer" : "/student"}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Assignments</h1>
            <p className="mt-2 text-sm text-white/55">
              {user.role === "lecturer"
                ? `${assignments.length} assignment${assignments.length !== 1 ? "s" : ""} posted`
                : `${assignments.length} assignment${assignments.length !== 1 ? "s" : ""} to complete`}
            </p>
          </div>

          {user.role === "lecturer" && (
            <Link
              to="/create-assignment"
              className="rounded-2xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-[1.01]"
            >
              + New Assignment
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl animate-pulse"
              >
                <div className="h-4 w-1/4 rounded bg-white/10 mb-3"></div>
                <div className="h-6 w-1/2 rounded bg-white/10 mb-2"></div>
                <div className="h-4 w-3/4 rounded bg-white/10"></div>
              </div>
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-16 text-center shadow-2xl shadow-black/20 backdrop-blur-2xl">
            <p className="text-5xl mb-4">📝</p>
            <p className="text-lg font-semibold text-white/80">
              No assignments yet
            </p>
            <p className="mt-1 text-sm text-white/50">
              {user.role === "lecturer"
                ? "Post your first assignment for students."
                : "Your lecturers have not posted any assignments yet."}
            </p>

            {user.role === "lecturer" && (
              <Link
                to="/create-assignment"
                className="mt-6 inline-flex rounded-2xl bg-white px-6 py-3 font-semibold text-slate-900 transition hover:scale-[1.01]"
              >
                Create Assignment
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const status = getDeadlineStatus(assignment.deadline);

              return (
                <div
                  key={assignment.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-2xl transition hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-400/20">
                          {assignment.courses.course_code}
                        </span>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white">
                        {assignment.title}
                      </h3>
                      <p className="mt-1 text-sm text-white/50">
                        {assignment.courses.course_name}
                      </p>

                      <p className="mt-4 text-sm leading-relaxed text-white/70">
                        {assignment.description}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                          <p className="text-xs text-white/45">Due</p>
                          <p className="text-sm font-medium text-white/85">
                            {formatDeadline(assignment.deadline)}
                          </p>
                        </div>

                        {assignment.file_url && (
                          <a
                            href={assignment.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-cyan-300 transition hover:bg-white/10"
                          >
                            📎 View Resource
                          </a>
                        )}
                      </div>
                    </div>

                    {user.role === "lecturer" && (
                      <button
                        onClick={() => handleDelete(assignment.id)}
                        className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Assignments;
