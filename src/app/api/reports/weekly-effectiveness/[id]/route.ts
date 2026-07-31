import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import WeeklyEffectivenessReport from "@/models/WeeklyEffectivenessReport";
import "@/models/AcademicWeek";
import { logAudit } from "@/lib/audit/logAudit";

function average(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const report = await WeeklyEffectivenessReport.findById(id)
    .populate("curriculumId", "programName")
    .populate("courseId", "title code")
    .populate("preparedBy", "name")
    .populate("weeklyEntries.weekId", "weekNumber startDate endDate label")
    .lean();

  if (!report) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(report);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const body = await req.json();

  const weeklyEntries: Array<{ lecturerEffectivenessRating?: number; studentEffectivenessRating?: number }> =
    body.weeklyEntries ?? [];

  const report = await WeeklyEffectivenessReport.findByIdAndUpdate(
    id,
    {
      ...body,
      avgLecturerEffectiveness: average(weeklyEntries.map((entry) => entry.lecturerEffectivenessRating ?? 0)),
      avgStudentEffectiveness: average(weeklyEntries.map((entry) => entry.studentEffectivenessRating ?? 0)),
    },
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
    description: `${session?.user?.name ?? "Someone"} updated a Weekly Effectiveness Report`,
    entityType: "WeeklyEffectivenessReport",
    entityId: id,
    headers: req.headers,
  });

  return NextResponse.json(report);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const report = await WeeklyEffectivenessReport.findByIdAndDelete(id);
  if (!report) return NextResponse.json({ message: "Not found" }, { status: 404 });

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "REPORT_DELETED",
    category: "REPORT",
    description: `${session?.user?.name ?? "Someone"} deleted a Weekly Effectiveness Report`,
    entityType: "WeeklyEffectivenessReport",
    entityId: id,
    headers: req.headers,
  });

  return NextResponse.json({ message: "Weekly effectiveness report deleted" });
}
