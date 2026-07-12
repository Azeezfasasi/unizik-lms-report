import Link from "next/link";
import { StepperNav } from "@/components/shared/StepperNav";
import { curriculums, departments, getDepartmentById, getFacultyById } from "@/lib/mockData";

export default function LecturesCalendarPage({ params }: { params: { facultyId: string } }) {
  const faculty = getFacultyById(params.facultyId);
  const facultyDepartments = departments.filter((department) => department.facultyId === params.facultyId);
  const facultyCurriculums = curriculums.filter((curriculum) => facultyDepartments.some((department) => department.id === curriculum.departmentId));

  if (!faculty) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">Faculty not found.</div>;
  }

  const sampleSchedule = facultyCurriculums.slice(0, 2).map((curriculum) => ({
    id: curriculum.id,
    title: `${curriculum.programName} – Lecture Week 1`,
    detail: `${getDepartmentById(curriculum.departmentId)?.name ?? "Department"} • Review of academic calendar and teaching delivery`,
  }));

  return (
    <div className="space-y-6">
      <StepperNav currentStep={2} facultyId={faculty.id} />
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Step 2</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Lecture calendar review for {faculty.name}</h2>
        <p className="mt-3 text-sm text-slate-600">Plan the teaching schedule and confirm the curriculum delivery windows before advancing to the exam timetable.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {sampleSchedule.map((entry) => (
          <div key={entry.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">{entry.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{entry.detail}</p>
            <div className="mt-4 flex gap-3">
              <Link href={`/student-reports/${faculty.id}/exam-timetable`} className="rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white">Continue</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
