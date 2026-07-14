import Link from "next/link";
import { getCurriculumsByFacultyId, getDepartmentsByFacultyId, getFacultyById } from "@/lib/data/portal";

export default async function StudentReportsCurriculumPage({ params }: { params: Promise<{ facultyId: string }> }) {
  const { facultyId } = await params;
  const faculty = await getFacultyById(facultyId);
  const facultyCurriculums = await getCurriculumsByFacultyId(facultyId);
  const facultyDepartments = await getDepartmentsByFacultyId(facultyId);

  if (!faculty) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">Faculty not found.</div>;
  }

  const deptMap = Object.fromEntries(facultyDepartments.map(d => [String(d.id), d]));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Step 1</p>
        <h2 className="text-2xl font-semibold text-slate-900">Select Curriculum for {faculty.name}</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {facultyCurriculums.map((curriculum) => {
          const department = deptMap[String(curriculum.departmentId)];
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
