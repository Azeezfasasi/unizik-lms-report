"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Spinner } from "@/components/ui/Spinner";

const WEEK_CREATOR_ROLES = ["ADMIN", "PG_COORDINATOR", "LMS_REP"];

interface CourseOption {
  _id: string;
  title: string;
  code: string;
}

interface AcademicWeekOption {
  _id: string;
  weekNumber: number;
  label?: string;
  startDate: string;
  endDate: string;
}

export function AcademicWeekGate({
  curriculumId,
  courseId,
  academicSession,
  semester,
  weekId,
  onWeekChange,
}: {
  curriculumId: string;
  courseId?: string;
  academicSession: string;
  semester: string;
  weekId: string;
  onWeekChange: (weekId: string) => void;
}) {
  const { data: session } = useSession();
  const canCreateWeek = WEEK_CREATOR_ROLES.includes(session?.user?.role?.toString().toUpperCase().trim() ?? "");
  const [weeks, setWeeks] = useState<AcademicWeekOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createCourseId, setCreateCourseId] = useState("");
  const [weekNumber, setWeekNumber] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const ready = Boolean(curriculumId && academicSession && semester);

  useEffect(() => {
    let cancelled = false;

    async function loadWeeks() {
      onWeekChange("");
      if (!ready) return;

      setLoading(true);
      const params = new URLSearchParams({ curriculumId, academicSession, semester });
      if (courseId) params.set("courseId", courseId);

      try {
        const response = await fetch(`/api/academic-weeks?${params.toString()}`);
        const data = await response.json();
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setWeeks(list);
        setShowCreateForm(list.length === 0 && canCreateWeek);
      } catch {
        if (!cancelled) {
          setWeeks([]);
          setShowCreateForm(canCreateWeek);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadWeeks();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curriculumId, courseId, academicSession, semester, ready, canCreateWeek]);

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      if (courseId || !curriculumId) return;
      try {
        const response = await fetch(`/api/courses?curriculumId=${curriculumId}`);
        const data = await response.json();
        if (!cancelled) setCourses(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setCourses([]);
      }
    }

    loadCourses();
    return () => {
      cancelled = true;
    };
  }, [curriculumId, courseId]);

  function resetCreateFields() {
    setCreateCourseId("");
    setWeekNumber((weeks[weeks.length - 1]?.weekNumber ?? 0) + 1);
    setStartDate("");
    setEndDate("");
    setLabel("");
  }

  async function handleCreateWeek(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const effectiveCourseId = courseId || createCourseId;
    if (!effectiveCourseId) {
      setError("Select a course for this week.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Provide a start and end date for the week.");
      return;
    }

    setSaving(true);
    const response = await fetch("/api/academic-weeks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        curriculumId,
        courseId: effectiveCourseId,
        academicSession,
        semester,
        weekNumber,
        startDate,
        endDate,
        label,
      }),
    });
    setSaving(false);

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setError(result.message || "Unable to create academic week.");
      return;
    }

    const week = await response.json();
    setWeeks((current) => [...current, week]);
    setShowCreateForm(false);
    resetCreateFields();
    onWeekChange(week._id);
  }

  if (!ready) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
        Select the course/curriculum, academic session, and semester above to load the academic week.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-4">
      <p className="text-sm font-semibold text-slate-900">Academic week</p>
      <p className="mt-1 text-xs text-slate-500">
        Every report must be tied to an academic week. Select an existing week or create one before continuing.
      </p>

      {loading ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <Spinner className="h-3.5 w-3.5" />
          Loading academic weeks…
        </p>
      ) : weeks.length > 0 ? (
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={weekId}
            onChange={(event) => onWeekChange(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm sm:max-w-sm"
          >
            <option value="">Select academic week</option>
            {weeks.map((week) => (
              <option key={week._id} value={week._id}>
                Week {week.weekNumber}
                {week.label ? ` — ${week.label}` : ""} ({new Date(week.startDate).toLocaleDateString()} – {new Date(week.endDate).toLocaleDateString()})
              </option>
            ))}
          </select>
          {canCreateWeek ? (
            <button
              type="button"
              onClick={() => {
                resetCreateFields();
                setShowCreateForm((current) => !current);
              }}
              className="text-sm font-medium text-teal-700 hover:text-teal-800"
            >
              {showCreateForm ? "Cancel" : "+ Add another week"}
            </button>
          ) : null}
        </div>
      ) : canCreateWeek ? (
        <p className="mt-3 text-sm font-medium text-amber-700">No academic week exists yet for this selection. Create one below to continue.</p>
      ) : (
        <p className="mt-3 text-sm font-medium text-amber-700">No academic week exists yet for this selection. Contact an admin, PG coordinator, or LMS rep to create one.</p>
      )}

      {showCreateForm && canCreateWeek ? (
        <form onSubmit={handleCreateWeek} className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
          {!courseId ? (
            <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
              Course
              <select
                value={createCourseId}
                onChange={(event) => setCreateCourseId(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title} ({course.code})
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="space-y-1 text-xs font-medium text-slate-700">
            Week number
            <input
              type="number"
              min={1}
              value={weekNumber}
              onChange={(event) => setWeekNumber(Number(event.target.value))}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1 text-xs font-medium text-slate-700">
            Label (optional)
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="e.g. Resumption week"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1 text-xs font-medium text-slate-700">
            Start date
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1 text-xs font-medium text-slate-700">
            End date
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          {error ? <p className="text-xs font-medium text-rose-600 sm:col-span-2">{error}</p> : null}
          <div className="flex justify-end sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Spinner className="h-3.5 w-3.5" />
                  Creating…
                </>
              ) : (
                "Create week"
              )}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
