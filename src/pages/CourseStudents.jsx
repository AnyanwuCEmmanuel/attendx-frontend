import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API_URL from '../api.js'

function CourseStudents() {
  const { courseId } = useParams();
  const [students, setStudents] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/attendance/course-students/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json();
      setStudents(data.students || []);
      setTotalSessions(data.total_sessions || 0);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "safe":
        return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20";
      case "warning":
        return "bg-orange-500/15 text-orange-300 border border-orange-500/20";
      case "danger":
        return "bg-red-500/15 text-red-300 border border-red-500/20";
      default:
        return "bg-white/10 text-white/60 border border-white/20";
    }
  };

  const getBarColor = (status) => {
    switch (status) {
      case "safe":
        return "bg-emerald-500";
      case "warning":
        return "bg-orange-500";
      case "danger":
        return "bg-red-500";
      default:
        return "bg-cyan-500";
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.matric?.toLowerCase().includes(search.toLowerCase()),
  );

  const safeCount = students.filter((s) => s.status === "safe").length;

  const atRiskCount = students.filter((s) => s.status === "danger").length;

  return (
    <div className="min-h-screen bg-[#050816] relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navbar */}
        <nav className="border-b border-white/10 bg-white/5 backdrop-blur-2xl sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 via-cyan-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-sm">A</span>
              </div>
              <span className="text-white font-bold text-lg">AttendX</span>
            </div>
            <Link
              to="/my-courses"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-2xl transition duration-200"
            >
              Back to Courses
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              Student Attendance
            </h1>
            <p className="text-white/60 text-sm mt-2">
              {totalSessions} total session{totalSessions !== 1 ? "s" : ""} held
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-2xl p-6 text-center hover:bg-white/10 transition duration-300">
              <p className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                {students.length}
              </p>
              <p className="text-white/60 text-xs mt-2 font-medium">
                TOTAL STUDENTS
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-2xl p-6 text-center hover:bg-white/10 transition duration-300">
              <p className="text-3xl font-black text-emerald-400">
                {safeCount}
              </p>
              <p className="text-white/60 text-xs mt-2 font-medium">
                ABOVE 80%
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-2xl p-6 text-center hover:bg-white/10 transition duration-300">
              <p className="text-3xl font-black text-red-400">{atRiskCount}</p>
              <p className="text-white/60 text-xs mt-2 font-medium">AT RISK</p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or matric number..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl px-4 py-3 text-white text-sm placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-200"
            />
          </div>

          {/* Students Table */}
          <div className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-2xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <p className="text-white/60">Loading students...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-5xl mb-3">🔍</p>
                <p className="text-white/60">No students found</p>
              </div>
            ) : (
              <div>
                {/* Table Header */}
                <div className="grid grid-cols-12 px-6 py-4 border-b border-white/10 bg-white/5">
                  <div className="col-span-4 text-xs font-semibold text-white/60 uppercase tracking-wide">
                    Student
                  </div>
                  <div className="col-span-2 text-xs font-semibold text-white/60 uppercase tracking-wide">
                    Matric
                  </div>
                  <div className="col-span-2 text-xs font-semibold text-white/60 uppercase tracking-wide">
                    Attended
                  </div>
                  <div className="col-span-2 text-xs font-semibold text-white/60 uppercase tracking-wide">
                    Status
                  </div>
                  <div className="col-span-2 text-xs font-semibold text-white/60 uppercase tracking-wide">
                    Percentage
                  </div>
                </div>

                {filtered.map((student) => (
                  <div
                    key={student.student_id}
                    className="grid grid-cols-12 px-6 py-4 border-b border-white/5 items-center hover:bg-white/10 transition duration-200"
                  >
                    <div className="col-span-4">
                      <p className="font-medium text-white text-sm">
                        {student.name}
                      </p>
                      <p className="text-white/60 text-xs">{student.email}</p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-white/70 text-sm font-mono">
                        {student.matric || "N/A"}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-white text-sm font-medium">
                        {student.attended}/{student.total_sessions}
                      </p>
                      <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                        <div
                          className={`h-1.5 rounded-full ${getBarColor(student.status)}`}
                          style={{ width: `${student.percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <span
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full ${getStatusColor(student.status)}`}
                      >
                        {student.status === "safe"
                          ? "✅ Safe"
                          : student.status === "warning"
                            ? "⚠️ Warning"
                            : "❌ At Risk"}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <p
                        className={`text-lg font-black ${
                          student.status === "safe"
                            ? "text-emerald-400"
                            : student.status === "warning"
                              ? "text-orange-400"
                              : "text-red-400"
                        }`}
                      >
                        {student.percentage}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseStudents;
