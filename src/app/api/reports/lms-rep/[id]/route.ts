import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import CourseRepReport from "@/models/CourseRepReport";
import "@/models/LectureSchedule";
import { logAudit } from "@/lib/audit/logAudit";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const report = await CourseRepReport.findById(id)
    .populate("courseId", "title code")
    .populate("submittedBy", "name")
    .populate("lectureCompliance.lectureScheduleId", "title startDate endDate")
    .lean();

  if (!report) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(report);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const body = await req.json();

  const totalHeld = (body.lectureCompliance ?? []).filter((entry: { held?: boolean }) => entry.held).length;

  const report = await CourseRepReport.findByIdAndUpdate(
    id,
    { ...body, totalLecturesHeld: totalHeld },
    { new: true }
  );

  if (!report) return NextResponse.json({ message: "Not found" }, { status: 404 });

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "REPORT_UPDATED",
    category: "REPORT",
    description: `${session?.user?.name ?? "Someone"} updated an LMS Rep Report`,
    entityType: "CourseRepReport",
    entityId: id,
    headers: req.headers,
  });

  return NextResponse.json(report);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const report = await CourseRepReport.findByIdAndDelete(id);
  if (!report) return NextResponse.json({ message: "Not found" }, { status: 404 });

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "REPORT_DELETED",
    category: "REPORT",
    description: `${session?.user?.name ?? "Someone"} deleted an LMS Rep Report`,
    entityType: "CourseRepReport",
    entityId: id,
    headers: req.headers,
  });

  return NextResponse.json({ message: "LMS rep report deleted" });
}
