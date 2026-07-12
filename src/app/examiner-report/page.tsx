import { examinerReports, faculties, getFacultyById } from "@/lib/mockData";

export default function ExaminerReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Examiner Review</p>
          <h2 className="text-2xl font-semibold text-slate-900">Examiner Reports</h2>
        </div>
        <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">New report</button>
      </div>

      <div className="grid gap-4">
        {examinerReports.map((report) => {
          const faculty = getFacultyById(report.facultyId);
          return (
            <div key={report.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">{faculty?.name ?? "Faculty"}</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900">{report.examinerName}</h3>
                  <p className="mt-2 text-sm text-slate-600">{report.comments}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase text-emerald-700">Score {report.score}</span>
              </div>
              <div className="mt-4 text-sm text-slate-600">
                <p>Submitted: {report.submittedAt}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
