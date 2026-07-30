import StudentReport from "@/models/StudentReport";
import CourseRepReport from "@/models/CourseRepReport";
import CoordinatorReport from "@/models/CoordinatorReport";
import ExaminerReport from "@/models/ExaminerReport";
import SupervisorReport from "@/models/SupervisorReport";
import WeeklyEffectivenessReport from "@/models/WeeklyEffectivenessReport";
import "@/models/Student";
import "@/models/Faculty";
import "@/models/Curriculum";
import "@/models/Course";
import "@/models/Department";
import "@/models/User";
import "@/models/LectureSchedule";
import "@/models/AcademicWeek";

export type ReportKey = "student" | "lms-rep" | "coordinator" | "examiner" | "supervisor" | "weekly-effectiveness";

export type AdapterReportType = "STUDENT" | "LMS_REP" | "PG_COORDINATOR" | "EXAMINER" | "SUPERVISOR" | "WEEKLY_EFFECTIVENESS";

type QueryHandle = {
  populate: (path: string | Record<string, unknown>) => QueryHandle;
  lean: () => Promise<Record<string, unknown> | null>;
};

type QueryModel = {
  findById: (id: string) => QueryHandle;
};

export const REPORT_MODEL_MAP: Record<ReportKey, unknown> = {
  student: StudentReport,
  "lms-rep": CourseRepReport,
  coordinator: CoordinatorReport,
  examiner: ExaminerReport,
  supervisor: SupervisorReport,
  "weekly-effectiveness": WeeklyEffectivenessReport,
};

export const REPORT_TYPE_MAP: Record<ReportKey, AdapterReportType> = {
  student: "STUDENT",
  "lms-rep": "LMS_REP",
  coordinator: "PG_COORDINATOR",
  examiner: "EXAMINER",
  supervisor: "SUPERVISOR",
  "weekly-effectiveness": "WEEKLY_EFFECTIVENESS",
};

export const REPORT_POPULATE_MAP: Record<ReportKey, string[]> = {
  student: ["studentId", "facultyId", "curriculumId"],
  "lms-rep": ["courseId", "curriculumId", "submittedBy", "lectureCompliance.lectureScheduleId"],
  coordinator: ["curriculumId", "preparedBy"],
  examiner: ["lecturerId", "facultyId", "departmentId", "courseId", "statusHistory.changedBy"],
  supervisor: ["facultyId", "departmentId", "submittedBy"],
  "weekly-effectiveness": ["curriculumId", "courseId", "preparedBy", "weeklyEntries.weekId"],
};

export async function loadPopulatedReport(type: ReportKey, id: string): Promise<Record<string, unknown> | null> {
  const model = REPORT_MODEL_MAP[type] as QueryModel;
  let query: QueryHandle = model.findById(id);

  if (type === "lms-rep") {
    query = query
      .populate({
        path: "courseId",
        populate: {
          path: "curriculumId",
          populate: {
            path: "departmentId",
            populate: {
              path: "facultyId",
            },
          },
        },
      })
      .populate("submittedBy")
      .populate("lectureCompliance.lectureScheduleId");
  } else {
    for (const path of REPORT_POPULATE_MAP[type] ?? []) query = query.populate(path);
  }

  const report = await query.lean();
  if (!report) return null;

  if (type === "lms-rep") {
    const reportObj = report as Record<string, unknown>;
    const courseId = reportObj.courseId as Record<string, unknown> | undefined;
    const curriculumId = courseId?.curriculumId as Record<string, unknown> | undefined;
    const departmentId = curriculumId?.departmentId as Record<string, unknown> | undefined;
    const facultyId = departmentId?.facultyId as Record<string, unknown> | undefined;

    reportObj.departmentId = departmentId;
    reportObj.facultyId = facultyId;
  }

  return report;
}
