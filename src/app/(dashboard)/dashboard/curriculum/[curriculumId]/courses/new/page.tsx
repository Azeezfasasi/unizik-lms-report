'use client';

import Link from "next/link";
import { FormEvent, use, useState } from "react";
import { useRouter } from "next/navigation";

interface CourseFormProps {
  params: Promise<{ curriculumId: string }>;
}

type Status = "idle" | "submitting" | "error";

export default function NewCoursePage({ params }: CourseFormProps) {
  const router = useRouter();
  const { curriculumId } = use(params);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [units, setUnits] = useState(3);
  const [semester, setSemester] = useState("FIRST");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isSubmitting = status === "submitting";
  const canSubmit = title.trim().length > 0 && code.trim().length > 0 && units >= 1 && !isSubmitting;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, code, units, semester, curriculumId }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      router.push(`/curriculum/${curriculumId}`);
      router.refresh();
    } catch {
      setStatus("error");
      setErrorMessage("Unable to add course right now. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/dashboard/curriculum/${curriculumId}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        Back to curriculum
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-6 flex items-start gap-3 sm:mb-8">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-teal-400 to-teal-600 text-white shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
              <path d="M6 4h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6" />
              <path d="M6 4v18" />
              <path d="M18 6H6" />
            </svg>
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-600">Curriculum Course</p>
            <h2 className="mt-0.5 text-xl font-semibold text-slate-900 sm:text-2xl">Add course</h2>
            <p className="mt-1 text-sm text-slate-500">Add a new course to this curriculum.</p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="course-title" className="mb-1.5 block text-sm font-medium text-slate-700">
              Course title <span className="text-red-500">*</span>
            </label>
            <input
              id="course-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isSubmitting}
              required
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-400"
              placeholder="Advanced Web Architecture"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
            <div>
              <label htmlFor="course-code" className="mb-1.5 block text-sm font-medium text-slate-700">
                Course code <span className="text-red-500">*</span>
              </label>
              <input
                id="course-code"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                disabled={isSubmitting}
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm uppercase text-slate-900 placeholder:text-slate-400 placeholder:normal-case transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-400"
                placeholder="CSC 801"
              />
            </div>

            <div>
              <label htmlFor="course-units" className="mb-1.5 block text-sm font-medium text-slate-700">
                Units <span className="text-red-500">*</span>
              </label>
              <input
                id="course-units"
                type="number"
                min={1}
                max={6}
                value={units}
                onChange={(event) => setUnits(Number(event.target.value))}
                disabled={isSubmitting}
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label htmlFor="course-semester" className="mb-1.5 block text-sm font-medium text-slate-700">
              Semester
            </label>
            <div className="relative">
              <select
                id="course-semester"
                value={semester}
                onChange={(event) => setSemester(event.target.value)}
                disabled={isSubmitting}
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

          {status === "error" ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="mt-0.5 h-4 w-4 shrink-0">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5M12 16h.01" />
              </svg>
              {errorMessage}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Link
              href={`/dashboard/curriculum/${curriculumId}`}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-center text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save course"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}