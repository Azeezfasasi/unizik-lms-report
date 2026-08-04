import Link from "next/link";
import { connectDB } from "@/lib/db/connectDB";
import SupervisorReport from "@/models/SupervisorReport";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { Plus } from "lucide-react";

export default async function SupervisorReportListPage() {
  await connectDB();
  const reports = await SupervisorReport.find()
    .populate("facultyId", "name")
    .populate("departmentId", "name")
    .populate("submittedBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Supervisor reports</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Supervisor Review Dashboard</h2>
        </div>
        <Link href="/dashboard/supervisor-report/new" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">
          <Plus className="w-4 h-4" /> Create report
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {reports.map((report: (typeof reports)[number]) => (
          <Link key={report._id} href={`/dashboard/supervisor-report/${report._id}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{report.facultyId?.name ?? "Faculty"}</h3>
                <p className="mt-1 text-sm text-slate-500">{report.departmentId?.name ?? "Department"}</p>
              </div>
              <ReportStatusBadge status={report.status ?? "DRAFT"} />
            </div>
            <p className="mt-3 text-sm text-slate-600">Submitted by {report.submittedBy?.name ?? "Unknown"}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
