"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { AcademicSessionSelect } from "@/components/shared/AcademicSessionSelect";

interface CurriculumOption {
  _id: string;
  programName: string;
}

interface CourseOption {
  _id: string;
  title: string;
  code: string;
}

interface AcademicWeekItem {
  _id: string;
  curriculumId: string | { _id?: string; programName?: string };
  courseId: string | { _id?: string; title?: string; code?: string };
  academicSession: string;
  semester: "FIRST" | "SECOND";
  weekNumber: number;
  startDate: string;
  endDate: string;
  label?: string;
}

export default function AcademicWeeksPage() {
  const [curriculums, setCurriculums] = useState<CurriculumOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [curriculumId, setCurriculumId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [academicSession, setAcademicSession] = useState("");
  const [semester, setSemester] = useState<"FIRST" | "SECOND">("FIRST");
  const [weekNumber, setWeekNumber] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [weeks, setWeeks] = useState<AcademicWeekItem[]>([]);
  const [loadingWeeks, setLoadingWeeks] = useState(false);
  const [editingWeek, setEditingWeek] = useState<AcademicWeekItem | null>(null);
  const [editCourseId, setEditCourseId] = useState("");
  const [editWeekNumber, setEditWeekNumber] = useState(1);
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editLabel, setEditLabel] = useState("");
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
          ? data.map((course: { _id: string; title: string; code: string }) => ({ _id: course._id, title: course.title, code: course.code }))
          : [];
        setCourses(nextCourses);
        setCourseId((currentCourseId) =>
          currentCourseId && nextCourses.some((course) => course._id === currentCourseId) ? currentCourseId : ""
        );
      })
      .catch(() => {
        setCourses([]);
        setCourseId("");
      });
  }, [curriculumId]);

  useEffect(() => {
    loadWeeks(curriculumId, courseId, academicSession, semester);
  }, [curriculumId, courseId, academicSession, semester]);

  async function loadWeeks(filterCurriculumId: string, filterCourseId: string, filterSession: string, filterSemester: string) {
    setLoadingWeeks(true);
    const params = new URLSearchParams();
    if (filterCurriculumId) params.set("curriculumId", filterCurriculumId);
    if (filterCourseId) params.set("courseId", filterCourseId);
    if (filterSession) params.set("academicSession", filterSession);
    if (filterSemester) params.set("semester", filterSemester);

    try {
      const response = await fetch(`/api/academic-weeks?${params.toString()}`);
      const data = await response.json();
      setWeeks(Array.isArray(data) ? data : []);
    } catch {
      setWeeks([]);
    } finally {
      setLoadingWeeks(false);
    }
  }

  function resetCreateForm() {
    setWeekNumber((weeks[weeks.length - 1]?.weekNumber ?? 0) + 1);
    setStartDate("");
    setEndDate("");
    setLabel("");
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
      setMessage("Select a curriculum before saving the week.");
      return;
    }

    if (!courseId) {
      setLoading(false);
      setMessage("Select a course before saving the week.");
      return;
    }

    if (!academicSession) {
      setLoading(false);
      setMessage("Select an academic session before saving the week.");
      return;
    }

    const payload = {
      curriculumId,
      courseId,
      academicSession,
      semester,
      weekNumber,
      startDate,
      endDate,
      label,
    };

    const response = await fetch("/api/academic-weeks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (response.ok) {
      resetCreateForm();
      setIsCreateModalOpen(false);
      setMessage("Academic week created successfully.");
      loadWeeks(curriculumId, courseId, academicSession, semester);
      return;
    }

    const errorText = await response.text();
    setMessage(`Unable to create week. ${errorText}`);
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingWeek) return;
    setLoading(true);
    setMessage("");

    const payload = {
      courseId: editCourseId || editingWeek.courseId,
      weekNumber: editWeekNumber,
      startDate: editStartDate,
      endDate: editEndDate,
      label: editLabel,
    };

    const response = await fetch(`/api/academic-weeks/${editingWeek._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (response.ok) {
      setMessage("Academic week updated successfully.");
      setEditingWeek(null);
      loadWeeks(curriculumId, courseId, academicSession, semester);
      return;
    }

    const errorText = await response.text();
    setMessage(`Unable to update week. ${errorText}`);
  }

  async function handleDelete(weekId: string) {
    const confirmDelete = window.confirm("Delete this academic week? This cannot be undone.");
    if (!confirmDelete) return;

    setLoading(true);
    setMessage("");

    const response = await fetch(`/api/academic-weeks/${weekId}`, {
      method: "DELETE",
    });

    setLoading(false);

    if (response.ok) {
      setMessage("Academic week deleted successfully.");
      if (editingWeek?._id === weekId) {
        setEditingWeek(null);
      }
      loadWeeks(curriculumId, courseId, academicSession, semester);
      return;
    }

    const errorText = await response.text();
    setMessage(`Unable to delete week. ${errorText}`);
  }

  function startEdit(week: AcademicWeekItem) {
    setEditingWeek(week);
    setEditCourseId(typeof week.courseId === "object" ? week.courseId._id ?? "" : week.courseId ?? "");
    setEditWeekNumber(week.weekNumber);
    setEditStartDate(week.startDate.slice(0, 10));
    setEditEndDate(week.endDate.slice(0, 10));
    setEditLabel(week.label ?? "");
  }

  function cancelEdit() {
    setEditingWeek(null);
    setEditCourseId("");
    setEditWeekNumber(1);
    setEditStartDate("");
    setEditEndDate("");
    setEditLabel("");
  }

  function getCurriculumTitle(id?: string | { _id?: string; programName?: string }) {
    if (!id) return "Unknown curriculum";
    if (typeof id === "object") {
      return id.programName ?? "Unknown curriculum";
    }
    return curriculums.find((curriculum) => curriculum._id === id)?.programName ?? "Unknown curriculum";
  }

  function getCourseTitle(id?: string | { _id?: string; title?: string; code?: string }) {
    if (!id) return "Unknown course";
    if (typeof id === "object") {
      return id.title ? `${id.title}${id.code ? ` (${id.code})` : ""}` : "Unknown course";
    }
    const course = courses.find((item) => item._id === id);
    return course ? `${course.title} (${course.code})` : "Unknown course";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Reporting</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Academic weeks</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            resetCreateForm();
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 sm:self-start"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add week
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Define the weekly calendar the PG Coordinator uses to track lecturer and student effectiveness for a curriculum, session, and semester. These weeks feed the Weekly Effectiveness Report.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Curriculum
            <select
              value={curriculumId}
              onChange={(event) => {
                setCurriculumId(event.target.value);
                setCourseId("");
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="">All curriculums</option>
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
              disabled={!courses.length}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="">All courses</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title} ({course.code})
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Academic session
            <AcademicSessionSelect
              value={academicSession}
              onChange={setAcademicSession}
              required={false}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Semester
            <select
              value={semester}
              onChange={(event) => setSemester(event.target.value as "FIRST" | "SECOND")}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="FIRST">First</option>
              <option value="SECOND">Second</option>
            </select>
          </label>
        </div>
      </div>

      <Modal open={isCreateModalOpen} onClose={closeCreateModal} title="Add academic week">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Curriculum
              <select
                value={curriculumId}
                onChange={(event) => {
                  setCurriculumId(event.target.value);
                  setCourseId("");
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
                    {course.title} ({course.code})
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Academic session
              <AcademicSessionSelect
                value={academicSession}
                onChange={setAcademicSession}
                autoSelectCurrent
                className="w-full rounded-xl border border-slate-300 px-3 py-2 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Semester
              <select
                value={semester}
                onChange={(event) => setSemester(event.target.value as "FIRST" | "SECOND")}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="FIRST">First</option>
                <option value="SECOND">Second</option>
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Week number
              <input
                type="number"
                min={1}
                value={weekNumber}
                onChange={(event) => setWeekNumber(Number(event.target.value))}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
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
          </div>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Label (optional)
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="e.g. Resumption week"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
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
              disabled={loading || !curriculumId || !courseId || !academicSession}
              className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? "Saving..." : "Add week"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(editingWeek)} onClose={cancelEdit} title="Edit academic week">
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
                    {course.title} ({course.code})
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Week number
              <input
                type="number"
                min={1}
                value={editWeekNumber}
                onChange={(event) => setEditWeekNumber(Number(event.target.value))}
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
          </div>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Label (optional)
            <input
              value={editLabel}
              onChange={(event) => setEditLabel(event.target.value)}
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

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">Week list</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">Saved academic weeks</h3>
          </div>
          <button
            type="button"
            onClick={() => loadWeeks(curriculumId, courseId, academicSession, semester)}
            className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {loadingWeeks ? (
            <p className="text-sm text-slate-500 md:col-span-2">Loading weeks…</p>
          ) : weeks.length === 0 ? (
            <p className="text-sm text-slate-500 md:col-span-2">No academic weeks found for this filter.</p>
          ) : (
            weeks.map((week) => (
              <div key={week._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Week {week.weekNumber}{week.label ? ` — ${week.label}` : ""}</p>
                    <p className="mt-1 text-xs text-slate-500">{getCourseTitle(week.courseId)}</p>
                    <p className="mt-1 text-xs text-slate-500">{getCurriculumTitle(week.curriculumId)}</p>
                    <p className="mt-1 text-xs text-slate-500">{week.academicSession} · {week.semester === "FIRST" ? "First" : "Second"} semester</p>
                  </div>
                  <p className="text-xs font-medium text-slate-700">
                    {new Date(week.startDate).toLocaleDateString()} – {new Date(week.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(week)}
                    className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(week._id)}
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
