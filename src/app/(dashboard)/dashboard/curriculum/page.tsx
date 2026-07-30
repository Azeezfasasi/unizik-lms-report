export const dynamic = "force-dynamic";

import Link from "next/link";
import DeleteResourceButton from "@/components/shared/DeleteResourceButton";
import { getCurriculumsWithDepartment } from "@/lib/data/portal";

const levelStyles: Record<string, string> = {
  PGD: "bg-sky-100 text-sky-700",
  MSc: "bg-violet-100 text-violet-700",
  PhD: "bg-amber-100 text-amber-700",
};

function levelTone(level: string) {
  return levelStyles[level] ?? "bg-teal-100 text-teal-700";
}

export default async function CurriculumPage() {
  const curriculums = await getCurriculumsWithDepartment();

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Academic Planning</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Curriculum Library</h2>
          <p className="mt-1 text-sm text-slate-500">
            {curriculums.length} {curriculums.length === 1 ? "program" : "programs"} across all departments
          </p>
        </div>
        <Link
          href="/dashboard/curriculum/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 sm:self-start"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Create curriculum
        </Link>
      </div>

      {curriculums.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {curriculums.map((curriculum) => (
            <div
              key={curriculum.id}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-teal-400 to-teal-600 text-white shadow-sm">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
                      <path d="M6 4h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6" />
                      <path d="M6 4v18" />
                      <path d="M18 6H6" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${levelTone(
                        curriculum.level
                      )}`}
                    >
                      {curriculum.level}
                    </span>
                    <h3 className="mt-1.5 truncate text-lg font-semibold text-slate-900 transition group-hover:text-teal-700 sm:text-xl">
                      {curriculum.programName}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-3.5 w-3.5 shrink-0">
                        <path d="M5 21V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v15" />
                        <path d="M9 21V9h6v12" />
                      </svg>
                      <span className="truncate">{curriculum.department?.name ?? "Department not set"}</span>
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                  v{curriculum.version}
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row flex-wrap">
                <Link
                  href={`/dashboard/curriculum/${curriculum.id}`}
                  className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-600"
                >
                  View/Add Courses
                </Link>
                <Link
                  href={`/dashboard/curriculum/${curriculum.id}/edit`}
                  className="flex-1 rounded-full bg-teal-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-teal-700"
                >
                  Edit details
                </Link>
                <DeleteResourceButton
                  deleteUrl={`/api/curriculum/${curriculum.id}`}
                  resourceName="curriculum"
                  redirectTo="/dashboard/curriculum"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center sm:p-14">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-teal-400 to-teal-600 text-white shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
              <path d="M6 4h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6" />
              <path d="M6 4v18" />
              <path d="M18 6H6" />
            </svg>
          </span>
          <p className="mt-4 text-sm font-semibold text-slate-700">The library is empty, for now</p>
          <p className="mt-1 text-sm text-slate-400">Create your first curriculum to start building out a program.</p>
          <Link
            href="/dashboard/curriculum/new"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            Create curriculum
          </Link>
        </div>
      )}
    </div>
  );
}