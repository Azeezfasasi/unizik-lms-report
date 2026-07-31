import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import CourseRepReport from "@/models/CourseRepReport";
import LectureSchedule from "@/models/LectureSchedule";
import { notifyReportEvent } from "@/lib/notify/notifyReportEvent";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  const filter: Record<string, string> = {};
  if (courseId) filter.courseId = courseId;

  const reports = await CourseRepReport.find(filter)
    .populate("courseId", "title code")
    .populate("submittedBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  if (!body.weekId) {
    return NextResponse.json({ message: "Select or create an academic week before submitting this report." }, { status: 400 });
  }

  const schedules = await LectureSchedule.find({ curriculumId: body.curriculumId }).lean();

  const report = await CourseRepReport.create({
    ...body,
    totalLecturesScheduled: schedules.length,
    lectureCompliance: schedules.map((schedule: { _id: string }) => ({ lectureScheduleId: schedule._id, held: false, remarks: "" })),
  });

  notifyReportEvent("lms-rep", report._id.toString(), "created").catch(() => {});

  return NextResponse.json(report, { status: 201 });
}
