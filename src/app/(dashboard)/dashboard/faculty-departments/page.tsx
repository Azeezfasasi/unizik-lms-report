import Link from "next/link";
import { getFacultiesWithDepartments } from "@/lib/data/portal";

export default async function FacultyDepartmentsPage() {
  const { faculties } = await getFacultiesWithDepartments();

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Academic Structure</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">
            Faculty and Department Management
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {faculties.length} {faculties.length === 1 ? "faculty" : "faculties"} registered on the portal
          </p>
        </div>
        <Link
          href="/dashboard/faculty-departments/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 sm:self-start"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Faculty
        </Link>
      </div>

      {faculties.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {faculties.map((faculty) => {
            const facultyId = faculty.id ?? String((faculty as { _id?: string | unknown })._id ?? "");
            const departmentCount = faculty.departments.length;

            return (
              <div
                key={facultyId}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
                        <path d="M5 21V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v15" />
                        <path d="M9 21V9h6v12" />
                        <path d="M9 12h6M9 16h6" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-teal-600">
                        {faculty.code}
                      </p>
                      <h3 className="mt-0.5 truncate text-lg font-semibold text-slate-900 sm:text-xl">
                        {faculty.name}
                      </h3>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {departmentCount} {departmentCount === 1 ? "dept" : "depts"}
                  </span>
                </div>

                {faculty.description ? (
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600">{faculty.description}</p>
                ) : null}

                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">
                    {faculty.dean ? faculty.dean.charAt(0).toUpperCase() : "?"}
                  </span>
                  <span className="text-slate-600">
                    Dean: <span className="font-medium text-slate-800">{faculty.dean || "Not assigned"}</span>
                  </span>
                </div>

                <div className="mt-4">
                  {departmentCount > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {faculty.departments.slice(0, 4).map((dept) => (
                        <span
                          key={dept}
                          className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
                        >
                          {dept}
                        </span>
                      ))}
                      {departmentCount > 4 ? (
                        <span className="rounded-full border border-dashed border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-400">
                          +{departmentCount - 4} more
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No departments added yet</p>
                  )}
                </div>

                <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 xs:flex-row sm:mt-6">
                  <Link
                    href={`/dashboard/faculty-departments/${facultyId}`}
                    className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-600"
                  >
                    View Department details
                  </Link>
                  <Link
                    href={`/dashboard/faculty-departments/${facultyId}/edit`}
                    className="flex-1 rounded-full bg-teal-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-teal-700"
                  >
                    Edit faculty
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center sm:p-14">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/10 text-teal-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
              <path d="M5 21V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v15" />
              <path d="M9 21V9h6v12" />
              <path d="M9 12h6M9 16h6" />
            </svg>
          </span>
          <p className="mt-4 text-sm font-semibold text-slate-700">No faculties yet</p>
          <p className="mt-1 text-sm text-slate-400">Add your first faculty to start organizing departments.</p>
          <Link
            href="/dashboard/faculty-departments/new"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            Add Faculty
          </Link>
        </div>
      )}
    </div>
  );
}