import Link from "next/link";
import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getDashboardSummary, getExaminerReports } from "@/lib/data/portal";

const statIcons: Record<string, ReactNode> = {
  Faculties: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4.5 w-4.5">
      <path d="M5 21V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v15" />
      <path d="M9 21V9h6v12" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  ),
  Curriculums: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4.5 w-4.5">
      <path d="M6 4h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6" />
      <path d="M6 4v18" />
      <path d="M18 6H6" />
    </svg>
  ),
  Students: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4.5 w-4.5">
      <path d="M7 20v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2" />
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
      <path d="M17 8a3 3 0 1 1 3 3" />
    </svg>
  ),
  "Submitted Reports": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4.5 w-4.5">
      <path d="M9 2h6a2 2 0 0 1 2 2v2H7V4a2 2 0 0 1 2-2Z" />
      <path d="M7 6h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
      <path d="m9 13 2 2 4-4" />
    </svg>
  ),
};

const quickActions = [
  {
    href: "/dashboard/faculty-departments",
    label: "Manage faculties and departments",
    description: "Add, edit, or organize academic units",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4.5 w-4.5">
        <path d="M5 21V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v15" />
        <path d="M9 21V9h6v12" />
        <path d="M9 12h6M9 16h6" />
      </svg>
    ),
  },
  {
    href: "/dashboard/curriculum",
    label: "Review and update curricula",
    description: "Keep program structures current",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4.5 w-4.5">
        <path d="M6 4h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6" />
        <path d="M6 4v18" />
        <path d="M18 6H6" />
      </svg>
    ),
  },
  {
    href: "/dashboard/student-reports",
    label: "Open student reporting pipeline",
    description: "Continue or start a general report",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4.5 w-4.5">
        <path d="M4 19h16" />
        <path d="M8 15v4" />
        <path d="M12 11v8" />
        <path d="M16 7v12" />
      </svg>
    ),
  },
];

function scoreTone(score: number | undefined) {
  if (score !== undefined && score >= 70) return "bg-emerald-100 text-emerald-700";
  if (score !== undefined && score >= 40) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const summary = await getDashboardSummary();
  const examinerReports = await getExaminerReports();

  const stats = [
    { label: "Faculties", value: summary.faculties.toString() },
    { label: "Curriculums", value: summary.curriculums.toString() },
    { label: "Students", value: summary.students.toString() },
    { label: "Submitted Reports", value: summary.submittedReports.toString() },
  ];

  const recentReports = examinerReports.slice(0, 3);
  const isStudent = session?.user?.role === "STUDENT";

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header is rendered in the (dashboard) layout so page content starts below it */}

      <OfflineBanner />

      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Overview</h1>
          <p className="mt-1 text-sm text-slate-500">A snapshot of activity across the portal.</p>
        </div>
      </div>

      {isStudent ? (
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Welcome to your student dashboard</h2>
            <p className="mt-2 text-sm text-slate-500">Create a feedback report, review submitted reports, or update your profile.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Link href="/dashboard/student-reports" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-500 hover:bg-teal-50">
              <p className="text-sm font-semibold text-slate-900">Student reporting</p>
              <p className="mt-2 text-sm text-slate-500">Start or continue your own feedback report.</p>
            </Link>
            <Link href="/dashboard/reports" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-500 hover:bg-teal-50">
              <p className="text-sm font-semibold text-slate-900">Submitted reports</p>
              <p className="mt-2 text-sm text-slate-500">View reports generated by the portal.</p>
            </Link>
            <Link href="/dashboard/settings/profile" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-500 hover:bg-teal-50">
              <p className="text-sm font-semibold text-slate-900">Profile settings</p>
              <p className="mt-2 text-sm text-slate-500">Update your account details.</p>
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                    {statIcons[stat.label]}
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500 sm:text-xs">
                  {stat.label}
                </p>
              </div>
            ))}
          </section>

          <section className="grid gap-4 sm:gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Latest Examiner Activity</h3>
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    Recent evaluations from examiners across the portal.
                  </p>
                </div>
                <Link
                  href="/dashboard/examiner-report"
                  className="self-start text-xs font-medium text-teal-600 hover:text-teal-500 sm:self-auto sm:text-sm"
                >
                  View all
                </Link>
              </div>

              {recentReports.length > 0 ? (
                <div className="mt-5 space-y-2.5">
                  {recentReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-4"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-[12px] font-semibold text-teal-700">
                        {report.examinerName.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{report.examinerName}</p>
                        <p className="mt-0.5 line-clamp-2 text-[13px] text-slate-600 sm:line-clamp-1">
                          {report.comments}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${scoreTone(
                          report.score
                        )}`}
                      >
                        {report.score ?? 0}/100
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-sm font-medium text-slate-600">No examiner activity yet</p>
                  <p className="mt-1 text-xs text-slate-400">Submitted evaluations will show up here.</p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Quick Actions</h3>
              <div className="mt-4 space-y-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-teal-500 hover:bg-teal-50/50 sm:p-4"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-teal-500/10 group-hover:text-teal-600">
                      {action.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 transition group-hover:text-teal-700">
                        {action.label}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">{action.description}</p>
                    </div>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-500"
                    >
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
