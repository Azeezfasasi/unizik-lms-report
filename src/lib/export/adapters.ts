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
  examinerReportsSummary?: { submitted?: number; approved?: number; pending?: number };
  examTimetableStatus?: string;
  recommendations?: string;
  studentId?: NamedRecord;
  notes?: string;
  teachingQuality?: number;
  examPreparedness?: number;
  courseMaterialsRating?: number;
  lectureFeedback?: string;
  examFeedback?: string;
  instructorFeedback?: string;
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
      { label: "Submitted By", value: report.submittedBy?.name ?? "-" },
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
        heading: "Recommendations",
        rows: [{ label: "Recommendations", value: report.recommendations || "None" }],
      },
    ],
    generatedAt: new Date(),
  };
}

export function adaptStudentReport(report: ReportLike): ReportExportPayload {
  return {
    title: "Student Report",
    subtitle: report.studentId?.fullName ?? "Student",
    meta: [
      { label: "Matric Number", value: report.studentId?.matricNumber ?? "-" },
      { label: "Faculty", value: report.facultyId?.name ?? "-" },
      { label: "Programme", value: report.curriculumId?.programName ?? "-" },
      { label: "Status", value: report.status ?? "-" },
    ],
    sections: [
      {
        heading: "Feedback Ratings",
        rows: [
          { label: "Teaching Quality", value: String(report.teachingQuality ?? "-") },
          { label: "Exam Preparedness", value: String(report.examPreparedness ?? "-") },
          { label: "Course Materials", value: String(report.courseMaterialsRating ?? "-") },
        ],
      },
      {
        heading: "Detailed Feedback",
        rows: [
          { label: "Lecture Feedback", value: report.lectureFeedback || "None" },
          { label: "Exam Feedback", value: report.examFeedback || "None" },
          { label: "Instructor Feedback", value: report.instructorFeedback || "None" },
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

export function getAdapter(type: "STUDENT" | "LMS_REP" | "PG_COORDINATOR" | "EXAMINER") {
  const map = {
    STUDENT: adaptStudentReport,
    LMS_REP: adaptCourseRepReport,
    PG_COORDINATOR: adaptCoordinatorReport,
    EXAMINER: adaptExaminerReport,
  };
  return map[type];
}
