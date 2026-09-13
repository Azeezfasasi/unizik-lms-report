export interface ReportExportPayload {
  title: string;
  subtitle: string;
  meta: { label: string; value: string }[];
  sections: {
    heading: string;
    rows: { label: string; value: string }[];
    table?: { headers: string[]; rows: string[][] };
  }[];
  footerNote?: string;
  generatedAt: Date;
}

type NamedRecord = {
  name?: string;
  fullName?: string;
  title?: string;
  code?: string;
  programName?: string;
  matricNumber?: string;
};

type HistoryEntry = {
  status?: string;
  changedBy?: NamedRecord;
  changedAt?: Date | string;
  comment?: string;
};

type LectureComplianceEntry = {
  lectureScheduleId?: NamedRecord;
  held?: boolean;
  remarks?: string;
};

type ReportLike = {
  courseId?: NamedRecord;
  facultyId?: NamedRecord;
  departmentId?: NamedRecord;
  lecturerId?: NamedRecord;
  externalExaminerName?: string;
  academicSession?: string;
  semester?: string;
  examType?: string;
  status?: string;
  statusHistory?: HistoryEntry[];
  moderatorComments?: string;
  complianceNotes?: string;
  comments?: string;
  score?: number;
  numberOfQuestions?: number;
  malpracticeFlagged?: boolean;
  submittedBy?: NamedRecord;
  totalLecturesScheduled?: number;
  totalLecturesHeld?: number;
  lectureCompliance?: LectureComplianceEntry[];
  issues?: string;
  curriculumId?: NamedRecord;
  preparedBy?: NamedRecord;
  totalStudents?: number;
  totalCourses?: number;
  lectureComplianceRate?: number;
  studentLectureResponseLow?: number;
  studentLectureResponseAverage?: number;
  studentLectureResponseHigh?: number;
  studentAssignmentResponseLow?: number;
  studentAssignmentResponseAverage?: number;
  studentAssignmentResponseHigh?: number;
  studentQuizResponseLow?: number;
  studentQuizResponseAverage?: number;
  studentQuizResponseHigh?: number;
  studentCourseworkResponseLow?: number;
  studentCourseworkResponseAverage?: number;
  studentCourseworkResponseHigh?: number;
  weeklySyllabusCoveredRate?: number;
  courseMaterialsReleasedRate?: number;
  examReadinessRate?: number;
  supervisorActivesRate?: number;
  studentProgressionRate?: number;
  examinerReportsSummary?: { submitted?: number; approved?: number; pending?: number };
  examTimetableStatus?: string;
  recommendations?: string;
  studentId?: NamedRecord;
  projectTitle?: string;
  milestone?: string;
  progressSummary?: string;
  notes?: string;
  teachingQuality?: number;
  examPreparedness?: number;
  courseMaterialsRating?: number;
  lectureFeedback?: string;
  examFeedback?: string;
  instructorFeedback?: string;
  lmsPortalFeedback?: string;
  weeklyEntries?: Array<{
    weekId?: { weekNumber?: number; label?: string };
    lecturerEffectivenessRating?: number;
    studentEffectivenessRating?: number;
    remarks?: string;
  }>;
  avgLecturerEffectiveness?: number;
  avgStudentEffectiveness?: number;
  generalComments?: string;
};

export function adaptExaminerReport(report: ReportLike): ReportExportPayload {
  return {
    title: "Examiner Report",
    subtitle: `${report.courseId?.title ?? "Course"} (${report.courseId?.code ?? ""})`,
    meta: [
      { label: "Examiner", value: report.lecturerId?.name ?? report.externalExaminerName ?? "-" },
      { label: "Faculty", value: report.facultyId?.name ?? "-" },
      { label: "Department", value: report.departmentId?.name ?? "-" },
      { label: "Academic Session", value: report.academicSession ?? "-" },
      { label: "Semester", value: report.semester === "FIRST" ? "First" : "Second" },
      { label: "Exam Type", value: report.examType ?? "-" },
      { label: "Status", value: report.status?.replace(/_/g, " ") ?? "-" },
    ],
    sections: [
      {
        heading: "Evaluation",
        rows: [
          { label: "Score", value: `${report.score ?? 0}/100` },
          { label: "Number of Questions", value: String(report.numberOfQuestions ?? "-") },
          { label: "Malpractice Flagged", value: report.malpracticeFlagged ? "Yes" : "No" },
        ],
      },
      {
        heading: "Comments",
        rows: [
          { label: "Examiner Comments", value: report.comments ?? "-" },
          { label: "Moderator Comments", value: report.moderatorComments ?? "-" },
          { label: "Compliance Notes", value: report.complianceNotes ?? "-" },
        ],
      },
      {
        heading: "Status History",
        rows: [],
        table: {
          headers: ["Status", "Changed By", "Date", "Comment"],
          rows: (report.statusHistory ?? []).map((entry) => [
            entry.status ?? "-",
            entry.changedBy?.name ?? "-",
            new Date(entry.changedAt ?? new Date()).toLocaleDateString(),
            entry.comment ?? "",
          ]),
        },
      },
    ],
    generatedAt: new Date(),
  };
}

export function adaptCourseRepReport(report: ReportLike): ReportExportPayload {
  return {
    title: "LMS Course Rep Report",
    subtitle: `${report.courseId?.title ?? "Course"} (${report.courseId?.code ?? ""})`,
    meta: [
      { label: "Course", value: `${report.courseId?.title ?? "-"} (${report.courseId?.code ?? "-"})` },
      { label: "Faculty", value: report.facultyId?.name ?? "-" },
      { label: "Department", value: report.departmentId?.name ?? "-" },
      { label: "Academic Session", value: report.academicSession ?? "-" },
      { label: "Semester", value: report.semester === "FIRST" ? "First" : "Second" },
      { label: "Status", value: report.status ?? "-" },
    ],
    sections: [
      {
        heading: "Lecture Compliance",
        rows: [
          { label: "Lectures Scheduled", value: String(report.totalLecturesScheduled) },
          { label: "Lectures Held", value: String(report.totalLecturesHeld) },
          {
            label: "Compliance Rate",
            value:
              (report.totalLecturesScheduled ?? 0) > 0
                ? `${Math.round(((report.totalLecturesHeld ?? 0) / (report.totalLecturesScheduled ?? 1)) * 100)}%`
                : "N/A",
          },
        ],
        table: {
          headers: ["Lecture", "Held", "Remarks"],
          rows: (report.lectureCompliance ?? []).map((entry) => [
            entry.lectureScheduleId?.title ?? "-",
            entry.held ? "Yes" : "No",
            entry.remarks ?? "",
          ]),
        },
      },
      {
        heading: "Issues Raised",
        rows: [{ label: "Issues", value: report.issues || "None reported" }],
      },
    ],
    generatedAt: new Date(),
  };
}

export function adaptSupervisorReport(report: ReportLike): ReportExportPayload {
  return {
    title: "Supervisor Report",
    subtitle: `${report.facultyId?.name ?? "Faculty"} • ${report.departmentId?.name ?? "Department"}`,
    meta: [
      { label: "Faculty", value: report.facultyId?.name ?? "-" },
      { label: "Department", value: report.departmentId?.name ?? "-" },
      { label: "Academic Session", value: report.academicSession ?? "-" },
      { label: "Semester", value: report.semester === "FIRST" ? "First" : "Second" },
      { label: "Status", value: report.status ?? "-" },
      { label: "Submitted By", value: report.submittedBy?.name ?? "-" },
    ],
    sections: [
      {
        heading: "Student Response Metrics",
        rows: [
            { label: "Project or Thesis", value: report.projectTitle ?? "-" },
            { label: "Student", value: report.studentId?.fullName ?? "Not specified" },
            { label: "Milestone", value: report.milestone ?? "-" },
            { label: "Progress Summary", value: report.progressSummary ?? "-" },
        ],
      },
    ],
    generatedAt: new Date(),
  };
}

export function adaptCoordinatorReport(report: ReportLike): ReportExportPayload {
  return {
    title: "PG Coordinator's Report",
    subtitle: report.curriculumId?.programName ?? "Programme",
    meta: [
      { label: "Prepared By", value: report.preparedBy?.name ?? "-" },
      { label: "Academic Session", value: report.academicSession ?? "-" },
      { label: "Semester", value: report.semester === "FIRST" ? "First" : "Second" },
      { label: "Status", value: report.status ?? "-" },
    ],
    sections: [
      {
        heading: "Programme Summary",
        rows: [
          { label: "Total Students", value: String(report.totalStudents) },
          { label: "Total Courses", value: String(report.totalCourses) },
          { label: "Lecture Compliance Rate", value: `${report.lectureComplianceRate}%` },
          { label: "Exam Timetable Status", value: report.examTimetableStatus ?? "-" },
        ],
      },
      {
        heading: "Examiner Reports Summary",
        rows: [
          { label: "Submitted", value: String(report.examinerReportsSummary?.submitted ?? 0) },
          { label: "Approved", value: String(report.examinerReportsSummary?.approved ?? 0) },
          { label: "Pending", value: String(report.examinerReportsSummary?.pending ?? 0) },
        ],
      },
      {
        heading: "Student Responses",
        rows: [
          ["Lectures", "studentLectureResponse"],
          ["Assignments", "studentAssignmentResponse"],
          ["Quizzes", "studentQuizResponse"],
          ["Course work", "studentCourseworkResponse"],
        ].map(([label, prefix]) => ({ label, value: `Low ${(report as Record<string, unknown>)[`${prefix}Low`] ?? 0}% | Average ${(report as Record<string, unknown>)[`${prefix}Average`] ?? 0}% | High ${(report as Record<string, unknown>)[`${prefix}High`] ?? 0}%` })),
      },
      {
        heading: "Operational Indicators",
        rows: [
          { label: "Weekly syllabus covered", value: `${report.weeklySyllabusCoveredRate ?? 0}%` },
          { label: "Course materials released", value: `${report.courseMaterialsReleasedRate ?? 0}%` },
          { label: "Exam readiness", value: `${report.examReadinessRate ?? 0}%` },
          { label: "Supervisor's actives", value: `${report.supervisorActivesRate ?? 0}%` },
          { label: "Student progression", value: `${report.studentProgressionRate ?? 0}%` },
        ],
      },
      {
        heading: "Recommendations",
        rows: [{ label: "Recommendations", value: report.recommendations || "None" }],
      },
    ],
    generatedAt: new Date(),
  };
}

export function adaptWeeklyEffectivenessReport(report: ReportLike): ReportExportPayload {
  return {
    title: "Weekly Effectiveness Report",
    subtitle: `${report.courseId?.title ?? "Course"} (${report.courseId?.code ?? ""}) · ${report.curriculumId?.programName ?? "Programme"}`,
    meta: [
      { label: "Course", value: `${report.courseId?.title ?? "-"} (${report.courseId?.code ?? "-"})` },
      { label: "Prepared By", value: report.preparedBy?.name ?? "-" },
      { label: "Academic Session", value: report.academicSession ?? "-" },
      { label: "Semester", value: report.semester === "FIRST" ? "First" : "Second" },
      { label: "Status", value: report.status ?? "-" },
    ],
    sections: [
      {
        heading: "Effectiveness Summary",
        rows: [
          { label: "Avg. Lecturer Effectiveness", value: `${report.avgLecturerEffectiveness ?? 0}%` },
          { label: "Avg. Student Effectiveness", value: `${report.avgStudentEffectiveness ?? 0}%` },
        ],
      },
      {
        heading: "Weekly Breakdown",
        rows: [],
        table: {
          headers: ["Week", "Lecturer Effectiveness", "Student Effectiveness", "Remarks"],
          rows: (report.weeklyEntries ?? []).map((entry) => [
            entry.weekId?.weekNumber ? `Week ${entry.weekId.weekNumber}${entry.weekId.label ? ` — ${entry.weekId.label}` : ""}` : "-",
            `${entry.lecturerEffectivenessRating ?? 0}%`,
            `${entry.studentEffectivenessRating ?? 0}%`,
            entry.remarks ?? "",
          ]),
        },
      },
      {
        heading: "General Comments",
        rows: [{ label: "Comments", value: report.generalComments || "None" }],
      },
    ],
    generatedAt: new Date(),
  };
}

function formatPercentageRating(value?: number): string {
  if (typeof value !== "number") {
    return "-";
  }

  if (value > 0 && value <= 5) {
    return `${Math.round(value * 20)}%`;
  }

  if (value >= 0 && value <= 100) {
    return `${Math.round(value)}%`;
  }

  return "-";
}

export function adaptStudentReport(report: ReportLike): ReportExportPayload {
  return {
    title: "Student Report",
    subtitle: report.studentId?.fullName ?? "Student",
    meta: [
      { label: "Registration Number", value: report.studentId?.matricNumber ?? "-" },
      { label: "Faculty", value: report.facultyId?.name ?? "-" },
      { label: "Programme", value: report.curriculumId?.programName ?? "-" },
      { label: "Status", value: report.status ?? "-" },
    ],
    sections: [
      {
        heading: "Feedback Ratings",
        rows: [
          { label: "Teaching Quality", value: formatPercentageRating(report.teachingQuality) },
          { label: "Exam Preparedness", value: formatPercentageRating(report.examPreparedness) },
          { label: "Course Materials", value: formatPercentageRating(report.courseMaterialsRating) },
        ],
      },
      {
        heading: "Detailed Feedback",
        rows: [
          { label: "Lecture Feedback", value: report.lectureFeedback || "None" },
          { label: "Exam Feedback", value: report.examFeedback || "None" },
          { label: "Instructor Feedback", value: report.instructorFeedback || "None" },
          { label: "LMS Portal Feedback", value: report.lmsPortalFeedback || "None" },
        ],
      },
      {
        heading: "Summary Notes",
        rows: [{ label: "Notes", value: report.notes || "None" }],
      },
    ],
    generatedAt: new Date(),
  };
}

export function adaptDirectorReport(report: Record<string, unknown>): ReportExportPayload {
  const facultyName = typeof report.facultyName === "string" ? report.facultyName : "All faculties";
  const academicSession = typeof report.academicSession === "string" ? report.academicSession : "All";
  const semester = typeof report.semester === "string" ? report.semester : "All";

  return {
    title: "Director Summary",
    subtitle: academicSession !== "All" ? `${academicSession}${semester !== "All" ? ` • ${semester}` : ""}` : "Portal oversight summary",
    meta: [
      { label: "Faculty", value: facultyName },
      { label: "Academic Session", value: academicSession },
      { label: "Semester", value: semester },
    ],
    sections: [
      {
        heading: "Student Feedback",
        rows: [
          { label: "Submitted student reports", value: String(report.studentReportCount ?? 0) },
          { label: "Avg teaching quality", value: `${report.avgTeachingQuality ?? 0}%` },
          { label: "Avg exam preparedness", value: `${report.avgExamPreparedness ?? 0}%` },
          { label: "Avg course materials rating", value: `${report.avgCourseMaterialsRating ?? 0}%` },
        ],
      },
      {
        heading: "LMS Rep Reports",
        rows: [
          { label: "Submitted LMS rep reports", value: String(report.lmsReportCount ?? 0) },
          { label: "Avg lecture compliance", value: `${report.avgLectureComplianceRate ?? 0}%` },
          { label: "Avg lecturer training rating", value: `${report.avgLecturerTrainingRating ?? 0}%` },
          { label: "Ready for quizzes/exams", value: String(report.portalReadinessReadyCount ?? 0) },
        ],
      },
      {
        heading: "Coordinator Reports",
        rows: [
          { label: "Submitted coordinator reports", value: String(report.coordinatorReportCount ?? 0) },
          { label: "Avg programme compliance", value: `${report.avgCoordinatorLectureComplianceRate ?? 0}%` },
          { label: "Avg lecturer response rate", value: `${report.avgLecturerResponseRate ?? 0}%` },
          { label: "Misconduct flags", value: String(report.coordinatorMisconductCount ?? 0) },
        ],
      },
      {
        heading: "Examiner Reports",
        rows: [
          { label: "Submitted examiner reports", value: String(report.examinerReportCount ?? 0) },
        ],
      },
      {
        heading: "Supervisor Reports",
        rows: [
          { label: "Submitted supervisor reports", value: String(report.supervisorReportCount ?? 0) },
        ],
      },
    ],
    generatedAt: new Date(),
  };
}

type ExportAdapterMap = {
  STUDENT: (report: ReportLike) => ReportExportPayload;
  LMS_REP: (report: ReportLike) => ReportExportPayload;
  PG_COORDINATOR: (report: ReportLike) => ReportExportPayload;
  EXAMINER: (report: ReportLike) => ReportExportPayload;
  SUPERVISOR: (report: ReportLike) => ReportExportPayload;
  WEEKLY_EFFECTIVENESS: (report: ReportLike) => ReportExportPayload;
  DIRECTOR: (report: Record<string, unknown>) => ReportExportPayload;
};

export function getAdapter(
  type: "STUDENT" | "LMS_REP" | "PG_COORDINATOR" | "EXAMINER" | "SUPERVISOR" | "WEEKLY_EFFECTIVENESS" | "DIRECTOR"
) {
  const map: ExportAdapterMap = {
    STUDENT: adaptStudentReport,
    LMS_REP: adaptCourseRepReport,
    PG_COORDINATOR: adaptCoordinatorReport,
    EXAMINER: adaptExaminerReport,
    SUPERVISOR: adaptSupervisorReport,
    WEEKLY_EFFECTIVENESS: adaptWeeklyEffectivenessReport,
    DIRECTOR: adaptDirectorReport,
  };
  return map[type];
}
