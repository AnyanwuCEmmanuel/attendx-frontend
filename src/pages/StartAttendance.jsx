import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_URL from '../api.js'

function StartAttendance() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      const now = new Date();
      const expires = new Date(session.expires_at);
      const diff = Math.floor((expires - now) / 1000);
      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  async function fetchCourses() {
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
  }

  const getLocation = () => {
    setLocationLoading(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      () => {
        setLocationError(
          "Could not get your location. Please allow location access.",
        );
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleStart = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/attendance/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            course_id: selectedCourse,
            latitude: location?.latitude || null,
            longitude: location?.longitude || null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      setSession(data.session);
    } catch (err) {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `${API_URL}/api/attendance/close/${session.id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSession(null);
      setSelectedCourse("");
      setTimeLeft(null);
      setLocation(null);
    } catch (err) {
      console.log(err);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
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
              <p className="text-xs text-white/45">Start Attendance</p>
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

      <main className="relative z-10 mx-auto max-w-xl px-4 py-8 sm:px-6">
        {!session ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Start Attendance</h1>
              <p className="mt-2 text-sm text-white/55">
                Select a course and confirm your location.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleStart} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-white/80">
                  Select Course
                </label>
                <select
                  required
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/30"
                >
                  <option value="">Choose a course</option>
                  {courses.map((course) => (
                    <option
                      key={course.id}
                      value={course.id}
                      className="text-slate-900"
                    >
                      {course.course_code} — {course.course_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/10 p-5">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white/85">
                      Lecture Hall Location
                    </p>
                    <p className="text-xs text-white/45">
                      Confirm your location to enable geofencing
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={getLocation}
                    disabled={locationLoading}
                    className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/20 disabled:opacity-50"
                  >
                    {locationLoading ? "Getting..." : "📍 Get Location"}
                  </button>
                </div>

                {locationError && (
                  <p className="mt-2 text-xs text-red-300">{locationError}</p>
                )}

                {location ? (
                  <div className="mt-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                    <p className="text-xs font-semibold text-emerald-300">
                      ✅ Location confirmed
                    </p>
                    <p className="mt-0.5 text-xs text-emerald-100/70">
                      Lat: {location.latitude.toFixed(4)}, Long:{" "}
                      {location.longitude.toFixed(4)}
                    </p>
                    <p className="mt-0.5 text-xs text-emerald-100/60">
                      Students must be within 200m of this location.
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs text-white/45">
                      No location set — geofencing will be disabled for this
                      session.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-fuchsia-500 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Starting..." : "Generate Token"}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-2xl">
              <p className="mb-2 text-sm font-medium text-white/45">
                Attendance Token
              </p>

              <div className="mb-4 rounded-3xl border border-white/10 bg-black/10 py-8 px-4">
                <p className="font-mono text-6xl font-black tracking-widest text-cyan-300">
                  {session.token}
                </p>
              </div>

              <div
                className={`mb-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                  timeLeft > 60
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : timeLeft > 0
                      ? "border-orange-500/20 bg-orange-500/10 text-orange-300"
                      : "border-red-500/20 bg-red-500/10 text-red-300"
                }`}
              >
                <span>⏱</span>
                <span>
                  {timeLeft > 0
                    ? `Expires in ${formatTime(timeLeft)}`
                    : "Token Expired"}
                </span>
              </div>

              {session.latitude && (
                <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                  <p className="text-xs font-semibold text-emerald-300">
                    🌍 Geofencing Active — 200m radius
                  </p>
                </div>
              )}

              <p className="mb-6 text-xs text-white/45">
                Show this token to your students on the projector.
              </p>

              <button
                onClick={handleClose}
                className="w-full rounded-2xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-600"
              >
                Close Attendance Session
              </button>
            </div>

            <button
              onClick={() => navigate(`/attendance-records/${session.id}`)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white/80 shadow-sm transition hover:bg-white/10"
            >
              📋 View Who Has Submitted
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default StartAttendance;
