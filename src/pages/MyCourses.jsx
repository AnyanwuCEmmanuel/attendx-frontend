import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from '../api.js'

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint =
        user.role === "lecturer"
          ? `${API_URL}/api/courses/my-courses`
          : `${API_URL}/api/courses/enrolled`;

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050816] text-white">
      <div className="absolute inset-0">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full 
        bg-indigo-600/25 blur-3xl"></div>
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full 
        bg-cyan-500/20 blur-3xl"></div>
      </div>

      <nav className="relative z-20 border-b border-white/10 
      bg-white/5 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center 
        justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center 
            rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 
            shadow-lg shadow-indigo-500/30">
              <span className="font-black text-white">A</span>
            </div>
            <div>
              <p className="font-bold">AttendX</p>
              <p className="text-xs text-white/50">Courses</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user.role === "student" && (
              <button
                onClick={() => navigate("/join-course")}
                className="rounded-xl border border-white/20 
                bg-white/10 px-4 py-2 text-sm font-semibold 
                text-white transition hover:bg-white/20"
              >
                + Join Course
              </button>
            )}
            <Link
              to={user.role === "lecturer" ? "/lecturer" : "/student"}
              className="rounded-xl bg-white px-4 py-2 text-sm 
              font-semibold text-slate-900 transition hover:scale-[1.02]"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-6xl px-4 
      py-8 sm:px-6 lg:px-8">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {user.role === "lecturer" ? "My Courses" : "Enrolled Courses"}
            </h1>
            <p className="mt-2 text-sm text-white/55">
              {user.role === "lecturer"
                ? `You are teaching ${courses.length} course${courses.length !== 1 ? "s" : ""}`
                : `You are enrolled in ${courses.length} course${courses.length !== 1 ? "s" : ""}`
              }
            </p>
          </div>

          {user.role === "lecturer" && (
            <Link
              to="/create-course"
              className="rounded-2xl bg-gradient-to-r from-indigo-500 
              via-cyan-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold 
              text-white shadow-lg shadow-indigo-500/25 transition 
              hover:scale-[1.01]"
            >
              + New Course
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl border border-white/10 
              bg-white/5 p-6 backdrop-blur-2xl animate-pulse">
                <div className="h-4 bg-white/10 rounded w-1/3 mb-3"></div>
                <div className="h-6 bg-white/10 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
              </div>
            ))}
          </div>

        ) : courses.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 
          p-12 text-center backdrop-blur-2xl shadow-2xl shadow-black/20">
            <p className="text-5xl">📭</p>
            <p className="mt-3 font-medium text-white/75">No courses yet</p>
            <p className="mt-1 text-sm text-white/50">
              {user.role === "lecturer"
                ? "Create your first course to get started"
                : "Join a course using a join code"}
            </p>
            {user.role === "student" && (
              <button
                onClick={() => navigate("/join-course")}
                className="mt-6 rounded-xl bg-gradient-to-r 
                from-indigo-500 to-cyan-500 px-6 py-3 text-sm 
                font-semibold text-white transition hover:scale-[1.02]"
              >
                Join a Course
              </button>
            )}
          </div>

        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((item) => {
              const course = user.role === "lecturer" ? item : item.courses;

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-white/10 
                  bg-white/5 p-6 shadow-xl backdrop-blur-2xl transition 
                  hover:-translate-y-1 hover:bg-white/10 
                  flex flex-col justify-between"
                >
                  {/* Top */}
                  <div>
                    <div className="mb-4 flex items-start justify-between">
                      <span className="rounded-full bg-cyan-400/15 
                      px-3 py-1 text-xs font-semibold text-cyan-300">
                        {course.course_code}
                      </span>
                      <span className="text-xs text-white/40">
                        {course.year} Level
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-white 
                    leading-snug">
                      {course.course_name}
                    </h3>
                    <p className="mt-2 text-sm text-white/55">
                      {course.department}
                    </p>
                    <p className="mt-1 text-xs text-white/35">
                      {course.semester} Semester
                    </p>

                    {/* Join Code for Lecturer */}
                    {user.role === "lecturer" && (
                      <div className="mt-4 rounded-2xl border 
                      border-white/10 bg-black/10 px-4 py-3">
                        <div className="mb-1 text-xs text-white/45">
                          Join Code
                        </div>
                        <div className="font-mono text-lg font-bold 
                        tracking-[0.2em] text-cyan-300">
                          {course.join_code}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-5">
                    {user.role === "lecturer" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(
                            `/course-students/${course.id}`
                          )}
                          className="flex-1 rounded-xl border 
                          border-white/20 bg-white/10 py-2 text-sm 
                          font-semibold text-white transition 
                          hover:bg-white/20"
                        >
                          👥 Students
                        </button>
                        <button
                          onClick={() => navigate("/start-attendance")}
                          className="flex-1 rounded-xl bg-gradient-to-r 
                          from-indigo-500 to-cyan-500 py-2 text-sm 
                          font-semibold text-white shadow-lg 
                          shadow-indigo-500/25 transition 
                          hover:scale-[1.02]"
                        >
                          ▶ Attend
                        </button>
                      </div>

                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(
                            "/attendance-percentage"
                          )}
                          className="flex-1 rounded-xl border 
                          border-white/20 bg-white/10 py-2 text-sm 
                          font-semibold text-white transition 
                          hover:bg-white/20"
                        >
                          📊 My %
                        </button>
                        <button
                          onClick={() => navigate("/mark-attendance")}
                          className="flex-1 rounded-xl bg-gradient-to-r 
                          from-indigo-500 to-cyan-500 py-2 text-sm 
                          font-semibold text-white shadow-lg 
                          shadow-indigo-500/25 transition 
                          hover:scale-[1.02]"
                        >
                          ✅ Attend
                        </button>
                      </div>
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

export default MyCourses;