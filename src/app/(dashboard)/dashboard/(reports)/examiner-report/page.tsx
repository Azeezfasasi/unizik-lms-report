import Link from "next/link";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import ReportAdminActions from "./_components/ReportAdminActions";
import { ExportButtons } from "@/components/reports/ExportButtons";
import {
  CourseItem,
  DepartmentItem,
  ExaminerReportItem,
  FacultyItem,
  getCourses,
  getDepartments,
  getExaminerReports,
  getFaculties,
} from "@/lib/data/portal";

const statusTone: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  SUBMITTED: "bg-sky-100 text-sky-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  REVISION_REQUESTED: "bg-orange-100 text-orange-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

function scoreTone(score?: number) {
  if (score === undefined || score === null) return "bg-slate-100 text-slate-500";
  if (score >= 70) return "bg-emerald-100 text-emerald-700";
  if (score >= 40) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function formatDate(value: unknown) {
  const date = typeof value === "string" ? new Date(value) : value instanceof Date ? value : null;
  if (!date || Number.isNaN(date.getTime())) return "Not submitted";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const MODERATOR_ROLES = ["ADMIN", "FACULTY_OFFICER"];

export default async function ExaminerReportPage() {
  const [examinerReports, faculties, departments, courses, session]: [
    ExaminerReportItem[],
    FacultyItem[],
    DepartmentItem[],
    CourseItem[],
    Session | null,
  ] = await Promise.all([getExaminerReports(), getFaculties(), getDepartments(), getCourses(), getServerSession(authOptions)]);

  const userRole = session?.user?.role;
  const userId = session?.user?.id;

  const facultyMap = new Map<string, string>(faculties.map((faculty: FacultyItem) => [faculty.id, faculty.name]));
  const departmentMap = new Map<string, string>(
    departments.map((department: DepartmentItem) => [department.id, department.name])
  );
  const courseMap = new Map<string, string>(
    courses.map((course: CourseItem) => [course.id, `${course.title} (${course.code})`])
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Examiner Review</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Examiner Reports</h2>
          <p className="mt-1 text-sm text-slate-500">
            {examinerReports.length} {examinerReports.length === 1 ? "report" : "reports"} on record
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {userRole && MODERATOR_ROLES.includes(userRole) ? (
            <>
              <Link
                href="/dashboard/examiner-report/assignments"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-teal-500 hover:text-teal-600"
              >
                Teaching assignments
              </Link>
              <Link
                href="/dashboard/examiner-report/compliance"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-teal-500 hover:text-teal-600"
              >
                Compliance report
              </Link>
            </>
          ) : null}
          <Link
            href="/dashboard/examiner-report/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New report
          </Link>
        </div>
      </div>

      {examinerReports.length > 0 ? (
        <div className="grid gap-4">
          {examinerReports.map((report) => {
            const facultyName = facultyMap.get(report.facultyId) ?? "Faculty";
            const departmentName = report.departmentId
              ? departmentMap.get(report.departmentId) ?? "Department"
              : null;
            const courseName = report.courseId ? courseMap.get(report.courseId) ?? "Course" : null;
            const score = report.score;
            const canAccessMarkingScheme =
              Boolean(userRole) &&
              (MODERATOR_ROLES.includes(userRole ?? "") || (Boolean(userId) && report.moderatorId === userId));

            return (
              <div
                key={report.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-sm font-semibold text-teal-700">
                      {report.examinerName.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-teal-600">
                        {facultyName}
                      </p>
                      <h3 className="mt-0.5 truncate text-lg font-semibold text-slate-900 sm:text-xl">
                        {report.examinerName}
                      </h3>
                      {report.comments ? (
                        <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">{report.comments}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                    {report.status ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          statusTone[report.status] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {report.status.replace(/_/g, " ")}
                      </span>
                    ) : null}
                    {report.malpracticeFlagged ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                        Malpractice flagged
                      </span>
                    ) : null}
                    {score !== undefined ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${scoreTone(
                          score
                        )}`}
                      >
                        {score}/100
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {departmentName ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-3.5 w-3.5">
                        <path d="M5 21V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v15" />
                        <path d="M9 21V9h6v12" />
                      </svg>
                      {departmentName}
                    </span>
                  ) : null}
                  {courseName ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-3.5 w-3.5">
                        <path d="M6 4h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6" />
                        <path d="M6 4v18" />
                      </svg>
                      {courseName}
                    </span>
                  ) : null}
                  {report.academicSession ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {report.academicSession}
                      {report.semester ? ` · ${report.semester}` : ""}
                    </span>
                  ) : null}
                  {report.examType ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {report.examType}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-3.5 w-3.5">
                      <rect x="3" y="4" width="18" height="17" rx="2" />
                      <path d="M3 9h18M8 3v4M16 3v4" />
                    </svg>
                    {formatDate(report.submittedAt)}
                  </span>
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4">
                  <ExportButtons type="examiner" id={report.id} />
                  {canAccessMarkingScheme && report.markingSchemeUrl ? (
                    <a
                      href={`/api/examiner-reports/${report.id}/marking-scheme`}
                      className="inline-flex w-fit items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-600"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
                        <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
                        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                      </svg>
                      Marking scheme
                    </a>
                  ) : null}
                  {userRole === "ADMIN" ? (
                    <ReportAdminActions reportId={report.id} />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center sm:p-14">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/10 text-teal-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
              <path d="M9 2h6a2 2 0 0 1 2 2v2H7V4a2 2 0 0 1 2-2Z" />
              <path d="M7 6h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
              <path d="M9 12h6M9 16h6" />
            </svg>
          </span>
          <p className="mt-4 text-sm font-semibold text-slate-700">No examiner reports yet</p>
          <p className="mt-1 text-sm text-slate-400">Create the first report to see it listed here.</p>
          <Link
            href="/dashboard/examiner-report/new"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            New report
          </Link>
        </div>
      )}
    </div>
  );
}