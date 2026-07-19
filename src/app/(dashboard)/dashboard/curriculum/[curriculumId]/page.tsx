import Link from "next/link";
import ClientOnlyCourseList from "@/components/curriculum/ClientOnlyCourseList";
import DeleteResourceButton from "@/components/shared/DeleteResourceButton";
import { notFound } from "next/navigation";
import { CourseItem, getCurriculumById, getCoursesByCurriculum, getDepartmentById } from "@/lib/data/portal";

const levelStyles: Record<string, string> = {
  PGD: "bg-sky-100 text-sky-700",
  MSc: "bg-violet-100 text-violet-700",
  PhD: "bg-amber-100 text-amber-700",
};

function levelTone(level: string) {
  return levelStyles[level] ?? "bg-teal-100 text-teal-700";
}

export default async function CurriculumDetailPage({ params }: { params: Promise<{ curriculumId: string }> }) {
  const { curriculumId } = await params;
  const curriculum = await getCurriculumById(curriculumId);

  if (!curriculum) {
    notFound();
  }

  const department = await getDepartmentById(curriculum.departmentId);
  const availableCourses: CourseItem[] = await getCoursesByCurriculum(curriculum.id);
  const totalUnits = availableCourses.reduce((sum, course) => sum + (course.units ?? 0), 0);
  const plainCourses = availableCourses.map((c) => ({
    id: String(c.id ?? ""),
    title: String(c.title ?? ""),
    code: String(c.code ?? ""),
    units: Number(c.units ?? 0),
    semester: (c.semester as "FIRST" | "SECOND") ?? "FIRST",
    curriculumId: String(c.curriculumId ?? ""),
  }));

  return (
    <div className="space-y-5 sm:space-y-6">
      <Link
        href="/dashboard/curriculum"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        Back to curriculum library
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-teal-400 to-teal-600 text-white shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
                <path d="M6 4h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6" />
                <path d="M6 4v18" />
                <path d="M18 6H6" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-600">Curriculum Detail</p>
              <h2 className="mt-0.5 text-xl font-semibold text-slate-900 sm:text-2xl">{curriculum.programName}</h2>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-3.5 w-3.5 shrink-0">
                  <path d="M5 21V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v15" />
                  <path d="M9 21V9h6v12" />
                </svg>
                <span className="truncate">{department?.name ?? "Department not set"}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${levelTone(curriculum.level)}`}>
                  {curriculum.level}
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {totalUnits} {totalUnits === 1 ? "unit" : "units"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link
              href={`/dashboard/curriculum/${curriculum.id}/courses/new`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 sm:shrink-0"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add course
            </Link>
            <DeleteResourceButton
              deleteUrl={`/api/curriculum/${curriculum.id}`}
              resourceName="curriculum"
              redirectTo="/dashboard/curriculum"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Courses</h3>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {availableCourses.length} {availableCourses.length === 1 ? "course" : "courses"}
          </span>
        </div>

        {availableCourses.length > 0 ? (
          <div className="mt-4">
            {/* Client component handles edit modal and actions */}
            <ClientOnlyCourseList courses={plainCourses} curriculumId={curriculum.id} />
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-8 text-center">
            <p className="text-sm font-medium text-slate-600">No courses added yet</p>
            <p className="mt-1 text-xs text-slate-400">Add the first course to this curriculum.</p>
            <Link
              href={`/dashboard/curriculum/${curriculum.id}/courses/new`}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Add course
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}