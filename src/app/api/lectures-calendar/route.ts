import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import LectureSchedule from "@/models/LectureSchedule";
import { logAudit } from "@/lib/audit/logAudit";

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const curriculumId = searchParams.get("curriculumId");
  const filter = curriculumId ? { curriculumId } : {};
  const schedules = await LectureSchedule.find(filter)
    .populate("courseId", "title code")
    .populate("curriculumId", "programName")
    .lean();
  return NextResponse.json(schedules);
}

export async function POST(request: Request) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const payload = await request.json();

  if (!payload.curriculumId) {
    return NextResponse.json({ message: "curriculumId is required" }, { status: 400 });
  }

  if (!payload.courseId) {
    return NextResponse.json({ message: "courseId is required" }, { status: 400 });
  }

  const schedule = await LectureSchedule.create(payload);

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "LECTURE_SCHEDULE_CREATED",
    category: "SCHEDULING",
    description: `${session?.user?.name ?? "Someone"} created lecture schedule ${schedule.title}`,
    entityType: "LectureSchedule",
    entityId: schedule._id.toString(),
    headers: request.headers,
  });

  return NextResponse.json(schedule, { status: 201 });
}
