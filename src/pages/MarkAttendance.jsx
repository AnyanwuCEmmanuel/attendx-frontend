import { useState } from "react";
import { Link } from "react-router-dom";
import API_URL from '../api.js'

function MarkAttendance() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");

  const getLocationAndMark = async (e) => {
    e.preventDefault();
    setError("");
    setLocationStatus("Getting your location...");
    setLoading(true);

    if (!navigator.geolocation) {
      markAttendance(null, null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationStatus("Location confirmed ✅");
        markAttendance(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setLocationStatus("");
        markAttendance(null, null);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const markAttendance = async (latitude, longitude) => {
    try {
      const authToken = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/attendance/mark`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ token, latitude, longitude }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        setLocationStatus("");
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("Cannot connect to server");
      setLocationStatus("");
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
              <p className="text-xs text-white/45">Mark Attendance</p>
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

      <main className="relative z-10 mx-auto max-w-md px-4 py-8 sm:px-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl">
          {!success ? (
            <>
              <div className="mb-6 text-center">
                <span className="text-5xl">✅</span>
                <h1 className="mt-3 text-3xl font-bold">Mark Attendance</h1>
                <p className="mt-2 text-sm text-white/55">
                  Enter the token shown by your lecturer.
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {locationStatus && (
                <div className="mb-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-200">
                  📍 {locationStatus}
                </div>
              )}

              <div className="mb-4 rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                <p className="text-xs font-semibold text-cyan-300">
                  📍 Location Required
                </p>
                <p className="mt-1 text-xs text-white/45">
                  Your browser will ask for location access when you submit. You
                  must be physically present in the lecture hall.
                </p>
              </div>

              <form onSubmit={getLocationAndMark} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/80">
                    Session Token
                  </label>
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter 6-digit token"
                    maxLength={6}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center font-mono text-2xl tracking-[0.35em] text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || token.length < 6}
                  className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-fuchsia-500 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Getting location..." : "Mark My Attendance"}
                </button>
              </form>
            </>
          ) : (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="mb-2 text-3xl font-bold text-white">
                Attendance Marked
              </h2>
              <p className="mb-8 text-sm text-white/55">
                Your attendance has been recorded successfully.
              </p>
              <Link
                to="/student"
                className="inline-flex rounded-2xl bg-white px-6 py-3 font-semibold text-slate-900 transition hover:scale-[1.01]"
              >
                Back to Dashboard
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default MarkAttendance;
