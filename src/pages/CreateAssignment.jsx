import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_URL from '../api.js'

function CreateAssignment() {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    description: "",
    deadline: "",
    file_url: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/courses/my-courses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      console.log(err);
    }
  };

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
        `${API_URL}/api/assignments/create`,
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

      setSuccess("Assignment created successfully");
      setFormData({
        course_id: "",
        title: "",
        description: "",
        deadline: "",
        file_url: "",
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
      </div>

      <nav className="relative z-20 border-b border-white/10 bg-white/5 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/30">
              <span className="font-black text-white">A</span>
            </div>
            <div>
              <p className="font-bold">AttendX</p>
              <p className="text-xs text-white/50">Assignment Studio</p>
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
          <h1 className="text-3xl font-bold">Create Assignment</h1>
          <p className="mt-2 text-sm text-white/60">
            Post a new assignment for your students.
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
            <Field label="Select Course">
              <select
                name="course_id"
                required
                value={formData.course_id}
                onChange={handleChange}
                className="input"
              >
                <option value="" className="bg-slate-900">
                  Choose a course
                </option>
                {courses.map((course) => (
                  <option
                    key={course.id}
                    value={course.id}
                    className="bg-slate-900"
                  >
                    {course.course_code} — {course.course_name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Assignment Title">
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Lab Report 1"
                className="input"
              />
            </Field>

            <Field label="Description">
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the assignment clearly..."
                rows={4}
                className="input resize-none"
              />
            </Field>

            <Field label="Deadline">
              <input
                type="datetime-local"
                name="deadline"
                required
                value={formData.deadline}
                onChange={handleChange}
                className="input"
              />
            </Field>

            <Field label="Resource Link">
              <input
                type="url"
                name="file_url"
                value={formData.file_url}
                onChange={handleChange}
                placeholder="Paste a Google Drive or OneDrive link"
                className="input"
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-fuchsia-500 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating..." : "Post Assignment"}
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

export default CreateAssignment;
