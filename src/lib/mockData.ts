import type {
  Curriculum,
  Course,
  Department,
  ExaminerReport,
  Faculty,
  PortalUser,
  ReportRecord,
  StudentRecord,
} from "@/types/portal";

export const faculties: Faculty[] = [
  {
    id: "fac-001",
    name: "Faculty of Sciences",
    code: "FOS",
    dean: "Prof. Ada Okafor",
    description: "Applied sciences, computing and research reporting.",
    departments: ["Computer Science", "Biochemistry", "Physics"],
  },
  {
    id: "fac-002",
    name: "Faculty of Management Sciences",
    code: "FMS",
    dean: "Dr. Chidi Nwosu",
    description: "Business operations and postgraduate management reports.",
    departments: ["Accounting", "Business Admin", "Marketing"],
  },
  {
    id: "fac-003",
    name: "Faculty of Education",
    code: "FED",
    dean: "Prof. Grace Eze",
    description: "Curriculum planning and academic review workflows.",
    departments: ["Educational Admin", "Guidance & Counselling"],
  },
];

export const departments: Department[] = [
  { id: "dept-001", name: "Computer Science", facultyId: "fac-001", hod: "Dr. Emeka Uche" },
  { id: "dept-002", name: "Biochemistry", facultyId: "fac-001", hod: "Dr. Nkechi Obi" },
  { id: "dept-003", name: "Accounting", facultyId: "fac-002", hod: "Dr. Ifeoma Okafor" },
  { id: "dept-004", name: "Educational Admin", facultyId: "fac-003", hod: "Prof. B. Nnamdi" },
];

export const curriculums: Curriculum[] = [
  {
    id: "cur-001",
    departmentId: "dept-001",
    programName: "M.Sc Computer Science",
    level: "MSc",
    version: "1.2",
    documentUrl: "/documents/curriculum-computer-science.pdf",
  },
  {
    id: "cur-002",
    departmentId: "dept-003",
    programName: "M.Sc Accounting",
    level: "MSc",
    version: "1.1",
    documentUrl: "/documents/curriculum-accounting.pdf",
  },
  {
    id: "cur-003",
    departmentId: "dept-004",
    programName: "PhD Educational Administration",
    level: "PhD",
    version: "2.0",
    documentUrl: "/documents/curriculum-education.pdf",
  },
];

export const courses: Course[] = [
  { id: "course-001", title: "Advanced Web Architecture", code: "CSC 801", units: 3, semester: "FIRST", curriculumId: "cur-001" },
  { id: "course-002", title: "Data Science Practicum", code: "CSC 803", units: 3, semester: "SECOND", curriculumId: "cur-001" },
  { id: "course-003", title: "Strategic Finance", code: "ACC 801", units: 2, semester: "FIRST", curriculumId: "cur-002" },
  { id: "course-004", title: "Educational Policy Analysis", code: "EDA 901", units: 3, semester: "SECOND", curriculumId: "cur-003" },
];

export const examinerReports: ExaminerReport[] = [
  {
    id: "report-001",
    examinerName: "Dr. S. Ibrahim",
    facultyId: "fac-001",
    departmentId: "dept-001",
    courseId: "course-001",
    comments: "The curriculum is well aligned with current computing practices and student outcomes.",
    score: 92,
    attachmentUrl: "/documents/examiner-report-001.pdf",
    submittedAt: "2026-07-01",
  },
  {
    id: "report-002",
    examinerName: "Dr. L. Musa",
    facultyId: "fac-002",
    departmentId: "dept-003",
    courseId: "course-003",
    comments: "Suggested more practical case studies for the strategic finance module.",
    score: 86,
    attachmentUrl: "/documents/examiner-report-002.pdf",
    submittedAt: "2026-07-05",
  },
];

export const students: StudentRecord[] = [
  {
    id: "student-001",
    matricNumber: "2023/055001",
    fullName: "Ada Okafor",
    email: "ada.okafor@unizik.edu.ng",
    facultyId: "fac-001",
    departmentId: "dept-001",
    curriculumId: "cur-001",
    programLevel: "MSc",
    photoUrl: "/images/student-placeholder.png",
    status: "ACTIVE",
  },
  {
    id: "student-002",
    matricNumber: "2024/099011",
    fullName: "Bola Adebayo",
    email: "bola.adebayo@unizik.edu.ng",
    facultyId: "fac-002",
    departmentId: "dept-003",
    curriculumId: "cur-002",
    programLevel: "MSc",
    photoUrl: "/images/student-placeholder.png",
    status: "ACTIVE",
  },
];

export const reports: ReportRecord[] = [
  {
    id: "rep-100",
    studentId: "student-001",
    facultyId: "fac-001",
    curriculumId: "cur-001",
    status: "SUBMITTED",
    preparedBy: "user-001",
    submittedAt: "2026-07-09",
    notes: "Faculty review completed for semester one.",
  },
  {
    id: "rep-101",
    studentId: "student-002",
    facultyId: "fac-002",
    curriculumId: "cur-002",
    status: "DRAFT",
    preparedBy: "user-003",
    submittedAt: "2026-07-10",
    notes: "Pending timetable harmonization.",
  },
];

export const users: PortalUser[] = [
  { id: "user-001", name: "Joy Okafor", email: "joy.okafor@unizik.edu.ng", role: "ADMIN", isActive: true },
  { id: "user-002", name: "Moses Ayo", email: "moses.ayo@unizik.edu.ng", role: "FACULTY_OFFICER", facultyId: "fac-001", isActive: true },
  { id: "user-003", name: "Tolu Ade", email: "tolu.ade@unizik.edu.ng", role: "EXAMINER", facultyId: "fac-002", isActive: true },
  { id: "user-004", name: "Nneka Chukwu", email: "nneka.chukwu@unizik.edu.ng", role: "STUDENT", facultyId: "fac-003", isActive: true },
];

export function getFacultyById(id: string) {
  return faculties.find((faculty) => faculty.id === id);
}

export function getDepartmentById(id: string) {
  return departments.find((department) => department.id === id);
}

export function getCurriculumById(id: string) {
  return curriculums.find((curriculum) => curriculum.id === id);
}

export function getCoursesByCurriculum(id: string) {
  return courses.filter((course) => course.curriculumId === id);
}

export function getStudentById(id: string) {
  return students.find((student) => student.id === id);
}

export function getReportById(id: string) {
  return reports.find((report) => report.id === id);
}

export function getUserById(id: string) {
  return users.find((user) => user.id === id);
}
