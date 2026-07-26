export type Role = "ADMIN" | "FACULTY_OFFICER" | "EXAMINER" | "STUDENT" | "LMS_REP" | "PG_COORDINATOR" | "SUPERVISOR" | "DIRECTOR";
export type ReportStatus = "DRAFT" | "SUBMITTED";

export interface Faculty {
  id: string;
  name: string;
  code: string;
  dean: string;
  description: string;
  departments: string[];
}

export interface Department {
  id: string;
  name: string;
  facultyId: string;
  hod: string;
}

export interface Curriculum {
  id: string;
  departmentId: string;
  programName: string;
  level: string;
  version: string;
  documentUrl: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  units: number;
  semester: "FIRST" | "SECOND";
  curriculumId: string;
}

export interface ExaminerReport {
  id: string;
  examinerName: string;
  facultyId: string;
  departmentId: string;
  courseId: string;
  comments: string;
  score: number;
  attachmentUrl: string;
  submittedAt: string;
}

export interface StudentRecord {
  id: string;
  matricNumber: string;
  fullName: string;
  email: string;
  facultyId: string;
  departmentId: string;
  curriculumId: string;
  programLevel: string;
  photoUrl: string;
  status: "ACTIVE" | "SUSPENDED" | "GRADUATED";
}

export interface ReportRecord {
  id: string;
  studentId: string;
  facultyId: string;
  curriculumId: string;
  status: ReportStatus;
  preparedBy: string;
  submittedAt: string;
  notes: string;
}

export interface PortalUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  facultyId?: string;
  isActive: boolean;
}
