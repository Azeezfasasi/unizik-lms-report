import Link from "next/link";
import { curriculums, departments, getDepartmentById, getFacultyById } from "@/lib/mockData";

export default function StudentReportsCurriculumPage({ params }: { params: { facultyId: string } }) {
  const faculty = getFacultyById(params.facultyId);
  const facultyDepartments = departments.filter((department) => department.facultyId === params.facultyId);
  const facultyCurriculums = curriculums.filter((curriculum) => facultyDepartments.some((department) => department.id === curriculum.departmentId));

  if (!faculty) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">Faculty not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Step 1</p>
        <h2 className="text-2xl font-semibold text-slate-900">Select Curriculum for {faculty.name}</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {facultyCurriculums.map((curriculum) => {
          const department = getDepartmentById(curriculum.departmentId);
          return (
            <Link key={curriculum.id} href={`/student-reports/${faculty.id}/lectures-calendar`} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-500">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">{department?.name ?? "Department"}</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">{curriculum.programName}</h3>
              <p className="mt-2 text-sm text-slate-600">Version {curriculum.version}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
