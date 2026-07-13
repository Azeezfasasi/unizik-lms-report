import { notFound } from "next/navigation";
import { courses, getCurriculumById, getCoursesByCurriculum, getDepartmentById } from "@/lib/mockData";

export default function CurriculumDetailPage({ params }: { params: { curriculumId: string } }) {
  const curriculum = getCurriculumById(params.curriculumId);

  if (!curriculum) {
    notFound();
  }

  const department = getDepartmentById(curriculum.departmentId);
  const availableCourses = getCoursesByCurriculum(curriculum.id);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Curriculum Detail</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">{curriculum.programName}</h2>
        <p className="mt-3 text-sm text-slate-600">Department: {department?.name ?? "Unknown"}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">Level</p>
            <p className="mt-1 text-slate-900">{curriculum.level}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">Version</p>
            <p className="mt-1 text-slate-900">{curriculum.version}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Courses</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {availableCourses.map((course) => (
            <div key={course.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <h4 className="font-semibold text-slate-900">{course.title}</h4>
              <p className="mt-2 text-sm text-slate-600">{course.code} • {course.units} units • {course.semester}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
