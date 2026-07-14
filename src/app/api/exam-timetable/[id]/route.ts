import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import ExamTimetable from "@/models/ExamTimetable";

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
  const { id } = await params;
  const payload = await request.json();
  const entry = await ExamTimetable.findByIdAndUpdate(id, payload, { new: true }).lean();

  if (!entry) {
    return NextResponse.json({ message: "Exam timetable entry not found" }, { status: 404 });
  }

  return NextResponse.json(entry);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const entry = await ExamTimetable.findByIdAndDelete(id).lean();

  if (!entry) {
    return NextResponse.json({ message: "Exam timetable entry not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Exam timetable entry deleted" });
}
