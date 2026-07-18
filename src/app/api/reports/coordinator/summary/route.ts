import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import Student from "@/models/Student";
import Course from "@/models/Course";
import ExaminerReport from "@/models/ExaminerReport";
import CourseRepReport from "@/models/CourseRepReport";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const curriculumId = searchParams.get("curriculumId");
  const academicSession = searchParams.get("academicSession");

  const [totalStudents, totalCourses, examinerCounts, repReports] = await Promise.all([
    Student.countDocuments({ curriculumId }),
    Course.countDocuments({ curriculumId }),
    ExaminerReport.aggregate([{ $match: { academicSession } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    CourseRepReport.find({ curriculumId, academicSession }).lean(),
  ]);

  const submitted = examinerCounts.reduce((sum, item: any) => sum + item.count, 0);
  const approved = examinerCounts.find((item: any) => item._id === "APPROVED")?.count ?? 0;
  const pending = examinerCounts
    .filter((item: any) => ["DRAFT", "SUBMITTED", "UNDER_REVIEW"].includes(item._id))
    .reduce((sum, item: any) => sum + item.count, 0);

  const totalScheduled = repReports.reduce((sum: number, report: any) => sum + (report.totalLecturesScheduled ?? 0), 0);
  const totalHeld = repReports.reduce((sum: number, report: any) => sum + (report.totalLecturesHeld ?? 0), 0);
  const lectureComplianceRate = totalScheduled > 0 ? Math.round((totalHeld / totalScheduled) * 100) : 0;

  return NextResponse.json({
    totalStudents,
    totalCourses,
    lectureComplianceRate,
    examinerReportsSummary: { submitted, approved, pending },
  });
}
