import Link from "next/link";
import { connectDB } from "@/lib/db/connectDB";
import CourseRepReport from "@/models/CourseRepReport";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { Plus } from "lucide-react";

export default async function LmsRepReportListPage() {
  await connectDB();
  const reports = await CourseRepReport.find()
    .populate("courseId", "title code")
    .populate("submittedBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Reporting</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">LMS Rep Report</h2>
        </div>
        <Link href="/dashboard/lms-rep-report/new" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">
          <Plus className="w-4 h-4" /> Submit report
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">
          This is a list of all reports submitted by LMS Representatives. Click on a report to view its details.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {reports.map((report: { _id: string; courseId?: { title?: string; code?: string }; academicSession?: string; status?: string; totalLecturesHeld?: number; totalLecturesScheduled?: number; submittedBy?: { name?: string } }) => (
          <div key={report._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{report.courseId?.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{report.courseId?.code} · {report.academicSession}</p>
              </div>
              <ReportStatusBadge status={report.status ?? "DRAFT"} />
            </div>
            <p className="mt-3 text-sm text-slate-500">{report.totalLecturesHeld}/{report.totalLecturesScheduled} lectures held · by {report.submittedBy?.name}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link
                href={`/dashboard/lms-rep-report/${report._id}`}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-600"
              >
                View
              </Link>
              <Link
                href={`/dashboard/lms-rep-report/${report._id}/edit`}
                className="inline-flex items-center justify-center rounded-full bg-teal-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-700"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
