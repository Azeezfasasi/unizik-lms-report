export type NavLink = {
  href: string;
  label: string;
  icon: string;
  roles?: string[];
};

export const navLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/dashboard/faculty-departments", label: "Faculty & Departments", icon: "building", roles: ["ADMIN", "FACULTY_OFFICER", "LMS_REP", "PG_COORDINATOR"] },
  { href: "/dashboard/curriculum", label: "Curriculum & Courses", icon: "book", roles: ["ADMIN", "FACULTY_OFFICER", "EXAMINER", "LMS_REP", "PG_COORDINATOR"] },
  { href: "/dashboard/examiner-report", label: "Examiner Reports", icon: "clipboard", roles: ["ADMIN", "EXAMINER", "PG_COORDINATOR"] },
  { href: "/dashboard/lms-rep-report", label: "LMS Rep Report", icon: "chart", roles: ["ADMIN", "LMS_REP", "PG_COORDINATOR"] },
  { href: "/dashboard/lectures-calendar", label: "Lecture Schedules", icon: "calendar", roles: ["ADMIN", "FACULTY_OFFICER", "EXAMINER", "LMS_REP", "PG_COORDINATOR"] },
  { href: "/dashboard/pg-course-report", label: "PG Coordinator's Report", icon: "chart", roles: ["ADMIN", "PG_COORDINATOR"] },
  { href: "/dashboard/student-reports", label: "Student Reports", icon: "chart", roles: ["ADMIN", "FACULTY_OFFICER", "EXAMINER", "STUDENT"] },
  { href: "/dashboard/reports", label: "Submitted Reports", icon: "archive", roles: ["ADMIN", "FACULTY_OFFICER", "FACULTY_OFFICER", "LMS_REP", "PG_COORDINATOR"] },
  { href: "/dashboard/students", label: "Students", icon: "users", roles: ["ADMIN", "FACULTY_OFFICER", "FACULTY_OFFICER", "LMS_REP", "PG_COORDINATOR"] },
  { href: "/dashboard/users", label: "Users", icon: "user-circle", roles: ["ADMIN"] },
  { href: "/dashboard/settings/profile", label: "Settings", icon: "cog" },
];
