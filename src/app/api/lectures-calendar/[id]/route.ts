import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import LectureSchedule from "@/models/LectureSchedule";
import { logAudit } from "@/lib/audit/logAudit";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const schedule = await LectureSchedule.findById(id).lean();

  if (!schedule) {
    return NextResponse.json({ message: "Lecture schedule not found" }, { status: 404 });
  }

  return NextResponse.json(schedule);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const payload = await request.json();
  const schedule = await LectureSchedule.findByIdAndUpdate(id, payload, { new: true }).lean();

  if (!schedule) {
    return NextResponse.json({ message: "Lecture schedule not found" }, { status: 404 });
  }

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "LECTURE_SCHEDULE_UPDATED",
    category: "SCHEDULING",
    description: `${session?.user?.name ?? "Someone"} updated lecture schedule ${schedule.title}`,
    entityType: "LectureSchedule",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json(schedule);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const schedule = await LectureSchedule.findByIdAndDelete(id).lean();

  if (!schedule) {
    return NextResponse.json({ message: "Lecture schedule not found" }, { status: 404 });
  }

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "LECTURE_SCHEDULE_DELETED",
    category: "SCHEDULING",
    description: `${session?.user?.name ?? "Someone"} deleted lecture schedule ${schedule.title}`,
    entityType: "LectureSchedule",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json({ message: "Lecture schedule deleted" });
}
