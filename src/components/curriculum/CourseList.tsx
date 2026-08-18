"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/shared/Modal";
import DeleteResourceButton from "@/components/shared/DeleteResourceButton";
import type { CourseItem } from "@/lib/data/portal";
import { Spinner } from "@/components/ui/Spinner";

export default function CourseList({ courses, curriculumId }: { courses: CourseItem[]; curriculumId: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState<CourseItem | null>(null);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [units, setUnits] = useState<number>(3);
  const [semester, setSemester] = useState<"FIRST" | "SECOND">("FIRST");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function openEdit(course: CourseItem) {
    setEditing(course);
    setTitle(course.title ?? "");
    setCode(course.code ?? "");
    setUnits(course.units ?? 3);
    setSemester((course.semester as "FIRST" | "SECOND") ?? "FIRST");
    setError("");
  }

  function closeModal() {
    setEditing(null);
    setSubmitting(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/courses/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, code, units, semester, curriculumId }),
      });

      if (!response.ok) throw new Error("Failed to update course");
      closeModal();
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Unable to update course right now.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex flex-col flex-wrap gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-teal-200 sm:flex-row sm:items-start"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[11px] font-semibold text-slate-600 shadow-sm">
              {course.code?.slice(0, 3).toUpperCase() || "CRS"}
            </span>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-semibold text-slate-900">{course.title}</h4>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 shadow-sm">{course.code}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 shadow-sm">{course.units} {course.units === 1 ? "unit" : "units"}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${course.semester === "FIRST" ? "bg-slate-100 text-slate-600" : "bg-slate-100 text-slate-600"}`}>
                  {course.semester === "FIRST" ? "1st Semester" : course.semester === "SECOND" ? "2nd Semester" : course.semester}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => openEdit(course)}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Edit
              </button>
              <DeleteResourceButton deleteUrl={`/api/courses/${course.id}`} resourceName="course" />
            </div>
          </div>
        ))}
      </div>

      <Modal open={Boolean(editing)} onClose={closeModal} title={editing ? "Edit course" : "Edit course"}>
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="course-title-edit" className="mb-1.5 block text-sm font-medium text-slate-700">
              Course title <span className="text-red-500">*</span>
            </label>
            <input
              id="course-title-edit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              required
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
            <div>
              <label htmlFor="course-code-edit" className="mb-1.5 block text-sm font-medium text-slate-700">
                Course code <span className="text-red-500">*</span>
              </label>
              <input
                id="course-code-edit"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={submitting}
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm uppercase text-slate-900 placeholder:text-slate-400 placeholder:normal-case transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            <div>
              <label htmlFor="course-units-edit" className="mb-1.5 block text-sm font-medium text-slate-700">
                Units <span className="text-red-500">*</span>
              </label>
              <input
                id="course-units-edit"
                type="number"
                min={1}
                max={6}
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                disabled={submitting}
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label htmlFor="course-semester-edit" className="mb-1.5 block text-sm font-medium text-slate-700">Semester</label>
            <div className="relative">
              <select
                id="course-semester-edit"
                value={semester}
                onChange={(e) => setSemester(e.target.value as "FIRST" | "SECOND")}
                disabled={submitting}
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="FIRST">First semester</option>
                <option value="SECOND">Second semester</option>
              </select>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          {error ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="mt-0.5 h-4 w-4 shrink-0">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5M12 16h.01" />
              </svg>
              {error}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-center text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {submitting ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Saving...
                </>
              ) : (
                "Save course"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
