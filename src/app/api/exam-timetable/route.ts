import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import ExamTimetable from "@/models/ExamTimetable";
import { logAudit } from "@/lib/audit/logAudit";

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const curriculumId = searchParams.get("curriculumId");
  const filter = curriculumId ? { curriculumId } : {};

  const entries = await ExamTimetable.find(filter).lean();
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const payload = await request.json();
  const entry = await ExamTimetable.create(payload);

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "EXAM_TIMETABLE_CREATED",
    category: "SCHEDULING",
    description: `${session?.user?.name ?? "Someone"} created an exam timetable entry`,
    entityType: "ExamTimetable",
    entityId: entry._id.toString(),
    headers: request.headers,
  });

  return NextResponse.json(entry, { status: 201 });
}
