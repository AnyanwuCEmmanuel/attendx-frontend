import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from '../api.js'

function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    reminder_at: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/notes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      setNotes(data.notes || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const url = editingNote
        ? `${API_URL}/api/notes/${editingNote.id}`
        : `${API_URL}/api/notes/create`;

      const method = editingNote ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      await fetchNotes();
      resetForm();
    } catch (err) {
      setError("Cannot connect to server");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      reminder_at: note.reminder_at
        ? new Date(note.reminder_at).toISOString().slice(0, 16)
        : "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter((n) => n.id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", content: "", reminder_at: "" });
    setEditingNote(null);
    setShowForm(false);
    setError("");
  };

  const getReminderStatus = (reminder_at) => {
    if (!reminder_at) return null;
    const now = new Date();
    const reminder = new Date(reminder_at);
    const diffHours = (reminder - now) / (1000 * 60 * 60);

    if (diffHours < 0)
      return {
        label: "Reminder passed",
        color: "bg-white/10 text-white/45 border-white/10",
      };
    if (diffHours < 24)
      return {
        label: "⏰ Due today",
        color: "bg-red-500/15 text-red-300 border-red-500/20",
      };
    if (diffHours < 72)
      return {
        label: "⏰ Due soon",
        color: "bg-orange-500/15 text-orange-300 border-orange-500/20",
      };

    return {
      label:
        "🔔 " +
        new Date(reminder_at).toLocaleDateString("en-NG", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
    };
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

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
              <p className="text-xs text-white/45">Private Notes</p>
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

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Notes</h1>
            <p className="mt-2 text-sm text-white/55">
              Private notes only visible to you.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="rounded-2xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-[1.01]"
          >
            {showForm ? "Cancel" : "+ New Note"}
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-2xl">
            <h2 className="mb-4 text-lg font-semibold text-white">
              {editingNote ? "Edit Note" : "Create New Note"}
            </h2>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-white/80">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Assignment reminder for CSC301"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/30"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-white/80">
                  Note Content
                </label>
                <textarea
                  name="content"
                  required
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write your note here..."
                  rows={5}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/30"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-white/80">
                  Reminder{" "}
                  <span className="font-normal text-white/45">(optional)</span>
                </label>
                <input
                  type="datetime-local"
                  name="reminder_at"
                  value={formData.reminder_at}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/30"
                />
                <p className="mt-1 text-xs text-white/40">
                  Set a reminder time to track this note.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-2xl bg-white px-6 py-3 font-semibold text-slate-900 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving
                    ? "Saving..."
                    : editingNote
                      ? "Update Note"
                      : "Save Note"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white/80 hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl animate-pulse"
              >
                <div className="h-4 w-1/3 rounded bg-white/10 mb-3"></div>
                <div className="h-4 w-full rounded bg-white/10 mb-2"></div>
                <div className="h-4 w-2/3 rounded bg-white/10"></div>
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-16 text-center shadow-2xl backdrop-blur-2xl">
            <p className="text-5xl">📝</p>
            <p className="mt-4 font-semibold text-white/80">No notes yet</p>
            <p className="mt-1 text-sm text-white/50">
              Create a private note to keep track of your tasks.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-6 rounded-2xl bg-white px-6 py-3 font-semibold text-slate-900 transition hover:scale-[1.01]"
            >
              Create First Note
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => {
              const reminderStatus = getReminderStatus(note.reminder_at);

              return (
                <div
                  key={note.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-2xl transition hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {reminderStatus && (
                        <span
                          className={`mb-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${reminderStatus.color}`}
                        >
                          {reminderStatus.label}
                        </span>
                      )}

                      <h3 className="text-xl font-bold text-white">
                        {note.title}
                      </h3>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/70">
                        {note.content}
                      </p>

                      <p className="mt-4 text-xs text-white/40">
                        Created {formatDate(note.created_at)}
                        {note.updated_at !== note.created_at && (
                          <span> · Updated {formatDate(note.updated_at)}</span>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleEdit(note)}
                        className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-400/20"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
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

export default Notes;
