import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getFaculties, getReportsForStudentEmail } from "@/lib/data/portal";
import { connectDB } from "@/lib/db/connectDB";
import User from "@/models/User";

export default async function StudentReportsPage() {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role?.toString().toUpperCase().trim();
  let studentEmail: string | undefined =
    userRole === "STUDENT" && typeof session?.user?.email === "string"
      ? session.user.email.toString().trim().toLowerCase()
      : undefined;

  // If session didn't include email (old tokens), try resolving from User record
  if (userRole === "STUDENT" && !studentEmail && session?.user?.id) {
    try {
      await connectDB();
      const user = await User.findById(session.user.id).lean();
      if (user && typeof user.email === "string") studentEmail = user.email.toString().trim().toLowerCase();
    } catch {
      // ignore DB errors here; fallback will return all reports (safer to show nothing later)
    }
  }

  const [faculties, result] = await Promise.all([getFaculties(), getReportsForStudentEmail(studentEmail)]);
  const studentReports = result.reports;
  const studentMatchCount = result.studentCount;

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

      {userRole === "STUDENT" && studentMatchCount === 0 ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <p className="text-sm font-semibold text-rose-700">No student record found for your account.</p>
          <p className="mt-1 text-sm text-rose-600">Contact your administrator to link your account to a student record.</p>
        </div>
      ) : userRole === "STUDENT" && studentMatchCount > 1 ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <p className="text-sm font-semibold text-amber-700">Multiple student records found for your account.</p>
          <p className="mt-1 text-sm text-amber-600">Contact your administrator to resolve duplicate student entries.</p>
        </div>
      ) : studentReports.length > 0 ? (
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