import { connectDB } from "@/lib/db/connectDB";
import CourseRepReport from "@/models/CourseRepReport";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CircleArrowLeft } from "lucide-react";

export default async function LmsRepReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();

  const report = await CourseRepReport.findById(id)
    .populate("courseId", "title code")
    .populate("submittedBy", "name")
    .populate("lectureCompliance.lectureScheduleId", "title startDate endDate")
    .lean();

  if (!report) notFound();
  const r = report as {
    _id: string;
    courseId?: { title?: string; code?: string };
    status?: string;
    academicSession?: string;
    submittedBy?: { name?: string };
    lectureCompliance?: Array<{ lectureScheduleId?: { title?: string }; held?: boolean }>;
    issues?: string;
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Add a back button */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard/lms-rep-report" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <CircleArrowLeft className="h-4 w-4" />
          Back to LMS Rep Reports
        </Link>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">{r.courseId?.title}</h2>
            <ReportStatusBadge status={r.status ?? "DRAFT"} />
          </div>
          <p className="mt-1 text-sm text-slate-500">{r.courseId?.code} · {r.academicSession} · submitted by {r.submittedBy?.name}</p>
        </div>
        <ExportButtons type="lms-rep" id={r._id.toString()} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Lecture Compliance</h3>
        <div className="mt-4 space-y-2">
          {(r.lectureCompliance ?? []).map((entry, index: number) => (
            <div key={index} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
              <span className="text-sm text-slate-800">{entry.lectureScheduleId?.title}</span>
              <span className={`text-xs font-semibold ${entry.held ? "text-emerald-600" : "text-red-600"}`}>
                {entry.held ? "Held" : "Not held"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {r.issues ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-base font-semibold text-slate-900">Issues Raised</h3>
          <p className="mt-2 text-sm text-slate-600">{r.issues}</p>
        </div>
      ) : null}
    </div>
  );
}
