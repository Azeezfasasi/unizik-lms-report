import Link from "next/link";
import {
  CourseItem,
  DepartmentItem,
  ExaminerReportItem,
  FacultyItem,
  getCourses,
  getDepartments,
  getExaminerReports,
  getFaculties,
} from "@/lib/data/portal";

export default async function ExaminerReportPage() {
  const [examinerReports, faculties, departments, courses]: [
    ExaminerReportItem[],
    FacultyItem[],
    DepartmentItem[],
    CourseItem[],
  ] = await Promise.all([getExaminerReports(), getFaculties(), getDepartments(), getCourses()]);
  const facultyMap = new Map<string, string>(faculties.map((faculty: FacultyItem) => [faculty.id, faculty.name]));
  const departmentMap = new Map<string, string>(departments.map((department: DepartmentItem) => [department.id, department.name]));
  const courseMap = new Map<string, string>(courses.map((course: CourseItem) => [course.id, `${course.title} (${course.code})`]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Examiner Review</p>
          <h2 className="text-2xl font-semibold text-slate-900">Examiner Reports</h2>
        </div>
        <Link href="/examiner-report/new" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          New report
        </Link>
      </div>

      <div className="grid gap-4">
        {examinerReports.map((report) => {
          const facultyName = facultyMap.get(report.facultyId) ?? "Faculty";
          const departmentName = report.departmentId ? departmentMap.get(report.departmentId) ?? "Department" : "Department";
          const courseName = report.courseId ? courseMap.get(report.courseId) ?? "Course" : "Course";
          return (
            <div key={report.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">{facultyName}</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900">{report.examinerName}</h3>
                  <p className="mt-2 text-sm text-slate-600">{report.comments}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a href={`/api/export/pdf/${report.id}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">Download PDF</a>
                  <a href={`/api/export/word/${report.id}`} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-teal-500 hover:text-teal-600">Download Word</a>
                </div>
              </div>
              <div className="mt-4 text-sm text-slate-600 space-y-1">
                <p>Department: {departmentName}</p>
                <p>Course: {courseName}</p>
                <p>Submitted: {typeof report.submittedAt === "string" ? report.submittedAt : report.submittedAt?.toISOString().slice(0, 10) ?? "N/A"}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
