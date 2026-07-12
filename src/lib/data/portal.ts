import { connectDB } from "@/lib/db/connectDB";
import Course from "@/models/Course";
import Curriculum from "@/models/Curriculum";
import Department from "@/models/Department";
import ExaminerReport from "@/models/ExaminerReport";
import Faculty from "@/models/Faculty";
import Report from "@/models/Report";
import Student from "@/models/Student";
import User from "@/models/User";

function toObjectIdString(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "toString" in value) return String(value);
  return "";
}

export async function getFacultiesWithDepartments() {
  try {
    await connectDB();
    const faculties = await Faculty.find({}).lean();
    const departments = await Department.find({}).lean();

    return {
      faculties: faculties.map((faculty: any) => ({
        ...faculty,
        id: toObjectIdString(faculty._id),
        departments: departments
          .filter((department: any) => toObjectIdString(department.facultyId) === toObjectIdString(faculty._id))
          .map((department: any) => department.name),
      })),
      departments,
    };
  } catch {
    return { faculties: [], departments: [] };
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

export async function getDepartmentById(id: string) {
  try {
    await connectDB();
    const department = await Department.findById(id).lean();
    return department ? { ...department, id: toObjectIdString(department._id) } : null;
  } catch {
    return null;
  }
}

export async function getCurriculumsWithDepartment() {
  try {
    await connectDB();
    const curriculums = await Curriculum.find({}).lean();
    const departments = await Department.find({}).lean();

    return curriculums.map((curriculum: any) => ({
      ...curriculum,
      id: toObjectIdString(curriculum._id),
      department: departments.find((department: any) => toObjectIdString(department._id) === toObjectIdString(curriculum.departmentId)) ?? null,
    }));
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

export async function getCoursesByCurriculum(curriculumId: string) {
  try {
    await connectDB();
    const courses = await Course.find({ curriculumId }).lean();
    return courses.map((course: any) => ({ ...course, id: toObjectIdString(course._id) }));
  } catch {
    return [];
  }
}

export async function getStudents() {
  try {
    await connectDB();
    const students = await Student.find({}).lean();
    return students.map((student: any) => ({ ...student, id: toObjectIdString(student._id) }));
  } catch {
    return [];
  }
}

export async function getReportsWithStudents() {
  try {
    await connectDB();
    const reports = await Report.find({}).lean();
    const students = await Student.find({}).lean();

    return reports.map((report: any) => {
      const student = students.find((candidate: any) => toObjectIdString(candidate._id) === toObjectIdString(report.studentId));
      return {
        ...report,
        id: toObjectIdString(report._id),
        studentName: student?.fullName ?? "Student",
      };
    });
  } catch {
    return [];
  }
}

export async function getUsers() {
  try {
    await connectDB();
    const users = await User.find({}).lean();
    return users.map((user: any) => ({ ...user, id: toObjectIdString(user._id) }));
  } catch {
    return [];
  }
}

export async function getExaminerReports() {
  try {
    await connectDB();
    const reports = await ExaminerReport.find({}).lean();
    return reports.map((report: any) => ({ ...report, id: toObjectIdString(report._id) }));
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
