import { connectDB } from "@/lib/db/connectDB";
import Course from "@/models/Course";
import Curriculum from "@/models/Curriculum";
import Department from "@/models/Department";
import ExaminerReport from "@/models/ExaminerReport";
import Faculty from "@/models/Faculty";
import Report from "@/models/Report";
import Student from "@/models/Student";
import TeachingAssignment from "@/models/TeachingAssignment";
import User from "@/models/User";

type DocumentWithOptionalId = { _id?: unknown; [key: string]: unknown };

export interface FacultyItem {
  id: string;
  name: string;
  code?: string;
  dean?: string;
  description?: string;
  departments: string[];
  [key: string]: unknown;
}

export type ExaminerReportStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "REVISION_REQUESTED"
  | "APPROVED"
  | "REJECTED";

export interface StatusHistoryEntry {
  status: ExaminerReportStatus;
  changedBy?: string;
  comment?: string;
  changedAt?: string | Date;
}

export interface ExaminerReportItem {
  id: string;
  lecturerId?: string;
  lecturerName?: string;
  externalExaminerName?: string;
  /** @deprecated derived from lecturerName / externalExaminerName for display convenience */
  examinerName: string;
  facultyId: string;
  departmentId?: string;
  courseId?: string;
  academicSession?: string;
  semester?: "FIRST" | "SECOND";
  examType?: "CA" | "EXAM" | "MAKEUP" | "RESIT";
  questionPaperUrl?: string;
  markingSchemeUrl?: string;
  numberOfQuestions?: number;
  status?: ExaminerReportStatus;
  statusHistory?: StatusHistoryEntry[];
  moderatorId?: string;
  moderatorName?: string;
  moderatorComments?: string;
  moderatorScore?: number;
  malpracticeFlagged?: boolean;
  complianceNotes?: string;
  comments?: string;
  score?: number;
  attachmentUrl?: string;
  submittedAt?: string | Date;
  reviewedAt?: string | Date;
  [key: string]: unknown;
}

export interface TeachingAssignmentItem {
  id: string;
  courseId: string;
  lecturerId: string;
  lecturerName?: string;
  academicSession: string;
  semester: "FIRST" | "SECOND";
  [key: string]: unknown;
}

function toObjectIdString(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "toString" in value) return String(value);
  return "";
}

function extractPopulatedRef(value: unknown): { id: string; name?: string } {
  if (!value) return { id: "" };
  if (typeof value === "string") return { id: value };
  if (typeof value === "object" && value !== null) {
    const populated = value as { _id?: unknown; name?: unknown };
    if (populated._id) {
      return {
        id: toObjectIdString(populated._id),
        name: typeof populated.name === "string" ? populated.name : undefined,
      };
    }
    return { id: toObjectIdString(value) };
  }
  return { id: "" };
}

export async function getFacultiesWithDepartments() {
  try {
    await connectDB();
    const faculties = await Faculty.find({}).lean();
    const departments = await Department.find({}).lean();

    return {
      faculties: faculties.map((faculty: DocumentWithOptionalId) => ({
        ...faculty,
        id: toObjectIdString(faculty._id),
        departments: departments
          .filter((department: DocumentWithOptionalId) => toObjectIdString(department.facultyId) === toObjectIdString(faculty._id))
          .map((department: DocumentWithOptionalId) => String(department.name ?? "")),
      })) as FacultyItem[],
      departments,
    };
  } catch {
    return { faculties: [], departments: [] };
  }
}

export async function getFaculties(): Promise<FacultyItem[]> {
  try {
    await connectDB();
    const faculties = await Faculty.find({}).lean();
    return faculties.map((faculty: DocumentWithOptionalId) => ({
      ...faculty,
      id: toObjectIdString(faculty._id),
    })) as FacultyItem[];
  } catch {
    return [];
  }
}

export async function getExaminerReports(filter: Record<string, unknown> = {}): Promise<ExaminerReportItem[]> {
  try {
    await connectDB();
    const reports = await ExaminerReport.find(filter)
      .populate("lecturerId", "name email")
      .populate("moderatorId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return reports.map((report: DocumentWithOptionalId) => {
      const lecturer = extractPopulatedRef(report.lecturerId);
      const moderator = extractPopulatedRef(report.moderatorId);
      const externalExaminerName = typeof report.externalExaminerName === "string" ? report.externalExaminerName : undefined;

      return {
        ...report,
        id: toObjectIdString(report._id),
        lecturerId: lecturer.id,
        lecturerName: lecturer.name,
        externalExaminerName,
        examinerName: lecturer.name ?? externalExaminerName ?? "Unknown examiner",
        facultyId: toObjectIdString(report.facultyId),
        departmentId: toObjectIdString(report.departmentId),
        courseId: toObjectIdString(report.courseId),
        moderatorId: moderator.id || undefined,
        moderatorName: moderator.name,
      } as ExaminerReportItem;
    });
  } catch {
    return [];
  }
}

export async function getExaminerReportById(id: string) {
  try {
    await connectDB();
    const report = await ExaminerReport.findById(id)
      .populate("lecturerId", "name email")
      .populate("moderatorId", "name email")
      .lean();

    if (!report) return null;

    const lecturer = extractPopulatedRef((report as DocumentWithOptionalId).lecturerId);
    const moderator = extractPopulatedRef((report as DocumentWithOptionalId).moderatorId);
    const externalExaminerName =
      typeof (report as DocumentWithOptionalId).externalExaminerName === "string"
        ? ((report as DocumentWithOptionalId).externalExaminerName as string)
        : undefined;

    return {
      ...report,
      id: toObjectIdString((report as DocumentWithOptionalId)._id),
      lecturerId: lecturer.id,
      lecturerName: lecturer.name,
      externalExaminerName,
      examinerName: lecturer.name ?? externalExaminerName ?? "Unknown examiner",
      facultyId: toObjectIdString((report as DocumentWithOptionalId).facultyId),
      departmentId: toObjectIdString((report as DocumentWithOptionalId).departmentId),
      courseId: toObjectIdString((report as DocumentWithOptionalId).courseId),
      moderatorId: moderator.id || undefined,
      moderatorName: moderator.name,
    } as ExaminerReportItem;
  } catch {
    return null;
  }
}

export async function getLecturers(): Promise<UserItem[]> {
  try {
    await connectDB();
    const users = await User.find({ role: { $in: ["EXAMINER", "ADMIN", "FACULTY_OFFICER"] }, isActive: true }).lean();
    return users.map((user: DocumentWithOptionalId) => ({ ...user, id: toObjectIdString(user._id) })) as UserItem[];
  } catch {
    return [];
  }
}

export async function getTeachingAssignments(filter: Record<string, unknown> = {}): Promise<TeachingAssignmentItem[]> {
  try {
    await connectDB();
    const assignments = await TeachingAssignment.find(filter).populate("lecturerId", "name email").sort({ createdAt: -1 }).lean();
    return assignments.map((assignment: DocumentWithOptionalId) => {
      const lecturer = extractPopulatedRef(assignment.lecturerId);
      return {
        ...assignment,
        id: toObjectIdString(assignment._id),
        courseId: toObjectIdString(assignment.courseId),
        lecturerId: lecturer.id,
        lecturerName: lecturer.name,
      } as TeachingAssignmentItem;
    });
  } catch {
    return [];
  }
}

export async function getTeachingAssignmentById(id: string) {
  try {
    await connectDB();
    const assignment = await TeachingAssignment.findById(id).lean();
    return assignment ? { ...assignment, id: toObjectIdString((assignment as DocumentWithOptionalId)._id) } : null;
  } catch {
    return null;
  }
}

export interface ComplianceDepartmentSummary {
  departmentId: string;
  departmentName: string;
  facultyId: string;
  facultyName: string;
  totalAssigned: number;
  totalSubmitted: number;
  flagged: number;
}

export interface OutstandingAssignment {
  assignmentId: string;
  lecturerId: string;
  lecturerName: string;
  courseId: string;
  courseName: string;
  departmentId: string;
  departmentName: string;
  facultyId: string;
  facultyName: string;
  academicSession: string;
  semester: "FIRST" | "SECOND";
}

const SUBMITTED_OR_LATER: ExaminerReportStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "REVISION_REQUESTED",
  "APPROVED",
  "REJECTED",
];

/**
 * Diffs TeachingAssignment (who is expected to submit) against ExaminerReport
 * (who actually submitted) for a given academic session/semester, producing
 * the per-department compliance numbers and the list of outstanding lecturers
 * a director can act on.
 */
export async function getExaminerReportCompliance(academicSession: string, semester?: "FIRST" | "SECOND") {
  try {
    await connectDB();

    const assignmentFilter: Record<string, unknown> = { academicSession };
    if (semester) assignmentFilter.semester = semester;

    const [assignments, courses, curriculums, departments, faculties, reports] = await Promise.all([
      TeachingAssignment.find(assignmentFilter).populate("lecturerId", "name email").lean(),
      Course.find({}).lean(),
      Curriculum.find({}).lean(),
      Department.find({}).lean(),
      Faculty.find({}).lean(),
      ExaminerReport.find({
        academicSession,
        ...(semester ? { semester } : {}),
        status: { $in: SUBMITTED_OR_LATER },
      }).lean(),
    ]);

    const courseMap = new Map(courses.map((course: DocumentWithOptionalId) => [toObjectIdString(course._id), course]));
    const curriculumMap = new Map(
      curriculums.map((curriculum: DocumentWithOptionalId) => [toObjectIdString(curriculum._id), curriculum])
    );
    const departmentMap = new Map(
      departments.map((department: DocumentWithOptionalId) => [toObjectIdString(department._id), department])
    );
    const facultyMap = new Map(faculties.map((faculty: DocumentWithOptionalId) => [toObjectIdString(faculty._id), faculty]));

    const submittedKeys = new Set(
      reports.map((report: DocumentWithOptionalId) =>
        [toObjectIdString(report.courseId), toObjectIdString(report.lecturerId), report.academicSession, report.semester].join("|")
      )
    );
    const flaggedKeys = new Set(
      reports
        .filter((report: DocumentWithOptionalId) => report.malpracticeFlagged)
        .map((report: DocumentWithOptionalId) =>
          [toObjectIdString(report.courseId), toObjectIdString(report.lecturerId), report.academicSession, report.semester].join("|")
        )
    );

    const departmentSummaries = new Map<string, ComplianceDepartmentSummary>();
    const outstanding: OutstandingAssignment[] = [];

    for (const assignment of assignments as DocumentWithOptionalId[]) {
      const courseId = toObjectIdString(assignment.courseId);
      const lecturer = extractPopulatedRef(assignment.lecturerId);
      const course = courseMap.get(courseId);
      const curriculumId = course ? toObjectIdString(course.curriculumId) : "";
      const curriculum = curriculumMap.get(curriculumId);
      const departmentId = curriculum ? toObjectIdString(curriculum.departmentId) : "";
      const department = departmentMap.get(departmentId);
      const facultyId = department ? toObjectIdString(department.facultyId) : "";
      const faculty = facultyMap.get(facultyId);

      const key = [courseId, lecturer.id, assignment.academicSession, assignment.semester].join("|");
      const isSubmitted = submittedKeys.has(key);
      const isFlagged = flaggedKeys.has(key);

      const summaryKey = departmentId || "unassigned";
      const summary = departmentSummaries.get(summaryKey) ?? {
        departmentId,
        departmentName: department ? String(department.name ?? "Department") : "Unassigned",
        facultyId,
        facultyName: faculty ? String(faculty.name ?? "Faculty") : "Unassigned",
        totalAssigned: 0,
        totalSubmitted: 0,
        flagged: 0,
      };

      summary.totalAssigned += 1;
      if (isSubmitted) summary.totalSubmitted += 1;
      if (isFlagged) summary.flagged += 1;
      departmentSummaries.set(summaryKey, summary);

      if (!isSubmitted) {
        outstanding.push({
          assignmentId: toObjectIdString(assignment._id),
          lecturerId: lecturer.id,
          lecturerName: lecturer.name ?? "Unknown lecturer",
          courseId,
          courseName: course ? `${String(course.title ?? "")} (${String(course.code ?? "")})` : "Unknown course",
          departmentId,
          departmentName: department ? String(department.name ?? "Department") : "Unassigned",
          facultyId,
          facultyName: faculty ? String(faculty.name ?? "Faculty") : "Unassigned",
          academicSession: String(assignment.academicSession ?? academicSession),
          semester: (assignment.semester as "FIRST" | "SECOND") ?? "FIRST",
        });
      }
    }

    return {
      academicSession,
      semester: semester ?? null,
      departments: Array.from(departmentSummaries.values()),
      outstanding,
    };
  } catch {
    return { academicSession, semester: semester ?? null, departments: [], outstanding: [] };
  }
}

export async function getCurriculumsByFacultyId(facultyId: string): Promise<CurriculumItem[]> {
  try {
    await connectDB();
    const departments = await Department.find({ facultyId }).lean();
    const departmentIds = departments.map((department: DocumentWithOptionalId) => department._id).filter(Boolean);
    const curriculums = await Curriculum.find({ departmentId: { $in: departmentIds } }).lean();
    return curriculums.map((curriculum: DocumentWithOptionalId) => ({
      ...curriculum,
      id: toObjectIdString(curriculum._id),
    })) as CurriculumItem[];
  } catch {
    return [];
  }
}

export async function getFacultyById(id: string) {
  try {
    await connectDB();
    const faculty = await Faculty.findById(id).lean();
    return faculty ? { ...faculty, id: toObjectIdString(faculty._id) } : null;
  } catch {
    return null;
  }
}

export interface DepartmentItem {
  id: string;
  name: string;
  facultyId?: string;
  hod?: string;
  [key: string]: unknown;
}

export interface CurriculumItem {
  id: string;
  departmentId: string;
  programName: string;
  level: string;
  version: string;
  documentUrl: string;
  [key: string]: unknown;
}

export interface CurriculumWithDepartment extends CurriculumItem {
  department: DepartmentItem | null;
}

export interface CourseItem {
  id: string;
  title: string;
  code: string;
  units: number;
  semester: "FIRST" | "SECOND";
  curriculumId?: string;
  departmentId?: string;
  [key: string]: unknown;
}

export interface StudentItem {
  id: string;
  fullName: string;
  matricNumber: string;
  email?: string;
  programLevel?: string;
  [key: string]: unknown;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  facultyId?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface ReportWithStudent {
  id: string;
  studentName: string;
  status: string;
  notes?: string;
  [key: string]: unknown;
}

export async function getDepartmentsByFacultyId(facultyId: string): Promise<DepartmentItem[]> {
  try {
    await connectDB();
    const departments = await Department.find({ facultyId }).lean();
    return departments.map((department: DocumentWithOptionalId) => ({ ...department, id: toObjectIdString(department._id) })) as DepartmentItem[];
  } catch {
    return [];
  }
}

export async function getDepartments(): Promise<DepartmentItem[]> {
  try {
    await connectDB();
    const departments = await Department.find({}).lean();
    return departments.map((department: DocumentWithOptionalId) => ({ ...department, id: toObjectIdString(department._id) })) as DepartmentItem[];
  } catch {
    return [];
  }
}

export async function getDepartmentById(id: string) {
  try {
    await connectDB();
    const department = await Department.findById(id).lean();
    return department ? { ...department, id: toObjectIdString(department._id) } : null;
  } catch {
    return null;
  }
}

export async function getCourses(): Promise<CourseItem[]> {
  try {
    await connectDB();
    const courses = await Course.find({}).lean();
    return courses.map((course: DocumentWithOptionalId) => ({ ...course, id: toObjectIdString(course._id) })) as CourseItem[];
  } catch {
    return [];
  }
}

export async function getCurriculumsWithDepartment(): Promise<CurriculumWithDepartment[]> {
  try {
    await connectDB();
    const curriculums = await Curriculum.find({}).lean();
    const departments = await Department.find({}).lean();

    return curriculums.map((curriculum: DocumentWithOptionalId) => ({
      ...(curriculum as CurriculumItem),
      id: toObjectIdString(curriculum._id),
      department: departments.find((department: DocumentWithOptionalId) => toObjectIdString(department._id) === toObjectIdString(curriculum.departmentId)) ?? null,
    })) as CurriculumWithDepartment[];
  } catch {
    return [];
  }
}

export async function getCurriculumById(id: string) {
  try {
    await connectDB();
    const curriculum = await Curriculum.findById(id).lean();
    return curriculum ? { ...curriculum, id: toObjectIdString(curriculum._id) } : null;
  } catch {
    return null;
  }
}

export async function getCoursesByCurriculum(curriculumId: string): Promise<CourseItem[]> {
  try {
    await connectDB();
    const courses = await Course.find({ curriculumId }).lean();
    return courses.map((course: DocumentWithOptionalId) => ({ ...course, id: toObjectIdString(course._id) } as CourseItem));
  } catch {
    return [];
  }
}

export async function getStudents(): Promise<StudentItem[]> {
  try {
    await connectDB();
    const students = await Student.find({}).lean();
    return students.map((student: DocumentWithOptionalId) => ({ ...student, id: toObjectIdString(student._id) })) as StudentItem[];
  } catch {
    return [];
  }
}

export async function getReportsWithStudents(): Promise<ReportWithStudent[]> {
  try {
    await connectDB();
    const reports = await Report.find({}).lean();
    const students = await Student.find({}).lean();

    return reports.map((report: DocumentWithOptionalId) => {
      const student = students.find((candidate: DocumentWithOptionalId) => toObjectIdString(candidate._id) === toObjectIdString(report.studentId));
      return {
        ...report,
        id: toObjectIdString(report._id),
        studentName: student?.fullName ?? "Student",
        status: String(report.status ?? "DRAFT"),
        notes: report.notes ? String(report.notes) : "",
      } as ReportWithStudent;
    }) as ReportWithStudent[];
  } catch {
    return [];
  }
}

export async function getReportById(id: string) {
  try {
    await connectDB();
    const report = await Report.findById(id).lean();
    return report ? { ...report, id: toObjectIdString(report._id) } : null;
  } catch {
    return null;
  }
}

export async function getStudentById(id: string) {
  try {
    await connectDB();
    const student = await Student.findById(id).lean();
    return student ? { ...student, id: toObjectIdString(student._id) } : null;
  } catch {
    return null;
  }
}

export async function getUserById(id: string) {
  try {
    await connectDB();
    const user = await User.findById(id).lean();
    return user ? { ...user, id: toObjectIdString(user._id) } : null;
  } catch {
    return null;
  }
}

export async function getUsers(): Promise<UserItem[]> {
  try {
    await connectDB();
    const users = await User.find({}).lean();
    return users.map((user: DocumentWithOptionalId) => ({ ...user, id: toObjectIdString(user._id) })) as UserItem[];
  } catch {
    return [];
  }
}

export async function getDashboardSummary() {
  try {
    await connectDB();
    const [faculties, curriculums, students, reports] = await Promise.all([
      Faculty.countDocuments(),
      Curriculum.countDocuments(),
      Student.countDocuments(),
      Report.countDocuments({ status: "SUBMITTED" }),
    ]);

    return { faculties, curriculums, students, submittedReports: reports };
  } catch {
    return { faculties: 0, curriculums: 0, students: 0, submittedReports: 0 };
  }
}
