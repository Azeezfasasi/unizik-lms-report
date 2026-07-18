import Link from "next/link";
import { notFound } from "next/navigation";
import { getDepartmentsByFacultyId, getFacultyById } from "@/lib/data/portal";
import DeleteResourceButton from "@/components/shared/DeleteResourceButton";

export default async function FacultyDetailPage({ params }: { params: Promise<{ facultyId: string }> }) {
  const { facultyId } = await params;
  const faculty = await getFacultyById(facultyId);
  if (!faculty) {
    notFound();
  }

  const facultyDepartments = await getDepartmentsByFacultyId(facultyId);

  return (
    <div className="space-y-5 sm:space-y-6">
      <Link
        href="/dashboard/faculty-departments"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        Back to faculties
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
              <path d="M5 21V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v15" />
              <path d="M9 21V9h6v12" />
              <path d="M9 12h6M9 16h6" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-600">Faculty Profile</p>
            <h2 className="mt-0.5 text-xl font-semibold text-slate-900 sm:text-2xl">{faculty.name}</h2>
            {faculty.description ? (
              <p className="mt-2 max-w-xl text-sm text-slate-600">{faculty.description}</p>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2 sm:shrink-0">
          <Link
            href={`/dashboard/faculty-departments/${facultyId}/edit`}
            className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-600 sm:flex-none"
          >
            Edit faculty
          </Link>
          <Link
            href={`/dashboard/faculty-departments/${facultyId}/departments/new`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 sm:flex-none"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add department
          </Link>
          <DeleteResourceButton
            deleteUrl={`/api/faculties/${facultyId}`}
            resourceName="faculty"
            redirectTo="/dashboard/faculty-departments"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
                <path d="M4 7h16M4 12h16M4 17h10" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Faculty Code</p>
              <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">{faculty.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[13px] font-semibold text-teal-700 shadow-sm">
              {faculty.dean ? faculty.dean.charAt(0).toUpperCase() : "?"}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Dean</p>
              <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">{faculty.dean || "Not assigned"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Departments</h3>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {facultyDepartments.length} {facultyDepartments.length === 1 ? "department" : "departments"}
          </span>
        </div>

        {facultyDepartments.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {facultyDepartments.map((department) => (
              <div
                key={department.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-teal-200"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[12px] font-semibold text-slate-600 shadow-sm">
                    {department.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold text-slate-900">{department.name}</h4>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      HOD: {department.hod || "Not assigned"}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/dashboard/faculty-departments/${facultyId}/departments/${department.id}`}
                  className="shrink-0 rounded-full bg-teal-600 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:bg-teal-700"
                >
                  Manage
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-8 text-center">
            <p className="text-sm font-medium text-slate-600">No departments yet</p>
            <p className="mt-1 text-xs text-slate-400">Add the first department under this faculty.</p>
            <Link
              href={`/dashboard/faculty-departments/${facultyId}/departments/new`}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Add department
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}