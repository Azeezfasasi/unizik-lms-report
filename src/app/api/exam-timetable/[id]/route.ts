import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import ExamTimetable from "@/models/ExamTimetable";
import { logAudit } from "@/lib/audit/logAudit";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const entry = await ExamTimetable.findById(id).lean();

  if (!entry) {
    return NextResponse.json({ message: "Exam timetable entry not found" }, { status: 404 });
  }

  return NextResponse.json(entry);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const payload = await request.json();
  const entry = await ExamTimetable.findByIdAndUpdate(id, payload, { new: true }).lean();

  if (!entry) {
    return NextResponse.json({ message: "Exam timetable entry not found" }, { status: 404 });
  }

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "EXAM_TIMETABLE_UPDATED",
    category: "SCHEDULING",
    description: `${session?.user?.name ?? "Someone"} updated an exam timetable entry`,
    entityType: "ExamTimetable",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json(entry);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const entry = await ExamTimetable.findByIdAndDelete(id).lean();

  if (!entry) {
    return NextResponse.json({ message: "Exam timetable entry not found" }, { status: 404 });
  }

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "EXAM_TIMETABLE_DELETED",
    category: "SCHEDULING",
    description: `${session?.user?.name ?? "Someone"} deleted an exam timetable entry`,
    entityType: "ExamTimetable",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json({ message: "Exam timetable entry deleted" });
}
