import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import {
  getCourses,
  getDepartments,
  getExaminerReports,
  getFaculties,
  getLmsRepReports,
  getReportsWithStudents,
} from "@/lib/data/portal";
import ReportApprovalActions from "@/components/reports/ReportApprovalActions";

const APPROVAL_ROLES = ["ADMIN", "PG_COORDINATOR"];
const STATUS_OPTIONS = ["ALL", "DRAFT", "SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED", "APPROVED", "REJECTED"];
const TYPE_OPTIONS = ["ALL", "EXAMINER", "LMS_REP", "STUDENT"];

interface ReportApprovalsPageProps {
  searchParams?: Promise<{
    query?: string;
    status?: string;
    type?: string;
    page?: string;
    pageSize?: string;
  }> | {
    query?: string;
    status?: string;
    type?: string;
    page?: string;
    pageSize?: string;
  };
}

interface UnifiedReport {
  id: string;
  type: "EXAMINER" | "LMS_REP" | "STUDENT";
  title: string;
  subtitle: string;
  status: string;
  submittedAt?: unknown;
  details: string;
  endpoint: string;
  reportType: "EXAMINER" | "LMS_REP" | "STUDENT";
}

export default async function ReportApprovalsPage({ searchParams }: ReportApprovalsPageProps) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role?.toString().toUpperCase().trim();
  if (!userRole || !APPROVAL_ROLES.includes(userRole)) {
    redirect("/dashboard");
  }

  const params = searchParams ? await searchParams : {};
  const query = String(params.query ?? "").trim();
  const statusFilter = String(params.status ?? "ALL").toUpperCase();
  const typeFilter = String(params.type ?? "ALL").toUpperCase();
  const page = Math.max(parseInt(String(params.page ?? "1"), 10) || 1, 1);
  const pageSize = Math.max(parseInt(String(params.pageSize ?? "10"), 10) || 10, 1);

  const [reports, lmsReports, studentReports, faculties, departments, courses] = await Promise.all([
    getExaminerReports(),
    getLmsRepReports(),
    getReportsWithStudents(),
    getFaculties(),
    getDepartments(),
    getCourses(),
  ]);

  const facultyMap = new Map(faculties.map((faculty) => [faculty.id, faculty.name]));
  const departmentMap = new Map(departments.map((department) => [department.id, department.name]));
  const courseMap = new Map(courses.map((course) => [course.id, `${course.title} (${course.code})`]));

  function formatSubmittedAt(value: unknown) {
    if (!value) return "No";
    const date = typeof value === "string" || typeof value === "number" || value instanceof Date ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : "No";
  }

  function normalizeReports(): UnifiedReport[] {
    const normalized: UnifiedReport[] = [];

    reports.forEach((report) => {
      normalized.push({
        id: report.id,
        type: "EXAMINER",
        title: report.examinerName,
        subtitle: [
          facultyMap.get(report.facultyId),
          report.departmentId ? departmentMap.get(report.departmentId) : undefined,
          report.courseId ? courseMap.get(report.courseId) : undefined,
          report.academicSession,
        ]
          .filter(Boolean)
          .join(" · "),
        status: report.status ?? "UNKNOWN",
        submittedAt: report.submittedAt,
        details: [report.examType, report.semester].filter(Boolean).join(" · ") || "No details",
        endpoint: `/dashboard/examiner-report/${report.id}`,
        reportType: "EXAMINER",
      });
    });

    lmsReports.forEach((report) => {
      normalized.push({
        id: report.id,
        type: "LMS_REP",
        title: report.courseTitle ?? report.courseCode ?? "Unknown course",
        subtitle: [report.academicSession, report.semester, report.submittedByName].filter(Boolean).join(" · "),
        status: report.status ?? "DRAFT",
        submittedAt: report.submittedAt,
        details: `Held ${report.totalLecturesHeld ?? 0}/${report.totalLecturesScheduled ?? 0}`,
        endpoint: `/dashboard/lms-rep-report/${report.id}`,
        reportType: "LMS_REP",
      });
    });

    studentReports.forEach((report) => {
      normalized.push({
        id: report.id,
        type: "STUDENT",
        title: report.studentName,
        subtitle: report.notes ? report.notes.substring(0, 120) : "No notes",
        status: report.status ?? "DRAFT",
        submittedAt: report.submittedAt,
        details: report.notes || "No notes",
        endpoint: `/dashboard/reports/${report.id}`,
        reportType: "STUDENT",
      });
    });

    return normalized;
  }

  const allReports = normalizeReports();

  const queryText = query.toLowerCase();
  const filteredReports = allReports.filter((report) => {
    if (statusFilter !== "ALL" && report.status.toUpperCase() !== statusFilter) {
      return false;
    }

    if (typeFilter !== "ALL" && report.type !== typeFilter) {
      return false;
    }

    if (!queryText) return true;

    return [report.title, report.subtitle, report.details, report.status]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(queryText));
  });

  const sortedReports = filteredReports.sort((a, b) => {
    const aTime = Date.parse(String(a.submittedAt ?? 0)) || 0;
    const bTime = Date.parse(String(b.submittedAt ?? 0)) || 0;
    return bTime - aTime;
  });

  const totalPages = Math.max(Math.ceil(sortedReports.length / pageSize), 1);
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pagedReports = sortedReports.slice(startIndex, startIndex + pageSize);

  function buildQuery(params: Record<string, string | number | undefined>) {
    const search = new URLSearchParams();
    const merged = {
      query,
      status: statusFilter,
      type: typeFilter,
      page: String(currentPage),
      pageSize: String(pageSize),
      ...params,
    };

    Object.entries(merged).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        search.set(key, String(value));
      }
    });

    return `?${search.toString()}`;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Report approvals</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Review all created reports</h2>
          <p className="mt-1 text-sm text-slate-500">
            Showing {pagedReports.length} of {filteredReports.length} report{filteredReports.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Link
          href="/dashboard/examiner-report/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          New examiner report
        </Link>
      </div>

      {/* <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px]"> */}
      <div className="flex flex-col lg:flex-col gap-4 lg:gap-6">
        <form method="get" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_1fr]">
          <div className="space-y-1">
            <label htmlFor="query" className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Search
            </label>
            <input
              id="query"
              name="query"
              defaultValue={query}
              placeholder="Search examiner, course, student, status"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="type" className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                Type
              </label>
              <select
                id="type"
                name="type"
                defaultValue={typeFilter}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
                {TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="status" className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={statusFilter}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Apply
            </button>
            <Link
              href="/dashboard/reports/approvals"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Clear
            </Link>
          </div>
        </form>

        <div className="hidden rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Filters</p>
          <p className="mt-2">Search and filter across examiner, LMS Rep, and student reports.</p>
          <div className="mt-4 space-y-2">
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Search</p>
              <p className="mt-1 text-sm text-slate-600">{query || "Search all report fields."}</p>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Type</p>
              <p className="mt-1 text-sm text-slate-600">{typeFilter}</p>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Status</p>
              <p className="mt-1 text-sm text-slate-600">{statusFilter}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Approval list</p>
            <p className="mt-1 text-sm text-slate-500">Page {currentPage} of {totalPages}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
              {filteredReports.length} results
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
              {pageSize} per page
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {pagedReports.length > 0 ? (
            pagedReports.map((report) => (
              <div key={`${report.type}-${report.id}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-teal-600">
                      <span>{report.type.replace("_", " ")}</span>
                      <span className="text-slate-300">·</span>
                      <span>{report.status}</span>
                    </div>
                    <h3 className="mt-3 truncate text-lg font-semibold text-slate-900 sm:text-xl">
                      {report.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">{report.subtitle || report.details}</p>
                  </div>

                  <div className="flex flex-col gap-3 sm:items-end">
                    <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      {formatSubmittedAt(report.submittedAt)}
                    </div>
                    <Link
                      href={report.endpoint}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-600"
                    >
                      View details
                    </Link>
                    <ReportApprovalActions reportId={report.id} status={report.status} reportType={report.reportType} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-sm font-semibold text-slate-700">No matching reports.</p>
              <p className="mt-1 text-sm text-slate-500">Try a different search or adjust the filters.</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-500">
            Showing {startIndex + 1}–{Math.min(startIndex + pageSize, filteredReports.length)} of {filteredReports.length} reports
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={buildQuery({ page: Math.max(currentPage - 1, 1) })}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
            >
              Previous
            </Link>
            <Link
              href={buildQuery({ page: Math.min(currentPage + 1, totalPages) })}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
