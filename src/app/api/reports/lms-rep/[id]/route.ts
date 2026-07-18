import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import CourseRepReport from "@/models/CourseRepReport";

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
  const { id } = await params;
  const body = await req.json();

  const totalHeld = (body.lectureCompliance ?? []).filter((entry: { held?: boolean }) => entry.held).length;

  const report = await CourseRepReport.findByIdAndUpdate(
    id,
    { ...body, totalLecturesHeld: totalHeld },
    { new: true }
  );

  if (!report) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(report);
}
