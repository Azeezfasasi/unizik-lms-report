"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/shared/Modal";

interface CurriculumOption {
  _id: string;
  programName: string;
}

interface CourseOption {
  _id: string;
  title: string;
}

interface LectureScheduleItem {
  _id: string;
  curriculumId: string | { _id?: string; programName?: string };
  courseId?: string | { _id?: string; title?: string };
  title: string;
  startDate: string;
  endDate: string;
  description?: string;
  status?: "not_started" | "commenced";
}

export default function LecturesCalendarPage() {
  const [curriculums, setCurriculums] = useState<CurriculumOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [curriculumId, setCurriculumId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"not_started" | "commenced">("not_started");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [schedules, setSchedules] = useState<LectureScheduleItem[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<LectureScheduleItem | null>(null);
  const [editCourseId, setEditCourseId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<"not_started" | "commenced">("not_started");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/curriculum")
      .then((res) => res.json())
      .then((data) => setCurriculums(data))
      .catch(() => setCurriculums([]));
  }, []);

  useEffect(() => {
    if (!curriculumId) {
      return;
    }

    fetch(`/api/courses?curriculumId=${curriculumId}`)
      .then((res) => res.json())
      .then((data) => {
        const nextCourses: CourseOption[] = Array.isArray(data)
          ? data.map((course: { _id: string; title: string }) => ({ _id: course._id, title: course.title }))
          : [];
        setCourses(nextCourses);
        setCourseId((currentCourseId) =>
          currentCourseId && nextCourses.some((course) => course._id === currentCourseId)
            ? currentCourseId
            : nextCourses[0]?._id ?? ""
        );
      })
      .catch(() => {
        setCourses([]);
        setCourseId("");
      });
  }, [curriculumId]);

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

  function resetCreateForm() {
    setCourseId("");
    setTitle("");
    setStartDate("");
    setEndDate("");
    setDescription("");
    setStatus("not_started");
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false);
    resetCreateForm();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (!curriculumId) {
      setLoading(false);
      setMessage("Select a curriculum before saving the schedule.");
      return;
    }

    if (!courseId) {
      setLoading(false);
      setMessage("Select a course before saving the schedule.");
      return;
    }

    const payload = {
      curriculumId,
      courseId,
      title,
      startDate,
      endDate,
      description,
      status,
    };

    const response = await fetch("/api/lectures-calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (response.ok) {
      resetCreateForm();
      setIsCreateModalOpen(false);
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
      courseId: editCourseId || editingSchedule.courseId,
      title: editTitle,
      startDate: editStartDate,
      endDate: editEndDate,
      description: editDescription,
      status: editStatus,
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
    setEditCourseId(typeof schedule.courseId === "object" ? schedule.courseId._id ?? "" : schedule.courseId ?? "");
    setEditTitle(schedule.title);
    setEditStartDate(schedule.startDate.slice(0, 10));
    setEditEndDate(schedule.endDate.slice(0, 10));
    setEditDescription(schedule.description ?? "");
    setEditStatus(schedule.status ?? "not_started");
  }

  function cancelEdit() {
    setEditingSchedule(null);
    setEditCourseId("");
    setEditTitle("");
    setEditStartDate("");
    setEditEndDate("");
    setEditDescription("");
    setEditStatus("not_started");
  }

  function getCurriculumTitle(id?: string | { _id?: string; programName?: string }) {
    if (!id) return "Unknown curriculum";
    if (typeof id === "object") {
      return id.programName ?? "Unknown curriculum";
    }
    return curriculums.find((curriculum) => curriculum._id === id)?.programName ?? "Unknown curriculum";
  }

  function getCourseTitle(id?: string | { _id?: string; title?: string }) {
    if (!id) return "Unknown course";
    if (typeof id === "object") {
      return id.title ?? "Unknown course";
    }
    return courses.find((course) => course._id === id)?.title ?? "Unknown course";
  }

  function hasCommenced(schedule: LectureScheduleItem) {
    if (schedule.status) {
      return schedule.status === "commenced";
    }
    return new Date() >= new Date(schedule.startDate);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Reporting</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Lecture schedules</h2>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 sm:self-start"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Create schedule
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Create and manage lecture schedules for curriculum delivery. These schedules are used by the LMS Rep Report workflow to build lecture compliance reviews.
        </p>
      </div>

      <Modal open={isCreateModalOpen} onClose={closeCreateModal} title="Create lecture schedule">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Curriculum
              <select
                value={curriculumId}
                onChange={(event) => {
                  const nextCurriculumId = event.target.value;
                  setCurriculumId(nextCurriculumId);
                  if (!nextCurriculumId) {
                    setCourses([]);
                    setCourseId("");
                  }
                }}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
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
              Course
              <select
                value={courseId}
                onChange={(event) => setCourseId(event.target.value)}
                required
                disabled={!courses.length}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
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
                className="w-full rounded-xl border border-slate-300 px-3 py-2 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
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
                className="w-full rounded-xl border border-slate-300 px-3 py-2 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              End date
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Lecture status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as "not_started" | "commenced")}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="not_started">Not started yet</option>
                <option value="commenced">Commenced</option>
              </select>
            </label>
          </div>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              placeholder="Add details about the teaching delivery or topics covered."
            />
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeCreateModal}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-center text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !curriculumId || !courseId}
              className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? "Saving..." : "Create schedule"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(editingSchedule)} onClose={cancelEdit} title="Edit lecture schedule">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Course
              <select
                value={editCourseId}
                onChange={(event) => setEditCourseId(event.target.value)}
                required
                disabled={!courses.length}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Title
              <input
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Start date
              <input
                type="date"
                value={editStartDate}
                onChange={(event) => setEditStartDate(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              End date
              <input
                type="date"
                value={editEndDate}
                onChange={(event) => setEditEndDate(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Lecture status
              <select
                value={editStatus}
                onChange={(event) => setEditStatus(event.target.value as "not_started" | "commenced")}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="not_started">Not started yet</option>
                <option value="commenced">Commenced</option>
              </select>
            </label>
          </div>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Description
            <textarea
              value={editDescription}
              onChange={(event) => setEditDescription(event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-center text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? "Updating..." : "Save changes"}
            </button>
          </div>
        </form>
      </Modal>

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

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {loadingSchedules ? (
            <p className="text-sm text-slate-500 md:col-span-2">Loading schedules…</p>
          ) : schedules.length === 0 ? (
            <p className="text-sm text-slate-500 md:col-span-2">No schedules found for this curriculum.</p>
          ) : (
            schedules.map((schedule) => (
              <div key={schedule._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{schedule.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{getCourseTitle(schedule.courseId)}</p>
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
                    disabled
                    className={
                      hasCommenced(schedule)
                        ? "cursor-default rounded-full border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"
                        : "cursor-default rounded-full border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700"
                    }
                  >
                    {hasCommenced(schedule) ? "Commenced" : "Not started yet"}
                  </button>
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

      {message ? (
        <div className="rounded-2xl border border-slate-200 bg-teal-50 px-4 py-3 text-sm text-teal-700">{message}</div>
      ) : null}
    </div>
  );
}