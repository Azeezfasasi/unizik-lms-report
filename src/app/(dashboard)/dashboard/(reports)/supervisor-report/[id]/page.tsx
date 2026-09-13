import { connectDB } from "@/lib/db/connectDB";
import SupervisorReport from "@/models/SupervisorReport";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { ExportButtons } from "@/components/reports/ExportButtons";
import Link from "next/link";
import { CircleArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { ReportDiscussionPanel } from "@/components/reports/ReportDiscussionPanel";
import { ReportReviewActions } from "@/components/reports/ReportReviewActions";

export default async function SupervisorReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();

  const report = await SupervisorReport.findById(id)
    .populate("facultyId", "name")
    .populate("departmentId", "name")
    .populate("studentId", "fullName matricNumber")
    .populate("submittedBy", "name")
    .lean();

  if (!report) notFound();

  const r = report as {
    _id: string;
    facultyId?: { name?: string };
    departmentId?: { name?: string };
    academicSession?: string;
    semester?: string;
    status?: string;
    submittedBy?: { name?: string };
    studentId?: { fullName?: string; matricNumber?: string };
    projectTitle?: string;
    milestone?: string;
    progressSummary?: string;
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/supervisor-report" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <CircleArrowLeft className="h-4 w-4" />
          Back to Supervisor Reports
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">{r.facultyId?.name ?? "Supervisor report"}</h2>
            <ReportStatusBadge status={r.status ?? "DRAFT"} />
          </div>
          <p className="mt-1 text-sm text-slate-500">{r.departmentId?.name} · {r.academicSession} · {r.semester}</p>
          <p className="mt-1 text-sm text-slate-500">Submitted by {r.submittedBy?.name ?? "Unknown"}</p>
        </div>
        <ExportButtons type="supervisor" id={r._id.toString()} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Project or Thesis</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div>Title: {r.projectTitle ?? "N/A"}</div>
            <div>Student: {r.studentId ? `${r.studentId.fullName ?? "Unknown"} (${r.studentId.matricNumber ?? "No matric number"})` : "Not specified"}</div>
            <div>Current milestone: {r.milestone ?? "N/A"}</div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Report context</h3>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <div>Faculty: {r.facultyId?.name ?? "N/A"}</div>
            <div>Department: {r.departmentId?.name ?? "N/A"}</div>
            <div>Semester: {r.semester}</div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Progress Summary</h3>
        <p className="mt-3 text-sm leading-7 text-slate-700">{r.progressSummary || "No progress summary provided."}</p>
      </div>
      <ReportReviewActions reportType="supervisor" reportId={r._id.toString()} status={r.status ?? "DRAFT"} />
      <ReportDiscussionPanel reportType="supervisor" reportId={r._id.toString()} />
    </div>
  );
}
