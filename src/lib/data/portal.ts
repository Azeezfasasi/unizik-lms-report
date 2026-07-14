import { connectDB } from "@/lib/db/connectDB";
import Course from "@/models/Course";
import Curriculum from "@/models/Curriculum";
import Department from "@/models/Department";
import ExaminerReport from "@/models/ExaminerReport";
import Faculty from "@/models/Faculty";
import Report from "@/models/Report";
import Student from "@/models/Student";
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

export interface ExaminerReportItem {
  id: string;
  examinerName: string;
  facultyId: string;
  departmentId?: string;
  courseId?: string;
  comments?: string;
  score?: number;
  attachmentUrl?: string;
  submittedAt?: string | Date;
  [key: string]: unknown;
}

function toObjectIdString(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "toString" in value) return String(value);
  return "";
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

export async function getExaminerReports(): Promise<ExaminerReportItem[]> {
  try {
    await connectDB();
    const reports = await ExaminerReport.find({}).lean();
    return reports.map((report: DocumentWithOptionalId) => ({
      ...report,
      id: toObjectIdString(report._id),
    })) as ExaminerReportItem[];
  } catch {
    return [];
  }
}

export async function getExaminerReportById(id: string) {
  try {
    await connectDB();
    const report = await ExaminerReport.findById(id).lean();
    return report ? { ...report, id: toObjectIdString(report._id) } : null;
  } catch {
    return null;
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
