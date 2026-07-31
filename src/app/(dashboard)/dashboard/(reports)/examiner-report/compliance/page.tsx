import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getExaminerReportCompliance, getAcademicSessions } from "@/lib/data/portal";

const ALLOWED_ROLES = ["ADMIN", "FACULTY_OFFICER"];

function defaultAcademicSession() {
  const now = new Date();
  const year = now.getFullYear();
  const startYear = now.getMonth() >= 8 ? year : year - 1;
  return `${startYear}/${startYear + 1}`;
}

export default async function ExaminerReportCompliancePage({
  searchParams,
}: {
  searchParams: Promise<{ academicSession?: string; semester?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role;

  if (!userRole || !ALLOWED_ROLES.includes(userRole)) {
    redirect("/dashboard/examiner-report");
  }

  const resolvedSearchParams = await searchParams;
  const academicSessions = await getAcademicSessions();
  const currentAcademicSession = academicSessions.find((item) => item.isCurrent)?.name ?? defaultAcademicSession();
  const academicSession = resolvedSearchParams.academicSession || currentAcademicSession;
  const semester = resolvedSearchParams.semester === "FIRST" || resolvedSearchParams.semester === "SECOND"
    ? resolvedSearchParams.semester
    : undefined;

  const summary = await getExaminerReportCompliance(academicSession, semester);

  const totalAssigned = summary.departments.reduce((total, department) => total + department.totalAssigned, 0);
  const totalSubmitted = summary.departments.reduce((total, department) => total + department.totalSubmitted, 0);
  const totalFlagged = summary.departments.reduce((total, department) => total + department.flagged, 0);
  const complianceRate = totalAssigned > 0 ? Math.round((totalSubmitted / totalAssigned) * 100) : 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Director&apos;s Oversight</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Examiner Report Compliance</h2>
          <p className="mt-1 text-sm text-slate-500">
            {academicSession}
            {semester ? ` · ${semester} semester` : ""}
          </p>
        </div>
        <Link
          href="/dashboard/examiner-report"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-teal-500 hover:text-teal-600"
        >
          Back to reports
        </Link>
      </div>

      <form method="GET" className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">Academic session</label>
          <select name="academicSession" defaultValue={academicSession} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
            {academicSessions.length === 0 ? <option value={academicSession}>{academicSession}</option> : null}
            {academicSessions.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
                {item.isCurrent ? " (Current)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">Semester</label>
          <select name="semester" defaultValue={semester ?? ""} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="FIRST">FIRST</option>
            <option value="SECOND">SECOND</option>
          </select>
        </div>
        <button type="submit" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Apply
        </button>
      </form>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">Total Assigned</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">{totalAssigned}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">Submitted</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600 sm:text-3xl">{totalSubmitted}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">Outstanding</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600 sm:text-3xl">{summary.outstanding.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">Flagged</p>
          <p className="mt-2 text-2xl font-semibold text-red-600 sm:text-3xl">{totalFlagged}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Per-department compliance</h3>
          <span className="text-sm font-medium text-slate-500">{complianceRate}% overall</span>
        </div>

        {summary.departments.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-130 text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="pb-2 pr-4">Faculty</th>
                  <th className="pb-2 pr-4">Department</th>
                  <th className="pb-2 pr-4">Assigned</th>
                  <th className="pb-2 pr-4">Submitted</th>
                  <th className="pb-2 pr-4">Flagged</th>
                </tr>
              </thead>
              <tbody>
                {summary.departments.map((department) => (
                  <tr key={`${department.facultyId}-${department.departmentId}`} className="border-b border-slate-50">
                    <td className="py-2.5 pr-4 text-slate-600">{department.facultyName}</td>
                    <td className="py-2.5 pr-4 font-medium text-slate-900">{department.departmentName}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{department.totalAssigned}</td>
                    <td className="py-2.5 pr-4 text-emerald-600">{department.totalSubmitted}</td>
                    <td className="py-2.5 pr-4 text-red-600">{department.flagged}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No teaching assignments recorded for this session yet.</p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Outstanding lecturers</h3>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Lecturers with a teaching assignment but no submitted examiner report.
        </p>

        {summary.outstanding.length > 0 ? (
          <div className="mt-4 space-y-2.5">
            {summary.outstanding.map((item) => (
              <div
                key={item.assignmentId}
                className="flex flex-col gap-1 rounded-xl border border-amber-100 bg-amber-50/60 p-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.lecturerName}</p>
                  <p className="text-xs text-slate-500">
                    {item.courseName} · {item.departmentName} · {item.facultyName}
                  </p>
                </div>
                <span className="inline-flex w-fit items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  Not submitted
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center">
            <p className="text-sm font-medium text-slate-600">Everyone assigned has submitted</p>
            <p className="mt-1 text-xs text-slate-400">No outstanding examiner reports for this session.</p>
          </div>
        )}
      </section>
    </div>
  );
}
