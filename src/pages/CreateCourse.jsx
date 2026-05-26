import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_URL from '../api.js'

function CreateCourse() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    course_code: "",
    course_name: "",
    department: "",
    semester: "",
    year: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/courses/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      setSuccess(`Course created! Join code: ${data.course.join_code}`);
      setFormData({
        course_code: "",
        course_name: "",
        department: "",
        semester: "",
        year: "",
      });
    } catch (err) {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
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
              <p className="text-xs text-white/50">Course Builder</p>
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

      <main className="relative z-10 mx-auto max-w-xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <h1 className="text-3xl font-bold">Create a Course</h1>
          <p className="mt-2 text-sm text-white/60">
            Students will join using the generated join code.
          </p>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-200">
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field label="Course Code">
              <input
                type="text"
                name="course_code"
                required
                value={formData.course_code}
                onChange={handleChange}
                placeholder="e.g. CSC301"
                className="input"
              />
            </Field>

            <Field label="Course Name">
              <input
                type="text"
                name="course_name"
                required
                value={formData.course_name}
                onChange={handleChange}
                placeholder="e.g. Data Structures and Algorithms"
                className="input"
              />
            </Field>

            <Field label="Department">
              <input
                type="text"
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
                className="input"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Semester">
                <select
                  name="semester"
                  required
                  value={formData.semester}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="" className="bg-slate-900">
                    Select
                  </option>
                  <option value="First" className="bg-slate-900">
                    First
                  </option>
                  <option value="Second" className="bg-slate-900">
                    Second
                  </option>
                </select>
              </Field>

              <Field label="Year">
                <select
                  name="year"
                  required
                  value={formData.year}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="" className="bg-slate-900">
                    Select
                  </option>
                  <option value="100" className="bg-slate-900">
                    100 Level
                  </option>
                  <option value="200" className="bg-slate-900">
                    200 Level
                  </option>
                  <option value="300" className="bg-slate-900">
                    300 Level
                  </option>
                  <option value="400" className="bg-slate-900">
                    400 Level
                  </option>
                  <option value="500" className="bg-slate-900">
                    500 Level
                  </option>
                </select>
              </Field>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-fuchsia-500 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating..." : "Create Course"}
            </button>
          </form>
        </div>
      </main>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.05);
          border-radius: 1rem;
          padding: 0.85rem 1rem;
          color: white;
          outline: none;
          transition: 0.2s;
        }
        .input::placeholder { color: rgba(255,255,255,0.35); }
        .input:focus { border-color: rgba(34,211,238,0.6); box-shadow: 0 0 0 2px rgba(34,211,238,0.25); }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white/80">
        {label}
      </label>
      {children}
    </div>
  );
}

export default CreateCourse;
