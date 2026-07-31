"use client";

import { useEffect, useState } from "react";

interface AcademicSessionItem {
  _id: string;
  name: string;
  isCurrent: boolean;
}

const SESSION_PATTERN = /^\d{4}\/\d{4}$/;

export default function AcademicSessionsPage() {
  const [sessions, setSessions] = useState<AcademicSessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    setLoading(true);
    try {
      const response = await fetch("/api/academic-sessions");
      const data = await response.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    const trimmed = name.trim();
    if (!SESSION_PATTERN.test(trimmed)) {
      setMessage("Enter the session as two consecutive years, e.g. 2025/2026.");
      return;
    }

    setSaving(true);
    const response = await fetch("/api/academic-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    setSaving(false);

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setMessage(result.message || "Unable to create academic session.");
      return;
    }

    setName("");
    setMessage("Academic session created successfully.");
    loadSessions();
  }

  async function handleSetCurrent(id: string) {
    setMessage("");
    const response = await fetch(`/api/academic-sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCurrent: true }),
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setMessage(result.message || "Unable to update academic session.");
      return;
    }

    loadSessions();
  }

  async function handleDelete(id: string) {
    const confirmDelete = window.confirm("Delete this academic session? This cannot be undone.");
    if (!confirmDelete) return;

    const response = await fetch(`/api/academic-sessions/${id}`, { method: "DELETE" });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setMessage(result.message || "Unable to delete academic session.");
      return;
    }

    setMessage("Academic session deleted successfully.");
    loadSessions();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Reporting</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Academic sessions</h2>
        <p className="mt-2 text-sm text-slate-500">Define the academic sessions (e.g. 2025/2026) that reports and academic weeks are tagged with.</p>
      </div>

      <form onSubmit={handleCreate} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:gap-4 sm:p-6">
        <label className="flex-1 space-y-2 text-sm font-medium text-slate-700">
          Academic session
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="2025/2026"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {saving ? "Saving..." : "Add session"}
        </button>
      </form>

      {message ? <div className="rounded-2xl border border-slate-200 bg-teal-50 px-4 py-3 text-sm text-teal-700">{message}</div> : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">Session list</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">Saved academic sessions</h3>
          </div>
          <button
            type="button"
            onClick={loadSessions}
            className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {loading ? (
            <p className="text-sm text-slate-500 md:col-span-2">Loading academic sessions…</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-slate-500 md:col-span-2">No academic sessions yet. Add one above to get started.</p>
          ) : (
            sessions.map((session) => (
              <div key={session._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{session.name}</p>
                  {session.isCurrent ? (
                    <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">Current</span>
                  ) : null}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {!session.isCurrent ? (
                    <button
                      type="button"
                      onClick={() => handleSetCurrent(session._id)}
                      className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Set as current
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleDelete(session._id)}
                    className="rounded-full border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
