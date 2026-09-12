import Department from "@/models/Department";
import Faculty from "@/models/Faculty";
import Course from "@/models/Course";
import Curriculum from "@/models/Curriculum";

type ReportLike = Record<string, unknown>;

function referenceId(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toString" in value) return String(value);
  return undefined;
}

export async function resolveReportContext(reportType: string, report: ReportLike) {
  let facultyId = referenceId(report.facultyId);
  let departmentId = referenceId(report.departmentId);

  if (!departmentId && report.curriculumId) {
    const curriculum = await Curriculum.findById(report.curriculumId).select("departmentId").lean();
    departmentId = referenceId(curriculum?.departmentId);
  }

  if (!departmentId && report.courseId) {
    const course = await Course.findById(report.courseId).select("curriculumId").lean();
    const curriculumId = referenceId(course?.curriculumId);
    const curriculum = curriculumId ? await Curriculum.findById(curriculumId).select("departmentId").lean() : null;
    departmentId = referenceId(curriculum?.departmentId);
  }

  if (departmentId && !facultyId) {
    const department = await Department.findById(departmentId).select("facultyId").lean();
    facultyId = referenceId(department?.facultyId);
  }

  const faculty = facultyId ? await Faculty.findById(facultyId).select("associateProvostField").lean() : null;

  return {
    reportType,
    reportId: referenceId(report._id) ?? "",
    facultyId,
    departmentId,
    associateProvostField: faculty?.associateProvostField,
  };
}