import Link from "next/link";
import { getFaculties, getReportsWithStudents } from "@/lib/data/portal";

export default async function StudentReportsPage() {
  const [faculties, studentReports] = await Promise.all([getFaculties(), getReportsWithStudents()]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Student Reporting Pipeline</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Select a faculty to begin reporting</h2>
          <p className="mt-1 text-sm text-slate-500">
            {faculties.length > 0
              ? `${faculties.length} ${faculties.length === 1 ? "faculty" : "faculties"} available.`
              : "No faculties are available yet."}
          </p>
        </div>
        <Link
          href="/dashboard/student-reports/new"
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          New student report
        </Link>
      </div>

      {/* {faculties.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {faculties.map((faculty) => (
            <Link
              key={faculty.id}
              href={`/dashboard/student-reports/${faculty.id}/curriculum`}
              className="group relative flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-500 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/20 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">
                  {faculty.code}
                </span>
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-500"
                >
                  <path d="M6 3.5L11 8L6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <h3 className="mt-3 text-lg font-semibold text-slate-900 sm:text-xl">{faculty.name}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{faculty.description}</p>

              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-600 opacity-0 transition group-hover:opacity-100">
                Start reporting
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                  <path d="M6 3.5L11 8L6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="text-sm font-medium text-slate-600">No faculties to show</p>
          <p className="mt-1 text-sm text-slate-500">Once faculties are added, they&apos;ll appear here for selection.</p>
        </div>
      )} */}

      {studentReports.length > 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Saved reports</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Recent student reports</h3>
            </div>
            <p className="text-sm text-slate-500">{studentReports.length} reports</p>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-800">{report.studentName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{report.status}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 line-clamp-2">{report.notes || "No notes"}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium">
                      <Link href={`/dashboard/reports/${report.id}`} className="text-teal-600 hover:text-teal-700">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}