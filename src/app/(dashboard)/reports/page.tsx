import Link from "next/link";
import { getReportsWithStudents } from "@/lib/data/portal";

export default async function ReportsPage() {
  const reports = await getReportsWithStudents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Submitted Reports</p>
          <h2 className="text-2xl font-semibold text-slate-900">Report Oversight</h2>
        </div>
        <Link href="/reports/new" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">Create report</Link>
      </div>

      <div className="grid gap-4">
        {reports.map((report: any) => (
          <div key={report.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">{report.id}</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{report.studentName}</h3>
                <p className="mt-2 text-sm text-slate-600">{report.notes}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${report.status === "SUBMITTED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {report.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
