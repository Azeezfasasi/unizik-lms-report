import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseItem, getCurriculumById, getCoursesByCurriculum, getDepartmentById } from "@/lib/data/portal";

export default async function CurriculumDetailPage({ params }: { params: Promise<{ curriculumId: string }> }) {
  const { curriculumId } = await params;
  const curriculum = await getCurriculumById(curriculumId);

  if (!curriculum) {
    notFound();
  }

  const department = await getDepartmentById(curriculum.departmentId);
  const availableCourses: CourseItem[] = await getCoursesByCurriculum(curriculum.id);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Curriculum Detail</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{curriculum.programName}</h2>
            <p className="mt-3 text-sm text-slate-600">Department: {department?.name ?? "Unknown"}</p>
          </div>
          <Link href={`/curriculum/${curriculum.id}/courses/new`} className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Add course
          </Link>
        </div>
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
          {availableCourses.map((course: CourseItem) => (
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
