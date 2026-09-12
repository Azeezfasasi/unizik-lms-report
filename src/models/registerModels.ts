/**
 * Side-effect import of every Mongoose model so its schema is registered
 * with the current process before any `.populate()` call runs.
 *
 * Next.js bundles each route/page into its own isolated serverless function.
 * A page that only imports the model it queries directly (e.g. SupervisorReport)
 * but populates a ref field (e.g. "facultyId") will throw
 * `MissingSchemaError: Schema hasn't been registered for model "Faculty"` in
 * production, because Faculty's schema file was never pulled into that
 * function's bundle. Importing this module from connectDB() closes that gap
 * for every route without having to audit each populate() call site.
 */
import "@/models/AcademicSession";
import "@/models/AcademicWeek";
import "@/models/AuditLog";
import "@/models/Course";
import "@/models/CourseRepReport";
import "@/models/CoordinatorReport";
import "@/models/Curriculum";
import "@/models/Department";
import "@/models/DirectorReview";
import "@/models/ExamTimetable";
import "@/models/ExaminerReport";
import "@/models/Faculty";
import "@/models/GeneratedReportFile";
import "@/models/LectureSchedule";
import "@/models/Notification";
import "@/models/Report";
import "@/models/Student";
import "@/models/StudentReport";
import "@/models/SupervisorReport";
import "@/models/TeachingAssignment";
import "@/models/User";
import "@/models/WeeklyEffectivenessReport";
import "@/models/ReportDiscussion";
