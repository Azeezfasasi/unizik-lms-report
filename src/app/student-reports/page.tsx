import Link from "next/link";
import { faculties } from "@/lib/mockData";

export default function StudentReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Student Reporting Pipeline</p>
        <h2 className="text-2xl font-semibold text-slate-900">Select a faculty to begin reporting</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {faculties.map((faculty) => (
          <Link key={faculty.id} href={`/student-reports/${faculty.id}/curriculum`} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-500">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">{faculty.code}</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">{faculty.name}</h3>
            <p className="mt-2 text-sm text-slate-600">{faculty.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
