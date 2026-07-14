'use client';

import Link from "next/link";
import { FormEvent, use, useState } from "react";
import { useRouter } from "next/navigation";

interface CourseFormProps {
  params: Promise<{ curriculumId: string }>;
}

export default function NewCoursePage({ params }: CourseFormProps) {
  const router = useRouter();
  const { curriculumId } = use(params);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [units, setUnits] = useState(3);
  const [semester, setSemester] = useState("FIRST");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("Saving course...");
    setSubmitting(true);

    const response = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        code,
        units,
        semester,
        curriculumId,
      }),
    });

    setSubmitting(false);

    if (response.ok) {
      setMessage("Course added successfully.");
      router.push(`/curriculum/${curriculumId}`);
      router.refresh();
      return;
    }

    setMessage("Unable to add course right now.");
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Curriculum course</p>
          <h2 className="text-2xl font-semibold text-slate-900">Add course</h2>
        </div>
        <Link href={`/curriculum/${curriculumId}`} className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
          Back to curriculum
        </Link>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Course title</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            placeholder="Advanced Web Architecture"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Course code</label>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            placeholder="CSC 801"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Units</label>
            <input
              type="number"
              min="1"
              max="6"
              value={units}
              onChange={(event) => setUnits(Number(event.target.value))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Semester</label>
            <select
              value={semester}
              onChange={(event) => setSemester(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            >
              <option value="FIRST">First</option>
              <option value="SECOND">Second</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          {submitting ? "Saving course..." : "Save course"}
        </button>
      </form>

      {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
