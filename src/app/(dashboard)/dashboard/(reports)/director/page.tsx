import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getDirectorSummary, getAcademicSessions } from "@/lib/data/portal";
import { DirectorEmailForm } from "@/components/reports/DirectorEmailForm";

const ALLOWED_ROLES = ["ADMIN", "FACULTY_OFFICER", "PG_COORDINATOR", "DIRECTOR"];

function defaultAcademicSession() {
  const now = new Date();
  const year = now.getFullYear();
  const startYear = now.getMonth() >= 8 ? year : year - 1;
  return `${startYear}/${startYear + 1}`;
}

export default async function DirectorSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ academicSession?: string; semester?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role;
  if (!userRole || !ALLOWED_ROLES.includes(userRole)) {
    redirect("/dashboard");
  }

  const academicSessions = await getAcademicSessions();
  const currentAcademicSession = academicSessions.find((item) => item.isCurrent)?.name ?? defaultAcademicSession();
  const academicSession = resolvedSearchParams.academicSession || currentAcademicSession;
  const semester = resolvedSearchParams.semester === "FIRST" || resolvedSearchParams.semester === "SECOND" ? resolvedSearchParams.semester : undefined;
  const summary = await getDirectorSummary(academicSession, semester);

  const queryString = `academicSession=${encodeURIComponent(academicSession)}${semester ? `&semester=${semester}` : ""}`;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Director Summary</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Portal oversight dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">
            {academicSession}{semester ? ` · ${semester} semester` : ""}
          </p>
        </div>
        <Link
          href="/dashboard/reports"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-teal-500 hover:text-teal-600"
        >
          Back to reports
        </Link>
      </div>

      <form method="GET" className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">Academic session</label>
          <select name="academicSession" defaultValue={academicSession} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
            {academicSessions.length === 0 ? <option value={academicSession}>{academicSession}</option> : null}
            {academicSessions.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
                {item.isCurrent ? " (Current)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">Semester</label>
          <select name="semester" defaultValue={semester ?? ""} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="FIRST">FIRST</option>
            <option value="SECOND">SECOND</option>
          </select>
        </div>
        <button type="submit" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Apply
        </button>
      </form>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Student reports</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{summary.studentReportCount}</p>
          <p className="mt-2 text-sm text-slate-500">Submitted student feedback</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">LMS rep reports</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{summary.lmsReportCount}</p>
          <p className="mt-2 text-sm text-slate-500">Submitted readiness checks</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">PG Coordinator reports</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{summary.coordinatorReportCount}</p>
          <p className="mt-2 text-sm text-slate-500">Programme review submissions</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Examiner reports</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{summary.examinerReportCount}</p>
          <p className="mt-2 text-sm text-slate-500">Submitted exam evaluation reports</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Supervisor reports</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{summary.supervisorReportCount}</p>
          <p className="mt-2 text-sm text-slate-500">Student response metrics collected</p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Key performance</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Lecture compliance</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.avgLectureComplianceRate}%</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Lecturer training</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.avgLecturerTrainingRating}%</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Programme response</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.avgLecturerResponseRate}%</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Supervisor response</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.avgSupervisorResponsePct}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Risk signals</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-900">Misconduct flags</p>
              <p className="mt-1">{summary.coordinatorMisconductCount} coordinator report(s) flagged for misconduct.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Quiz/exam readiness</p>
              <p className="mt-1">{summary.portalReadinessReadyCount} LMS rep report(s) marked ready.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Export director summary</h3>
            <p className="mt-1 text-sm text-slate-500">Download the latest director overview in PDF, Word, or Excel.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={`/api/export/pdf/director/summary?${queryString}`}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              PDF
            </a>
            <a
              href={`/api/export/docx/director/summary?${queryString}`}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Word
            </a>
            <a
              href={`/api/export/xlsx/director/summary?${queryString}`}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Excel
            </a>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Send summary by email</h3>
        <p className="mt-1 text-sm text-slate-500">Email this director summary directly to a recipient.</p>
        <div className="mt-4">
          <DirectorEmailForm academicSession={academicSession} semester={semester} />
        </div>
      </section>
    </div>
  );
}
