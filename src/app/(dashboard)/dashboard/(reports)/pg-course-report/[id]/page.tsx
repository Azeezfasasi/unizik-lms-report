import { connectDB } from "@/lib/db/connectDB";
import CoordinatorReport from "@/models/CoordinatorReport";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { notFound } from "next/navigation";
import { CircleArrowLeft } from "lucide-react";
import Link from "next/link";

interface CoordinatorReportDetail {
  _id: string;
  curriculumId?: { programName?: string };
  preparedBy?: { name?: string };
  status: string;
  academicSession?: string;
  totalStudents?: number;
  totalCourses?: number;
  lectureComplianceRate?: number;
  examinerReportsSummary?: { submitted?: number; approved?: number; pending?: number };
  examTimetableStatus?: string;
  recommendations?: string;
}

export default async function CoordinatorReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();

  const report = await CoordinatorReport.findById(id)
    .populate("curriculumId", "programName")
    .populate("preparedBy", "name")
    .lean();

  if (!report) notFound();
  const r = report as CoordinatorReportDetail;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Add a back button */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard/pg-course-report" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <CircleArrowLeft className="h-4 w-4" />
          Back to PG Cordinator&apos;s Reports
        </Link>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">{r.curriculumId?.programName}</h2>
            <ReportStatusBadge status={r.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">{r.academicSession} · prepared by {r.preparedBy?.name}</p>
        </div>
        <ExportButtons type="coordinator" id={r._id.toString()} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Programme Summary</h3>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <div>Total Students: {r.totalStudents}</div>
            <div>Total Courses: {r.totalCourses}</div>
            <div>Lecture Compliance Rate: {r.lectureComplianceRate}%</div>
            <div>Exam Timetable Status: {r.examTimetableStatus}</div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Examiner Reports Summary</h3>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <div>Submitted: {r.examinerReportsSummary?.submitted}</div>
            <div>Approved: {r.examinerReportsSummary?.approved}</div>
            <div>Pending: {r.examinerReportsSummary?.pending}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Recommendations</h3>
        <p className="mt-2 text-sm text-slate-600">{r.recommendations || "None"}</p>
      </div>
    </div>
  );
}
