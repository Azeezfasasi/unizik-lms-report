import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import CoordinatorReport from "@/models/CoordinatorReport";
import DeanReport from "@/models/DeanReport";
import Department from "@/models/Department";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";

const REVIEW_ROLES = ["ADMIN", "DEAN", "SUB_DEAN"];
const DECISION_KEYS = [
  "studentLectureResponse",
  "studentAssignmentResponse",
  "studentQuizResponse",
  "studentCourseworkResponse",
  "weeklySyllabusCovered",
  "courseMaterialsReleased",
  "examReadiness",
  "supervisorActiveness",
  "studentProgression",
] as const;

type DecisionStatus = "PENDING" | "APPROVED" | "REJECTED";

type DeanReview = {
  overallStatus?: DecisionStatus;
  [key: string]: { status?: DecisionStatus } | DecisionStatus | undefined;
};

function statusTone(status: DecisionStatus) {
  if (status === "APPROVED") return "text-emerald-700 bg-emerald-50";
  if (status === "REJECTED") return "text-rose-700 bg-rose-50";
  return "text-amber-700 bg-amber-50";
}

export default async function DeanReportsPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toUpperCase().trim();
  if (!role || !REVIEW_ROLES.includes(role)) redirect("/dashboard");

  await connectDB();
  const facultyId = session?.user?.facultyId;
  const departmentFilter = role === "ADMIN" ? {} : { departmentId: { $in: await getFacultyDepartments(facultyId) } };
  const reports = await CoordinatorReport.find(departmentFilter)
    .populate("curriculumId", "programName")
    .populate("preparedBy", "name")
    .sort({ submittedAt: -1, createdAt: -1 })
    .lean();
  const reportIds = reports.map((report) => report._id);
  const reviews = await DeanReport.find({ coordinatorReportId: { $in: reportIds }, reviewerRole: role })
    .select("coordinatorReportId overallStatus studentLectureResponse studentAssignmentResponse studentQuizResponse studentCourseworkResponse weeklySyllabusCovered courseMaterialsReleased examReadiness supervisorActiveness studentProgression")
    .lean();
  const reviewMap = new Map(reviews.map((review) => [String(review.coordinatorReportId), review as unknown as DeanReview]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">Faculty review</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Dean &amp; Sub-Dean reports</h1>
          <p className="mt-1 text-sm text-slate-500">Approve, reject, or leave pending each response submitted by HODs and PG Coordinators.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">{reports.length} reports</span>
      </div>

      <div className="space-y-4">
        {reports.map((report) => {
          const review = reviewMap.get(String(report._id));
          const overallStatus = (review?.overallStatus ?? "PENDING") as DecisionStatus;
          const approved = DECISION_KEYS.filter((key) => (review?.[key] as { status?: DecisionStatus } | undefined)?.status === "APPROVED").length;
          const rejected = DECISION_KEYS.filter((key) => (review?.[key] as { status?: DecisionStatus } | undefined)?.status === "REJECTED").length;
          return (
            <article key={String(report._id)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">{report.curriculumId?.programName ?? "Coordinator report"}</h2>
                    <ReportStatusBadge status={report.status} />
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(overallStatus)}`}>{overallStatus}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{report.reportRole === "HOD" ? "HOD" : "PG Coordinator"} · {report.academicSession} · {report.semester} · {report.preparedBy?.name ?? "Unknown submitter"}</p>
                </div>
                <Link href={`/dashboard/pg-course-report/${report._id}`} className="inline-flex items-center justify-center rounded-full bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800">Review report</Link>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs uppercase tracking-wide text-slate-500">Metric decisions</p><p className="mt-1 text-lg font-semibold text-slate-900">{approved + rejected}/{DECISION_KEYS.length}</p></div>
                <div className="rounded-xl bg-emerald-50 p-3"><p className="text-xs uppercase tracking-wide text-emerald-700">Approved</p><p className="mt-1 text-lg font-semibold text-emerald-800">{approved}</p></div>
                <div className="rounded-xl bg-rose-50 p-3"><p className="text-xs uppercase tracking-wide text-rose-700">Rejected</p><p className="mt-1 text-lg font-semibold text-rose-800">{rejected}</p></div>
              </div>
            </article>
          );
        })}
        {reports.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-600">No HOD or PG Coordinator reports are available for your faculty.</div> : null}
      </div>
    </div>
  );
}

async function getFacultyDepartments(facultyId?: string) {
  if (!facultyId) return [];
  const departments = await Department.find({ facultyId }).select("_id").lean();
  return departments.map((department) => department._id);
}
