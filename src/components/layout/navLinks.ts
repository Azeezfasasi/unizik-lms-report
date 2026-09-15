export type NavLink = {
  href: string;
  label: string;
  icon: string;
  roles?: string[];
};

export const navLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/dashboard/faculty-departments", label: "Faculty & Departments", icon: "building", roles: ["ADMIN", "FACULTY_OFFICER", "PG_COORDINATOR"] },
  { href: "/dashboard/curriculum", label: "Curriculum & Courses", icon: "book", roles: ["ADMIN", "FACULTY_OFFICER", "EXAMINER", "PG_COORDINATOR"] },
  { href: "/dashboard/examiner-report", label: "Examiner Reports", icon: "clipboard", roles: ["ADMIN", "EXAMINER", "PG_COORDINATOR"] },
  { href: "/dashboard/lms-rep-report", label: "LMS Rep Report", icon: "chart", roles: ["ADMIN", "LMS_REP", "PG_COORDINATOR"] },
  { href: "/dashboard/supervisor-report", label: "Supervisor Reports", icon: "chart", roles: ["ADMIN", "SUPERVISOR", "PG_COORDINATOR", "HOD", "DEAN", "SUB_DEAN", "ASSOCIATE_PROVOST"] },
  { href: "/dashboard/lectures-calendar", label: "Lecture Schedules", icon: "calendar", roles: ["ADMIN", "FACULTY_OFFICER", "EXAMINER", "PG_COORDINATOR"] },
  { href: "/dashboard/academic-sessions", label: "Academic Sessions", icon: "calendar", roles: ["ADMIN", "PG_COORDINATOR"] },
  { href: "/dashboard/academic-weeks", label: "Academic Weeks", icon: "calendar", roles: ["ADMIN", "PG_COORDINATOR"] },
  { href: "/dashboard/pg-course-report", label: "HOD/PG Coordinator's Report", icon: "chart", roles: ["ADMIN", "PG_COORDINATOR", "HOD", "DEAN", "SUB_DEAN", "ASSOCIATE_PROVOST"] },
  { href: "/dashboard/weekly-effectiveness-report", label: "Weekly Effectiveness Report", icon: "chart", roles: ["ADMIN", "PG_COORDINATOR"] },
  { href: "/dashboard/reports/approvals", label: "Report Approvals", icon: "archive", roles: ["ADMIN", "DEAN", "SUB_DEAN"] },
  { href: "/dashboard/dean-reports", label: "Dean & Sub-Dean Reports", icon: "archive", roles: ["ADMIN", "DEAN", "SUB_DEAN"] },
  { href: "/dashboard/student-reports", label: "Student Reports", icon: "chart", roles: ["ADMIN", "FACULTY_OFFICER", "EXAMINER", "STUDENT"] },
  { href: "/dashboard/reports", label: "Submitted Reports", icon: "archive", roles: ["ADMIN", "FACULTY_OFFICER", "LMS_REP", "PG_COORDINATOR", "DIRECTOR", "HOD", "DEAN", "SUB_DEAN", "ASSOCIATE_PROVOST"] },
  { href: "/dashboard/director", label: "Director Summary", icon: "summary", roles: ["ADMIN", "PG_COORDINATOR", "DIRECTOR", "ASSOCIATE_PROVOST"] },
  { href: "/dashboard/associate-provost", label: "Associate Provost Summary", icon: "summary", roles: ["ADMIN", "ASSOCIATE_PROVOST"] },
  { href: "/dashboard/students", label: "Students", icon: "users", roles: ["ADMIN", "FACULTY_OFFICER", "PG_COORDINATOR"] },
  { href: "/dashboard/users", label: "Users", icon: "user-circle", roles: ["ADMIN"] },
  { href: "/dashboard/audit-logs", label: "Audit Logs", icon: "archive", roles: ["ADMIN"] },
  { href: "/dashboard/settings/profile", label: "Settings", icon: "cog" },
];
