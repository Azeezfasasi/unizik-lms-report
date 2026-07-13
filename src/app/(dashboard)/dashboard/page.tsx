import Link from "next/link";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { getDashboardSummary, getExaminerReports } from "@/lib/data/portal";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  const examinerReports = await getExaminerReports();

  const stats = [
    { label: "Faculties", value: summary.faculties.toString() },
    { label: "Curriculums", value: summary.curriculums.toString() },
    { label: "Students", value: summary.students.toString() },
    { label: "Submitted Reports", value: summary.submittedReports.toString() },
  ];

  return (
    <div className="space-y-6">
      {/* Header is rendered in the (dashboard) layout so page content starts below it */}

      <OfflineBanner />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900 sm:text-3xl">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Latest Examiner Activity</h3>
              <p className="mt-2 text-sm text-slate-500">Recent evaluations from examiners across the portal.</p>
            </div>
            <Link href="/examiner-report" className="text-sm font-medium text-teal-600 hover:text-teal-500">
              View all
            </Link>
          </div>
          <div className="mt-6 space-y-3">
            {examinerReports.slice(0, 3).map((report) => (
              <div key={report.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{report.examinerName}</p>
                    <p className="mt-1 text-sm text-slate-600">{report.comments}</p>
                  </div>
                  <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase text-emerald-700">
                    {report.score}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
          <div className="mt-4 space-y-3">
            <Link href="/faculty-departments" className="block rounded-2xl border border-slate-200 p-4 text-sm font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-600">
              Manage faculties and departments
            </Link>
            <Link href="/curriculum" className="block rounded-2xl border border-slate-200 p-4 text-sm font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-600">
              Review and update curricula
            </Link>
            <Link href="/student-reports" className="block rounded-2xl border border-slate-200 p-4 text-sm font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-600">
              Open student reporting pipeline
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
