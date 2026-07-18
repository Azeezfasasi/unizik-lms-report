import { connectDB } from "@/lib/db/connectDB";
import GeneratedReportFile from "@/models/GeneratedReportFile";
import { GeneratedReportsTable } from "@/components/reports/GeneratedReportsTable";
import { getReportsWithStudents } from "@/lib/data/portal";

export default async function SubmittedReportsPage() {
  await connectDB();
  const files = await GeneratedReportFile.find()
    .populate("generatedBy", "name")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const studentReports = await getReportsWithStudents();

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Reports</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Submitted Reports</h2>
        <p className="mt-1 text-sm text-slate-500">Every report generated across the portal, in one place.</p>
      </div>

      {studentReports.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Student reports</h3>
              <p className="mt-1 text-sm text-slate-500">Latest student-created summaries.</p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-800">{report.studentName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{report.status}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 line-clamp-2">{report.notes || "No notes"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <GeneratedReportsTable files={JSON.parse(JSON.stringify(files))} />
    </div>
  );
}
