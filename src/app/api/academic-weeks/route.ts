import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import AcademicWeek from "@/models/AcademicWeek";
import { logAudit } from "@/lib/audit/logAudit";

const ALLOWED_ROLES = ["ADMIN", "PG_COORDINATOR", "LMS_REP"];

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const curriculumId = searchParams.get("curriculumId");
  const courseId = searchParams.get("courseId");
  const academicSession = searchParams.get("academicSession");
  const semester = searchParams.get("semester");

  const filter: Record<string, string> = {};
  if (curriculumId) filter.curriculumId = curriculumId;
  if (courseId) filter.courseId = courseId;
  if (academicSession) filter.academicSession = academicSession;
  if (semester) filter.semester = semester;

  const weeks = await AcademicWeek.find(filter)
    .populate("curriculumId", "programName")
    .populate("courseId", "title code")
    .sort({ weekNumber: 1 })
    .lean();

  return NextResponse.json(weeks);
}

export async function POST(request: Request) {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role?.toString().toUpperCase().trim())) {
    return NextResponse.json({ message: "Only admins, PG coordinators, and LMS reps can create academic weeks." }, { status: 403 });
  }

  const payload = await request.json();

  if (!payload.curriculumId) {
    return NextResponse.json({ message: "curriculumId is required" }, { status: 400 });
  }

  if (!payload.courseId) {
    return NextResponse.json({ message: "courseId is required" }, { status: 400 });
  }

  if (!payload.weekNumber) {
    return NextResponse.json({ message: "weekNumber is required" }, { status: 400 });
  }

  const week = await AcademicWeek.create(payload);

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "ACADEMIC_WEEK_CREATED",
    category: "SCHEDULING",
    description: `${session?.user?.name ?? "Someone"} created academic week ${week.weekNumber}`,
    entityType: "AcademicWeek",
    entityId: week._id.toString(),
    headers: request.headers,
  });

  return NextResponse.json(week, { status: 201 });
}
