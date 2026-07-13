import Link from "next/link";
import { StepperNav } from "@/components/shared/StepperNav";
import { curriculums, departments, getDepartmentById, getFacultyById } from "@/lib/mockData";

export default function GeneralReportPage({ params }: { params: { facultyId: string } }) {
  const faculty = getFacultyById(params.facultyId);
  const facultyDepartments = departments.filter((department) => department.facultyId === params.facultyId);
  const facultyCurriculums = curriculums.filter((curriculum) => facultyDepartments.some((department) => department.id === curriculum.departmentId));

  if (!faculty) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">Faculty not found.</div>;
  }

  return (
    <div className="space-y-6">
      <StepperNav currentStep={4} facultyId={faculty.id} />
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Step 4</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">General reporting preview for {faculty.name}</h2>
        <p className="mt-3 text-sm text-slate-600">The aggregated report summary is ready for review before final submission and export.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Curriculum count</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{facultyCurriculums.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Departments</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{facultyDepartments.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Status</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">Ready</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Curriculum coverage</h3>
        <div className="mt-4 space-y-3">
          {facultyCurriculums.map((curriculum) => (
            <div key={curriculum.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">{curriculum.programName}</p>
              <p className="mt-1 text-sm text-slate-600">{getDepartmentById(curriculum.departmentId)?.name ?? "Department"} • Version {curriculum.version}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Link href={`/student-reports/${faculty.id}/submit`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Proceed to final submission
          </Link>
        </div>
      </div>
    </div>
  );
}
