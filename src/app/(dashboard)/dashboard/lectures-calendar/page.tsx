"use client";

import { useEffect, useState } from "react";

interface CurriculumOption {
  _id: string;
  programName: string;
}

interface LectureScheduleItem {
  _id: string;
  curriculumId: string;
  title: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export default function LecturesCalendarPage() {
  const [curriculums, setCurriculums] = useState<CurriculumOption[]>([]);
  const [curriculumId, setCurriculumId] = useState("");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [schedules, setSchedules] = useState<LectureScheduleItem[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<LectureScheduleItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    fetch("/api/curriculum")
      .then((res) => res.json())
      .then((data) => setCurriculums(data))
      .catch(() => setCurriculums([]));
  }, []);

  useEffect(() => {
    loadSchedules(curriculumId);
  }, [curriculumId]);

  async function loadSchedules(filterCurriculumId: string) {
    setLoadingSchedules(true);
    const query = filterCurriculumId ? `?curriculumId=${filterCurriculumId}` : "";
    try {
      const response = await fetch(`/api/lectures-calendar${query}`);
      const data = await response.json();
      setSchedules(Array.isArray(data) ? data : []);
    } catch {
      setSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = {
      curriculumId,
      title,
      startDate,
      endDate,
      description,
    };

    const response = await fetch("/api/lectures-calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (response.ok) {
      setTitle("");
      setStartDate("");
      setEndDate("");
      setDescription("");
      setMessage("Lecture schedule created successfully.");
      loadSchedules(curriculumId);
      return;
    }

    const errorText = await response.text();
    setMessage(`Unable to create schedule. ${errorText}`);
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingSchedule) return;
    setLoading(true);
    setMessage("");

    const payload = {
      title: editTitle,
      startDate: editStartDate,
      endDate: editEndDate,
      description: editDescription,
    };

    const response = await fetch(`/api/lectures-calendar/${editingSchedule._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (response.ok) {
      setMessage("Lecture schedule updated successfully.");
      setEditingSchedule(null);
      loadSchedules(curriculumId);
      return;
    }

    const errorText = await response.text();
    setMessage(`Unable to update schedule. ${errorText}`);
  }

  async function handleDelete(scheduleId: string) {
    const confirmDelete = window.confirm("Delete this lecture schedule? This cannot be undone.");
    if (!confirmDelete) return;

    setLoading(true);
    setMessage("");

    const response = await fetch(`/api/lectures-calendar/${scheduleId}`, {
      method: "DELETE",
    });

    setLoading(false);

    if (response.ok) {
      setMessage("Lecture schedule deleted successfully.");
      if (editingSchedule?._id === scheduleId) {
        setEditingSchedule(null);
      }
      loadSchedules(curriculumId);
      return;
    }

    const errorText = await response.text();
    setMessage(`Unable to delete schedule. ${errorText}`);
  }

  function startEdit(schedule: LectureScheduleItem) {
    setEditingSchedule(schedule);
    setEditTitle(schedule.title);
    setEditStartDate(schedule.startDate.slice(0, 10));
    setEditEndDate(schedule.endDate.slice(0, 10));
    setEditDescription(schedule.description ?? "");
  }

  function cancelEdit() {
    setEditingSchedule(null);
    setEditTitle("");
    setEditStartDate("");
    setEditEndDate("");
    setEditDescription("");
  }

  function getCurriculumTitle(id: string) {
    return curriculums.find((curriculum) => curriculum._id === id)?.programName ?? "Unknown curriculum";
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Reporting</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Lecture schedules</h2>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Create and manage lecture schedules for curriculum delivery. These schedules are used by the LMS Rep Report workflow to build lecture compliance reviews.
        </p>
      </div>

      {/* Add form section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:p-6">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Curriculum
                <select
                  value={curriculumId}
                  onChange={(event) => setCurriculumId(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                >
                  <option value="">Select curriculum</option>
                  {curriculums.map((curriculum) => (
                    <option key={curriculum._id} value={curriculum._id}>
                      {curriculum.programName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                Lecture title
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  placeholder="Lecture Week 1"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                Start date
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                End date
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </label>
            </div>

            <label className="mt-4 block space-y-2 text-sm font-medium text-slate-700">
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                placeholder="Add details about the teaching delivery or topics covered."
              />
            </label>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading ? "Saving..." : "Create schedule"}
              </button>
            </div>
          </form>
      </div>

      {/* Editing Schedule section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {editingSchedule ? (
            <form onSubmit={handleUpdate} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">Edit schedule</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">{editingSchedule.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mt-4">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Title
                  <input
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Start date
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(event) => setEditStartDate(event.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  End date
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(event) => setEditEndDate(event.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>
              </div>

              <label className="mt-4 block space-y-2 text-sm font-medium text-slate-700">
                Description
                <textarea
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </label>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {loading ? "Updating..." : "Save changes"}
                </button>
              </div>
            </form>
          ) : null}
        </div>

        {/* Schedule list section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">Schedule list</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Saved lecture schedules</h3>
            </div>
            <button
              type="button"
              onClick={() => loadSchedules(curriculumId)}
              className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {loadingSchedules ? (
              <p className="text-sm text-slate-500">Loading schedules…</p>
            ) : schedules.length === 0 ? (
              <p className="text-sm text-slate-500">No schedules found for this curriculum.</p>
            ) : (
              schedules.map((schedule) => (
                <div key={schedule._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{schedule.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{getCurriculumTitle(schedule.curriculumId)}</p>
                    </div>
                    <p className="text-xs font-medium text-slate-700">
                      {new Date(schedule.startDate).toLocaleDateString()} – {new Date(schedule.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  {schedule.description ? (
                    <p className="mt-3 text-sm text-slate-600">{schedule.description}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(schedule)}
                      className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(schedule._id)}
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

      {message ? (
        <div className="rounded-2xl border border-slate-200 bg-teal-50 px-4 py-3 text-sm text-teal-700">{message}</div>
      ) : null}
    </div>
  );
}
