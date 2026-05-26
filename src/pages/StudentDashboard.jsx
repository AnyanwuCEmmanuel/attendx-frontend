import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API_URL from '../api.js'

function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    attendanceCount: 0,
  });
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  async function fetchStats() {
    try {
      const token = localStorage.getItem("token");
      const coursesRes = await fetch(`${API_URL}/api/courses/enrolled`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const coursesData = await coursesRes.json();
      const attendanceRes = await fetch(`${API_URL}/api/attendance/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const attendanceData = await attendanceRes.json();
      setStats({
        coursesEnrolled: coursesData.courses?.length || 0,
        attendanceCount: attendanceData.history?.length || 0,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async function fetchCourses() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/courses/enrolled`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingCourses(false);
    }
  }

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    fetchStats();
    fetchCourses();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) return null;

  const quickActions = [
    { icon: "✅", label: "Mark Attendance", sub: "Enter session token", path: "/mark-attendance" },
    { icon: "➕", label: "Join a Course", sub: "Enter join code", path: "/join-course" },
    { icon: "📊", label: "My Attendance", sub: "Check your 80% status", path: "/attendance-percentage" },
    { icon: "📝", label: "Assignments", sub: "Check deadlines", path: "/assignments" },
    { icon: "📓", label: "My Notes", sub: "Private notes and reminders", path: "/notes" },
    { icon: "🕐", label: "Attendance History", sub: "View all records", path: "/attendance-history" },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f1e] relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 bg-gradient-to-r from-indigo-600/30 to-slate-700/30 backdrop-blur-lg border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow">
            <span className="text-indigo-600 font-black text-sm">A</span>
          </div>
          <span className="text-white font-bold text-lg">AttendX</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-indigo-200 text-sm hidden sm:block">{user.name}</span>
          <button
            onClick={handleLogout}
            className="bg-white/10 border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-white/20 backdrop-blur-md transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-indigo-300 to-fuchsia-300 bg-clip-text text-transparent">
            Welcome back, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-white/60 mt-1">Here is your academic overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-xl p-5 shadow-lg hover:bg-white/15 transition">
            <p className="text-white/60 text-sm">Courses Enrolled</p>
            <p className="text-3xl font-bold text-cyan-400 mt-1">{stats.coursesEnrolled}</p>
          </div>
          <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-xl p-5 shadow-lg hover:bg-white/15 transition">
            <p className="text-white/60 text-sm">Classes Attended</p>
            <p className="text-3xl font-bold text-green-400 mt-1">{stats.attendanceCount}</p>
          </div>
          <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-xl p-5 shadow-lg hover:bg-white/15 transition">
            <p className="text-white/60 text-sm">Assignments Due</p>
            <p className="text-3xl font-bold text-orange-400 mt-1">0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-white font-semibold text-lg mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map(({ icon, label, sub, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex items-center gap-3 border border-white/10 bg-white/5 rounded-xl px-4 py-3 hover:bg-white/10 hover:border-cyan-400/40 transition text-left w-full"
              >
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="font-medium text-white">{label}</p>
                  <p className="text-xs text-white/50">{sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* My Courses */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">My Courses</h2>
            <button
              onClick={() => navigate("/my-courses")}
              className="text-sm text-cyan-400 font-medium hover:text-cyan-300 hover:underline transition"
            >
              View all →
            </button>
          </div>

          {loadingCourses ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-1/3 mb-2"></div>
                  <div className="h-5 bg-white/10 rounded w-2/3 mb-1"></div>
                  <div className="h-4 bg-white/10 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">📚</p>
              <p className="text-white/50 text-sm">You have not joined any courses yet</p>
              <button
                onClick={() => navigate("/join-course")}
                className="mt-3 text-cyan-400 text-sm font-medium hover:underline"
              >
                Join your first course →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {courses.slice(0, 4).map((item) => {
                const course = item.courses;
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 hover:border-cyan-400/30 transition cursor-pointer"
                    onClick={() => navigate("/my-courses")}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-cyan-400/20 text-cyan-300 text-xs font-bold px-2 py-1 rounded-full">
                        {course.course_code}
                      </span>
                      <span className="text-xs text-white/40">{course.year} Level</span>
                    </div>
                    <p className="font-semibold text-white text-sm leading-snug">{course.course_name}</p>
                    <p className="text-white/50 text-xs mt-1">{course.department}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/mark-attendance");
                      }}
                      className="mt-3 w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs font-semibold py-2 rounded-lg transition shadow shadow-indigo-500/20"
                    >
                      ✅ Mark Attendance
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;