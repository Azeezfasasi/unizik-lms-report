import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import WeeklyEffectivenessReport from "@/models/WeeklyEffectivenessReport";
import AcademicWeek from "@/models/AcademicWeek";
import { notifyReportEvent } from "@/lib/notify/notifyReportEvent";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const curriculumId = searchParams.get("curriculumId");
  const courseId = searchParams.get("courseId");

  const filter: Record<string, string> = {};
  if (curriculumId) filter.curriculumId = curriculumId;
  if (courseId) filter.courseId = courseId;

  const reports = await WeeklyEffectivenessReport.find(filter)
    .populate("curriculumId", "programName")
    .populate("courseId", "title code")
    .populate("preparedBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  const weeks = await AcademicWeek.find({
    curriculumId: body.curriculumId,
    courseId: body.courseId,
    academicSession: body.academicSession,
    semester: body.semester,
  })
    .sort({ weekNumber: 1 })
    .lean();

  const report = await WeeklyEffectivenessReport.create({
    ...body,
    weeklyEntries: weeks.map((week: { _id: string }) => ({
      weekId: week._id,
      lecturerEffectivenessRating: 50,
      studentEffectivenessRating: 50,
      remarks: "",
    })),
  });

  notifyReportEvent("weekly-effectiveness", report._id.toString(), "created").catch(() => {});

  return NextResponse.json(report, { status: 201 });
}
