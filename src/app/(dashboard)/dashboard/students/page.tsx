import Link from "next/link";
import { getStudents, StudentItem } from "@/lib/data/portal";

function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// Deterministic accent so the same student always gets the same avatar color.
function avatarTone(seed: string) {
  const tones = [
    "bg-teal-50 text-teal-700",
    "bg-indigo-50 text-indigo-700",
    "bg-amber-50 text-amber-700",
    "bg-rose-50 text-rose-700",
    "bg-sky-50 text-sky-700",
  ];
  const index = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % tones.length;
  return tones[index];
}

export default async function StudentsPage() {
  const students: StudentItem[] = await getStudents();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Student Directory</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Programme Students</h2>
          <p className="mt-1 text-sm text-slate-500">
            {students.length} {students.length === 1 ? "student" : "students"} enrolled.
          </p>
        </div>
        <Link
          href="/dashboard/students/new"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 sm:w-auto"
        >
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
            <path d="M8 3.5V12.5M3.5 8H12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          New student
        </Link>
      </div>

      {students.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {students.map((student) => (
            <div
              key={student.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarTone(student.id ?? student.fullName)}`}
                >
                  {initials(student.fullName)}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-slate-900">{student.fullName}</h3>
                  <span className="mt-1 inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                    {student.matricNumber}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                <a
                  href={`mailto:${student.email}`}
                  className="flex items-center gap-2 text-sm text-slate-600 transition hover:text-teal-600"
                >
                  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 shrink-0 text-slate-400">
                    <rect x="2" y="3.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M2.5 4.5L8 8.5L13.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="truncate">{student.email}</span>
                </a>

                <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                  {student.programLevel}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="text-sm font-medium text-slate-600">No students yet</p>
          <p className="mt-1 text-sm text-slate-500">Add your first student to see them listed here.</p>
        </div>
      )}
    </div>
  );
}