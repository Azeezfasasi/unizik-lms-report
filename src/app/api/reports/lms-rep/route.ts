import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import CourseRepReport from "@/models/CourseRepReport";
import LectureSchedule from "@/models/LectureSchedule";
import { notifyReportEvent } from "@/lib/notify/notifyReportEvent";
import { logAudit } from "@/lib/audit/logAudit";

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
  const session = await getServerSession(authOptions);
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

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "REPORT_CREATED",
    category: "REPORT",
    description: `${session?.user?.name ?? "Someone"} created an LMS Rep Report`,
    entityType: "CourseRepReport",
    entityId: report._id.toString(),
    headers: req.headers,
  });

  return NextResponse.json(report, { status: 201 });
}
