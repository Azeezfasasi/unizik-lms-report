import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import {
  CourseItem,
  getCourses,
  getFaculties,
  getTeachingAssignments,
} from "@/lib/data/portal";

const ALLOWED_ROLES = ["ADMIN", "FACULTY_OFFICER"];

export default async function TeachingAssignmentsPage() {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role;

  if (!userRole || !ALLOWED_ROLES.includes(userRole)) {
    redirect("/dashboard/examiner-report");
  }

  const [assignments, courses] = await Promise.all([getTeachingAssignments(), getCourses(), getFaculties()]);

  const courseMap = new Map<string, CourseItem>(courses.map((course) => [course.id, course]));

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Expected Submissions</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Teaching Assignments</h2>
          <p className="mt-1 text-sm text-slate-500">
            {assignments.length} {assignments.length === 1 ? "assignment" : "assignments"} on record
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/examiner-report"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-teal-500 hover:text-teal-600"
          >
            Examiner reports
          </Link>
          <Link
            href="/dashboard/examiner-report/assignments/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New assignment
          </Link>
        </div>
      </div>

      {assignments.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-160 text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Lecturer</th>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Session</th>
                <th className="px-5 py-3">Semester</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => {
                const course = courseMap.get(assignment.courseId);
                return (
                  <tr key={assignment.id} className="border-b border-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">{assignment.lecturerName ?? "Unknown lecturer"}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {course ? `${course.title} (${course.code})` : "Unknown course"}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{assignment.academicSession}</td>
                    <td className="px-5 py-3 text-slate-600">{assignment.semester}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center sm:p-14">
          <p className="text-sm font-semibold text-slate-700">No teaching assignments yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Create assignments so the compliance report can tell who has and hasn&apos;t submitted.
          </p>
          <Link
            href="/dashboard/examiner-report/assignments/new"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            New assignment
          </Link>
        </div>
      )}
    </div>
  );
}
