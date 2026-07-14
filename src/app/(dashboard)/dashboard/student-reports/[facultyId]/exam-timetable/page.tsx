import Link from "next/link";
import { StepperNav } from "@/components/shared/StepperNav";
import { getCurriculumsByFacultyId, getDepartmentsByFacultyId, getFacultyById } from "@/lib/data/portal";

export default async function ExamTimetablePage({ params }: { params: Promise<{ facultyId: string }> }) {
  const { facultyId } = await params;
  const faculty = await getFacultyById(facultyId);
  const facultyCurriculums = await getCurriculumsByFacultyId(facultyId);
  const facultyDepartments = await getDepartmentsByFacultyId(facultyId);

  if (!faculty) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">Faculty not found.</div>;
  }

  const deptMap = Object.fromEntries(facultyDepartments.map(d => [String(d.id), d]));

  const examEntries = facultyCurriculums.map((curriculum) => ({
    id: curriculum.id,
    title: `${curriculum.programName} – Examination Window`,
    detail: `${deptMap[String(curriculum.departmentId)]?.name ?? "Department"} • Venue reserved and invigilator assigned`,
  }));

  return (
    <div className="space-y-6">
      <StepperNav currentStep={3} facultyId={faculty.id} />
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Step 3</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Examination timetable for {faculty.name}</h2>
        <p className="mt-3 text-sm text-slate-600">Review the timetable windows, confirm venues, and move to the summary for final submission.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {examEntries.map((entry) => (
          <div key={entry.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">{entry.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{entry.detail}</p>
            <div className="mt-4 flex gap-3">
              <Link href={`/dashboard/student-reports/${faculty.id}/general-report`} className="rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white">Preview summary</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
