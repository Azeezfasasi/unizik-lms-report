import { connectDB } from "@/lib/db/connectDB";
import CoordinatorReport from "@/models/CoordinatorReport";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { notFound } from "next/navigation";
import { CircleArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReportDiscussionPanel } from "@/components/reports/ReportDiscussionPanel";
import { ReportReviewActions } from "@/components/reports/ReportReviewActions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { canViewAssociateProvostReport } from "@/lib/auth/reportAccess";
import { resolveReportContext } from "@/lib/auth/reportContext";
import { DeanReportActions } from "@/components/reports/DeanReportActions";

interface CoordinatorReportDetail {
  _id: string;
  curriculumId?: { programName?: string };
  preparedBy?: { name?: string };
  status: string;
  academicSession?: string;
  semester?: string;
  totalStudents?: number;
  totalCourses?: number;
  lectureComplianceRate?: number;
  lecturerResponseRate?: number;
  studentLectureResponseLow?: number;
  studentLectureResponseAverage?: number;
  studentLectureResponseHigh?: number;
  studentAssignmentResponseLow?: number;
  studentAssignmentResponseAverage?: number;
  studentAssignmentResponseHigh?: number;
  studentQuizResponseLow?: number;
  studentQuizResponseAverage?: number;
  studentQuizResponseHigh?: number;
  studentCourseworkResponseLow?: number;
  studentCourseworkResponseAverage?: number;
  studentCourseworkResponseHigh?: number;
  weeklySyllabusCoveredRate?: number;
  courseMaterialsReleasedRate?: number;
  examReadinessRate?: number;
  supervisorActivesRate?: number;
  studentProgressionRate?: number;
  misconductSeverity?: "NONE" | "MINOR" | "SERIOUS";
  generalComments?: string;
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
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toUpperCase().trim();
  const associateProvostField = session?.user?.associateProvostField;
  if (role === "ASSOCIATE_PROVOST") {
    const context = await resolveReportContext("coordinator", report as unknown as Record<string, unknown>);
    if (!canViewAssociateProvostReport(role, associateProvostField, context.associateProvostField)) notFound();
  }
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Student responses</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {([
            ["Lectures", "studentLectureResponse"],
            ["Assignments", "studentAssignmentResponse"],
            ["Quizzes", "studentQuizResponse"],
            ["Course work", "studentCourseworkResponse"],
          ] as const).map(([label, prefix]) => <div key={prefix} className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600"><p className="font-semibold text-slate-900">{label}</p><p className="mt-2">Low: {(r[`${prefix}Low` as keyof CoordinatorReportDetail] as number) ?? 0}%</p><p>Average: {(r[`${prefix}Average` as keyof CoordinatorReportDetail] as number) ?? 0}%</p><p>High: {(r[`${prefix}High` as keyof CoordinatorReportDetail] as number) ?? 0}%</p></div>)}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Operational indicators</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {([["Weekly syllabus covered", "weeklySyllabusCoveredRate"], ["Course materials released", "courseMaterialsReleasedRate"], ["Exam readiness", "examReadinessRate"], ["Supervisor's actives", "supervisorActivesRate"], ["Student progression", "studentProgressionRate"]] as const).map(([label, key]) => <div key={key} className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-slate-900">{r[key] ?? 0}%</p></div>)}
        </div>
      </section>
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

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Lecturer response</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{r.lecturerResponseRate}%</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Misconduct severity</p>
          <p className="mt-3 text-sm text-slate-600">{r.misconductSeverity === "NONE" ? "None" : r.misconductSeverity === "MINOR" ? "Minor" : "Serious"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Duration</p>
          <p className="mt-3 text-sm text-slate-600">{r.academicSession} · {r.semester}</p>
        </div>
      </div>

      {r.generalComments ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-base font-semibold text-slate-900">General comments</h3>
          <p className="mt-2 text-sm text-slate-600">{r.generalComments}</p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Recommendations</h3>
        <p className="mt-2 text-sm text-slate-600">{r.recommendations || "None"}</p>
      </div>
      <DeanReportActions coordinatorReportId={r._id.toString()} />
      <ReportReviewActions reportType="coordinator" reportId={r._id.toString()} status={r.status} />
      <ReportDiscussionPanel reportType="coordinator" reportId={r._id.toString()} />
    </div>
  );
}
