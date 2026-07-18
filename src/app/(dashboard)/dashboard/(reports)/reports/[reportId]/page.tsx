import Link from "next/link";
import { notFound } from "next/navigation";
import { getReportById, getStudentById, getFacultyById, getCurriculumById, getUserById } from "@/lib/data/portal";
import { ExportButtons } from "@/components/reports/ExportButtons";

export default async function ReportDetailPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const report = await getReportById(reportId);
  if (!report) {
    notFound();
  }

  const studentId = report.studentId ? String(report.studentId) : "";
  const facultyId = report.facultyId ? String(report.facultyId) : "";
  const curriculumId = report.curriculumId ? String(report.curriculumId) : "";
  const preparedById = report.preparedBy ? String(report.preparedBy) : "";

  const [student, faculty, curriculum, preparedBy] = await Promise.all([
    studentId ? getStudentById(studentId) : Promise.resolve(null),
    facultyId ? getFacultyById(facultyId) : Promise.resolve(null),
    curriculumId ? getCurriculumById(curriculumId) : Promise.resolve(null),
    preparedById ? getUserById(preparedById) : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Report Detail</p>
          <h2 className="text-2xl font-semibold text-slate-900">Report #{report.id}</h2>
        </div>
        <div className="flex gap-2 items-center">
          <Link href={`/dashboard/reports`} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-teal-500 hover:text-teal-600">Back</Link>
          <ExportButtons type="student" id={report.id} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600">Student</p>
          <p className="mt-3 text-xl font-semibold text-slate-900">{student?.fullName ?? "Unknown student"}</p>
          <p className="mt-2 text-sm text-slate-600">Matric No. {student?.matricNumber ?? "N/A"}</p>
          <p className="mt-2 text-sm text-slate-600">{student?.email ?? "N/A"}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Report status</p>
          <p className="mt-3 text-xl font-semibold text-slate-900">{report.status}</p>
          <p className="mt-2 text-sm text-slate-600">Submitted: {report.submittedAt ? new Date(report.submittedAt).toLocaleString() : "Not submitted"}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Metadata</p>
          <p className="mt-3 text-sm text-slate-700">Faculty: {faculty?.name ?? "Unknown faculty"}</p>
          <p className="mt-2 text-sm text-slate-700">Curriculum: {curriculum?.programName ?? "Unknown curriculum"}</p>
          <p className="mt-2 text-sm text-slate-700">Prepared by: {preparedBy?.name ?? "Unknown user"}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Notes</p>
        <p className="mt-3 text-sm leading-7 text-slate-700">{report.notes || "No notes available."}</p>
      </div>
    </div>
  );
}
