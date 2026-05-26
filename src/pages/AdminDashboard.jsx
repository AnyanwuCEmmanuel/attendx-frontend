import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from '../api.js'

function AdminDashboard() {
  const navigate = useNavigate();
  const [pendingLecturers, setPendingLecturers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchData();
  }, [user, navigate]);

  async function fetchData() {
    try {
      const token = localStorage.getItem("token");

      // ✅ fixed: removed hardcoded localhost:5000
      const pendingRes = await fetch(`${API_URL}/api/admin/pending-lecturers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pendingData = await pendingRes.json();
      setPendingLecturers(pendingData.lecturers || []);

      const usersRes = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData = await usersRes.json();
      setAllUsers(usersData.users || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      // ✅ fixed: removed hardcoded localhost:5000
      const response = await fetch(`${API_URL}/api/admin/approve/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        await fetchData();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm("Reject this lecturer application?")) return;
    try {
      const token = localStorage.getItem("token");
      // ✅ fixed: removed hardcoded localhost:5000
      await fetch(`${API_URL}/api/admin/reject/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  const handleSuspend = async (userId) => {
    if (!window.confirm("Suspend this user?")) return;
    try {
      const token = localStorage.getItem("token");
      // ✅ fixed: removed hardcoded localhost:5000
      await fetch(`${API_URL}/api/admin/suspend/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-600";
      case "pending_lecturer":
        return "bg-yellow-100 text-yellow-600";
      case "suspended":
        return "bg-red-100 text-red-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-[#0f0f1e] relative overflow-hidden">
      {/* Glassmorphism background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl"></div>
      </div>

      <nav className="relative z-10 bg-gradient-to-r from-indigo-600/30 to-slate-700/30 backdrop-blur-lg border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow">
            <span className="text-indigo-600 font-black text-sm">A</span>
          </div>
          <div>
            <span className="text-white font-bold text-lg">AttendX</span>
            <span className="text-indigo-200 text-xs ml-2">Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-indigo-200 text-sm hidden sm:block">
            {user.name}
          </span>
          <button
            onClick={handleLogout}
            className="bg-white/10 border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-white/20 backdrop-blur-md transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-indigo-300 to-fuchsia-300 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-white/60 mt-1">
            Manage users and lecturer approvals
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-xl p-5 shadow-lg hover:bg-white/15 transition">
            <p className="text-white/60 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-cyan-400 mt-1">
              {allUsers.length}
            </p>
          </div>
          <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-xl p-5 shadow-lg hover:bg-white/15 transition">
            <p className="text-white/60 text-sm">Students</p>
            <p className="text-3xl font-bold text-blue-400 mt-1">
              {allUsers.filter((u) => u.role === "student").length}
            </p>
          </div>
          <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-xl p-5 shadow-lg hover:bg-white/15 transition">
            <p className="text-white/60 text-sm">Lecturers</p>
            <p className="text-3xl font-bold text-green-400 mt-1">
              {
                allUsers.filter(
                  (u) => u.role === "lecturer" && u.status === "active",
                ).length
              }
            </p>
          </div>
          <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-xl p-5 shadow-lg hover:bg-white/15 transition">
            <p className="text-white/60 text-sm">Pending</p>
            <p className="text-3xl font-bold text-orange-400 mt-1">
              {pendingLecturers.length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === "pending"
                ? "bg-indigo-600 text-white"
                : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/15 backdrop-blur-md"
            }`}
          >
            Pending Approval
            {pendingLecturers.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {pendingLecturers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === "users"
                ? "bg-indigo-600 text-white"
                : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/15 backdrop-blur-md"
            }`}
          >
            All Users
          </button>
        </div>

        {/* Pending Lecturers Tab */}
        {activeTab === "pending" && (
          <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <p className="text-white/60">Loading...</p>
              </div>
            ) : pendingLecturers.length === 0 ? (
              <div className="p-16 text-center">
                <p className="text-4xl mb-3">✅</p>
                <p className="text-white/80 font-medium">
                  No pending approvals
                </p>
                <p className="text-white/50 text-sm mt-1">
                  All lecturer applications have been reviewed
                </p>
              </div>
            ) : (
              <div>
                <div className="px-6 py-3 bg-white/5 border-b border-white/10">
                  <p className="text-xs font-semibold text-white/50 uppercase">
                    Pending Lecturer Applications
                  </p>
                </div>
                {pendingLecturers.map((lecturer) => (
                  <div
                    key={lecturer.id}
                    className="px-6 py-4 border-b border-white/5 hover:bg-white/5 transition flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-white">
                        {lecturer.name}
                      </p>
                      <p className="text-white/60 text-sm">{lecturer.email}</p>
                      <p className="text-white/40 text-xs mt-0.5">
                        Registered {formatDate(lecturer.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(lecturer.id)}
                        className="bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 text-green-400 text-sm font-semibold px-4 py-2 rounded-lg transition backdrop-blur-md"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleReject(lecturer.id)}
                        className="bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 text-sm font-semibold px-4 py-2 rounded-lg transition backdrop-blur-md"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-3 bg-white/5 border-b border-white/10 grid grid-cols-12">
              <div className="col-span-4 text-xs font-semibold text-white/50 uppercase">
                Name
              </div>
              <div className="col-span-3 text-xs font-semibold text-white/50 uppercase">
                Role
              </div>
              <div className="col-span-3 text-xs font-semibold text-white/50 uppercase">
                Status
              </div>
              <div className="col-span-2 text-xs font-semibold text-white/50 uppercase">
                Action
              </div>
            </div>
            {allUsers.map((u) => (
              <div
                key={u.id}
                className="px-6 py-4 border-b border-white/5 hover:bg-white/5 transition grid grid-cols-12 items-center"
              >
                <div className="col-span-4">
                  <p className="font-medium text-white text-sm">{u.name}</p>
                  <p className="text-white/60 text-xs">{u.email}</p>
                </div>
                <div className="col-span-3">
                  <span className="text-white/80 text-sm capitalize">
                    {u.role}
                  </span>
                </div>
                <div className="col-span-3">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadge(u.status)}`}
                  >
                    {u.status === "pending_lecturer" ? "Pending" : u.status}
                  </span>
                </div>
                <div className="col-span-2 flex gap-2">
                  {u.status === "pending_lecturer" && (
                    <button
                      onClick={() => handleApprove(u.id)}
                      className="text-green-400 text-xs font-semibold hover:text-green-300 transition"
                    >
                      Approve
                    </button>
                  )}
                  {u.status === "active" && u.role !== "admin" && (
                    <button
                      onClick={() => handleSuspend(u.id)}
                      className="text-red-400 text-xs font-semibold hover:text-red-300 transition"
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
