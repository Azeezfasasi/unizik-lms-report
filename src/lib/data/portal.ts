import { connectDB } from "@/lib/db/connectDB";
import AcademicSession from "@/models/AcademicSession";
import Course from "@/models/Course";
import CourseRepReport from "@/models/CourseRepReport";
import CoordinatorReport from "@/models/CoordinatorReport";
import Curriculum from "@/models/Curriculum";
import Department from "@/models/Department";
import ExaminerReport from "@/models/ExaminerReport";
import Faculty from "@/models/Faculty";
import StudentReport from "@/models/StudentReport";
import Student from "@/models/Student";
import SupervisorReport from "@/models/SupervisorReport";
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

export interface LmsRepReportItem {
  id: string;
  courseId: string;
  courseTitle?: string;
  courseCode?: string;
  submittedById?: string;
  submittedByName?: string;
  academicSession?: string;
  semester?: "FIRST" | "SECOND";
  totalLecturesScheduled?: number;
  totalLecturesHeld?: number;
  issues?: string;
  status?: string;
  submittedAt?: string | Date;
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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

export async function getLmsRepReports(): Promise<LmsRepReportItem[]> {
  try {
    await connectDB();
    const reports = await CourseRepReport.find({})
      .populate("courseId", "title code")
      .populate("submittedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    return reports.map((report: DocumentWithOptionalId) => {
      const course = report.courseId && typeof report.courseId === "object" ? (report.courseId as DocumentWithOptionalId) : null;
      const submittedBy = extractPopulatedRef((report as DocumentWithOptionalId).submittedBy);

      return {
        ...report,
        id: toObjectIdString((report as DocumentWithOptionalId)._id),
        courseId: toObjectIdString((report as DocumentWithOptionalId).courseId),
        courseTitle: typeof course?.title === "string" ? course.title : undefined,
        courseCode: typeof course?.code === "string" ? course.code : undefined,
        submittedById: submittedBy.id,
        submittedByName: submittedBy.name,
      } as LmsRepReportItem;
    });
  } catch {
    return [];
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
  status?: "ACTIVE" | "SUSPENDED" | "GRADUATED";
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

export async function getAcademicSessions(): Promise<{ id: string; name: string; isCurrent: boolean }[]> {
  try {
    await connectDB();
    const sessions = await AcademicSession.find({}).sort({ name: -1 }).lean();
    return sessions.map((session: DocumentWithOptionalId & { name: string; isCurrent?: boolean }) => ({
      id: toObjectIdString(session._id),
      name: session.name,
      isCurrent: Boolean(session.isCurrent),
    }));
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

export async function getReportsWithStudents(studentEmail?: string): Promise<ReportWithStudent[]> {
  try {
    await connectDB();

    const filter: Record<string, unknown> = {};
    if (studentEmail) {
      const regex = new RegExp(`^${escapeRegExp(studentEmail)}$`, "i");
      const student = await Student.findOne({ email: regex }).lean();
      if (!student) return [];
      filter.studentId = student._id;
    }

    const reports = await StudentReport.find(filter).lean();
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

export async function getReportsForStudentEmail(studentEmail?: string): Promise<{
  reports: ReportWithStudent[];
  studentCount: number;
  matchedStudentId?: string | null;
}> {
  try {
    await connectDB();

    if (!studentEmail) {
      const reports = await getReportsWithStudents();
      return { reports, studentCount: -1, matchedStudentId: null };
    }

    const regex = new RegExp(`^${escapeRegExp(studentEmail)}$`, "i");
    const matchedStudents = await Student.find({ email: regex }).lean();

    if (matchedStudents.length !== 1) {
      return { reports: [], studentCount: matchedStudents.length, matchedStudentId: matchedStudents[0]?._id ? toObjectIdString(matchedStudents[0]._id) : null };
    }

    const student = matchedStudents[0];
    const reports = await StudentReport.find({ studentId: student._id }).lean();

    const mapped = reports.map((report: DocumentWithOptionalId) => ({
      ...report,
      id: toObjectIdString(report._id),
      studentName: String(student.fullName ?? "Student"),
      status: String(report.status ?? "DRAFT"),
      notes: report.notes ? String(report.notes) : "",
    })) as ReportWithStudent[];

    return { reports: mapped, studentCount: 1, matchedStudentId: toObjectIdString(student._id) };
  } catch {
    return { reports: [], studentCount: 0, matchedStudentId: null };
  }
}

export async function getReportById(id: string) {
  try {
    await connectDB();
    const report = await StudentReport.findById(id).lean();
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

export async function getUserById(id: string): Promise<UserItem | null> {
  try {
    await connectDB();
    const user = await User.findById(id).lean();
    return user ? { ...(user as DocumentWithOptionalId), id: toObjectIdString((user as DocumentWithOptionalId)._id) } as UserItem : null;
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

export interface DashboardBreakdownSlice {
  label: string;
  value: number;
}

export async function getDashboardSummary() {
  try {
    await connectDB();
    const [
      faculties,
      curriculums,
      students,
      reports,
      studentReportCount,
      examinerReportCount,
      supervisorReportCount,
      lmsRepReportCount,
      coordinatorReportCount,
      usersByRole,
      studentsByFaculty,
    ] = await Promise.all([
      Faculty.countDocuments(),
      Curriculum.countDocuments(),
      Student.countDocuments(),
      StudentReport.countDocuments({ status: "SUBMITTED" }),
      StudentReport.countDocuments(),
      ExaminerReport.countDocuments(),
      SupervisorReport.countDocuments(),
      CourseRepReport.countDocuments(),
      CoordinatorReport.countDocuments(),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Student.aggregate([
        { $group: { _id: "$facultyId", count: { $sum: 1 } } },
        { $lookup: { from: "faculties", localField: "_id", foreignField: "_id", as: "faculty" } },
      ]),
    ]);

    const reportsByType: DashboardBreakdownSlice[] = [
      { label: "Student", value: studentReportCount },
      { label: "Examiner", value: examinerReportCount },
      { label: "Supervisor", value: supervisorReportCount },
      { label: "LMS Rep", value: lmsRepReportCount },
      { label: "Coordinator", value: coordinatorReportCount },
    ].filter((slice) => slice.value > 0);

    const roleOrder = [
      "ADMIN",
      "PG_COORDINATOR",
      "LMS_REP",
      "FACULTY_OFFICER",
      "EXAMINER",
      "SUPERVISOR",
      "DIRECTOR",
      "STUDENT",
    ];
    const roleLabels: Record<string, string> = {
      ADMIN: "Admin",
      FACULTY_OFFICER: "Faculty Officer",
      EXAMINER: "Examiner",
      STUDENT: "Student",
      LMS_REP: "LMS Rep",
      PG_COORDINATOR: "PG Coordinator",
      SUPERVISOR: "Supervisor",
      DIRECTOR: "Director",
    };

    const roleCounts = new Map((usersByRole as { _id: string; count: number }[]).map((entry) => [entry._id, entry.count]));
    const usersByRoleData: DashboardBreakdownSlice[] = roleOrder
      .filter((role) => roleCounts.has(role))
      .map((role) => ({ label: roleLabels[role] ?? role, value: roleCounts.get(role) ?? 0 }));

    const FACULTY_SLICE_CAP = 6;
    const facultyCounts = (
      studentsByFaculty as { _id: unknown; count: number; faculty: { name?: string }[] }[]
    )
      .map((entry) => ({ label: entry.faculty[0]?.name ?? "Unassigned", value: entry.count }))
      .sort((a, b) => b.value - a.value);

    const studentsByFacultyData: DashboardBreakdownSlice[] =
      facultyCounts.length > FACULTY_SLICE_CAP
        ? [
            ...facultyCounts.slice(0, FACULTY_SLICE_CAP),
            {
              label: "Other",
              value: facultyCounts.slice(FACULTY_SLICE_CAP).reduce((sum, entry) => sum + entry.value, 0),
            },
          ]
        : facultyCounts;

    return {
      faculties,
      curriculums,
      students,
      submittedReports: reports,
      reportsByType,
      usersByRole: usersByRoleData,
      studentsByFaculty: studentsByFacultyData,
    };
  } catch {
    return {
      faculties: 0,
      curriculums: 0,
      students: 0,
      submittedReports: 0,
      reportsByType: [] as DashboardBreakdownSlice[],
      usersByRole: [] as DashboardBreakdownSlice[],
      studentsByFaculty: [] as DashboardBreakdownSlice[],
    };
  }
}

function buildAcademicSessionFilter(academicSession?: string): string[] | undefined {
  if (!academicSession) return undefined;
  const trimmed = academicSession.trim();
  if (!trimmed) return undefined;

  const sessions = new Set<string>();
  sessions.add(trimmed);

  const rangeMatch = trimmed.match(/^(\d{4})[\/-](\d{4})$/);
  if (rangeMatch) {
    const [, startYear, endYear] = rangeMatch;
    sessions.add(startYear);
    sessions.add(endYear);
    sessions.add(`${startYear}/${endYear}`);
  } else if (/^\d{4}$/.test(trimmed)) {
    const year = Number(trimmed);
    sessions.add(`${year}/${year + 1}`);
    if (year > 1900) {
      sessions.add(`${year - 1}/${year}`);
    }
  }

  return Array.from(sessions);
}

export async function getDirectorSummary(academicSession?: string, semester?: "FIRST" | "SECOND") {
  try {
    await connectDB();

    const academicSessionFilter = buildAcademicSessionFilter(academicSession);
    const lmsFilter: Record<string, unknown> = {};
    const coordinatorFilter: Record<string, unknown> = {};
    const supervisorFilter: Record<string, unknown> = {};
    const examinerFilter: Record<string, unknown> = {};
    const studentFilter: Record<string, unknown> = {};

    if (academicSessionFilter) {
      lmsFilter.academicSession = { $in: academicSessionFilter };
      coordinatorFilter.academicSession = { $in: academicSessionFilter };
      supervisorFilter.academicSession = { $in: academicSessionFilter };
      examinerFilter.academicSession = { $in: academicSessionFilter };
      studentFilter.academicSession = { $in: academicSessionFilter };
    }
    if (semester) {
      lmsFilter.semester = semester;
      coordinatorFilter.semester = semester;
      supervisorFilter.semester = semester;
      examinerFilter.semester = semester;
      studentFilter.semester = semester;
    }

    const [studentSummary, lmsReports, coordinatorSummary, supervisorSummary, examinerSummary] = await Promise.all([
      StudentReport.aggregate([
        { $match: studentFilter },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            avgTeachingQuality: { $avg: "$teachingQuality" },
            avgExamPreparedness: { $avg: "$examPreparedness" },
            avgCourseMaterialsRating: { $avg: "$courseMaterialsRating" },
          },
        },
      ]),
      CourseRepReport.find(lmsFilter).lean(),
      CoordinatorReport.aggregate([
        { $match: coordinatorFilter },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            avgLectureComplianceRate: { $avg: "$lectureComplianceRate" },
            avgLecturerResponseRate: { $avg: "$lecturerResponseRate" },
            avgLecturerTrainingRating: { $avg: "$lecturerTrainingRating" },
            misconductCount: {
              $sum: {
                $cond: [{ $in: ["$misconductSeverity", ["MINOR", "SERIOUS"]] }, 1, 0],
              },
            },
          },
        },
      ]),
      SupervisorReport.aggregate([
        { $match: supervisorFilter },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ]),
      ExaminerReport.aggregate([
        { $match: examinerFilter },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const studentData = studentSummary[0] ?? {
      count: 0,
      avgTeachingQuality: 0,
      avgExamPreparedness: 0,
      avgCourseMaterialsRating: 0,
    };

    const supervisorData = supervisorSummary[0] ?? {
      count: 0,
    };
    const examinerData = examinerSummary[0] ?? { count: 0 };

    const totalScheduled = lmsReports.reduce(
      (sum: number, report: { totalLecturesScheduled?: number }) => sum + Number(report.totalLecturesScheduled ?? 0),
      0
    );
    const totalHeld = lmsReports.reduce(
      (sum: number, report: { totalLecturesHeld?: number }) => sum + Number(report.totalLecturesHeld ?? 0),
      0
    );
    const avgLectureComplianceRate = totalScheduled > 0 ? Math.round((totalHeld / totalScheduled) * 100) : 0;
    const portalReadinessReadyCount = lmsReports.filter(
      (report: { portalReadinessForQuizAndExam?: string }) => report.portalReadinessForQuizAndExam === "READY"
    ).length;

    const coordinatorData = coordinatorSummary[0] ?? {
      count: 0,
      avgLectureComplianceRate: 0,
      avgLecturerResponseRate: 0,
      avgLecturerTrainingRating: 0,
      misconductCount: 0,
    };

    return {
      academicSession: academicSession ?? "",
      semester: semester ?? undefined,
      studentReportCount: studentData.count,
      avgTeachingQuality: Math.round(studentData.avgTeachingQuality ?? 0),
      avgExamPreparedness: Math.round(studentData.avgExamPreparedness ?? 0),
      avgCourseMaterialsRating: Math.round(studentData.avgCourseMaterialsRating ?? 0),
      lmsReportCount: lmsReports.length,
      avgLectureComplianceRate,
      avgLecturerTrainingRating: Math.round(coordinatorData.avgLecturerTrainingRating ?? 0),
      portalReadinessReadyCount,
      coordinatorReportCount: coordinatorData.count,
      avgCoordinatorLectureComplianceRate: Math.round(coordinatorData.avgLectureComplianceRate ?? 0),
      avgLecturerResponseRate: Math.round(coordinatorData.avgLecturerResponseRate ?? 0),
      coordinatorMisconductCount: coordinatorData.misconductCount,
      supervisorReportCount: supervisorData.count,
      examinerReportCount: examinerData.count,
    };
  } catch {
    return {
      academicSession: academicSession ?? "",
      semester: semester ?? undefined,
      studentReportCount: 0,
      avgTeachingQuality: 0,
      avgExamPreparedness: 0,
      avgCourseMaterialsRating: 0,
      lmsReportCount: 0,
      avgLectureComplianceRate: 0,
      portalReadinessReadyCount: 0,
      coordinatorReportCount: 0,
      avgCoordinatorLectureComplianceRate: 0,
      avgLecturerResponseRate: 0,
      coordinatorMisconductCount: 0,
      supervisorReportCount: 0,
      examinerReportCount: 0,
    };
  }
}

export async function getAssociateProvostSummary(field: "HEALTH" | "SCIENCES" | "HUMANITIES", academicSession?: string) {
  await connectDB();
  const faculties = await Faculty.find({ associateProvostField: field }).select("_id name").lean();
  const facultyIds = faculties.map((item) => item._id);
  const departments = await Department.find({ facultyId: { $in: facultyIds } }).select("_id facultyId name").lean();
  const departmentIds = departments.map((item) => item._id);
  const curriculums = await Curriculum.find({ departmentId: { $in: departmentIds } }).select("_id").lean();
  const curriculumIds = curriculums.map((item) => item._id);
  const courses = await Course.find({ curriculumId: { $in: curriculumIds } }).select("_id").lean();
  const courseIds = courses.map((item) => item._id);
  const sessionFilter = academicSession ? { academicSession } : {};

  const [student, lms, coordinator, supervisor, examiner] = await Promise.all([
    StudentReport.find({ ...sessionFilter, facultyId: { $in: facultyIds } }).select("status").lean(),
    CourseRepReport.find({ ...sessionFilter, courseId: { $in: courseIds } }).select("status").lean(),
    CoordinatorReport.find({ ...sessionFilter, departmentId: { $in: departmentIds } }).select("status").lean(),
    SupervisorReport.find({ ...sessionFilter, facultyId: { $in: facultyIds } }).select("status").lean(),
    ExaminerReport.find({ ...sessionFilter, facultyId: { $in: facultyIds } }).select("status").lean(),
  ]);

  const reports = [student, lms, coordinator, supervisor, examiner].flat();
  const statusCounts = reports.reduce<Record<string, number>>((counts, report: { status?: string }) => {
    const status = report.status ?? "SUBMITTED";
    counts[status] = (counts[status] ?? 0) + 1;
    return counts;
  }, {});

  return {
    field,
    academicSession: academicSession ?? "All sessions",
    faculties: faculties.map((faculty) => ({ id: String(faculty._id), name: faculty.name })),
    departmentCount: departments.length,
    totalReports: reports.length,
    statusCounts,
  };
}
