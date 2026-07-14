import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import LectureSchedule from "@/models/LectureSchedule";

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
  const { id } = await params;
  const payload = await request.json();
  const schedule = await LectureSchedule.findByIdAndUpdate(id, payload, { new: true }).lean();

  if (!schedule) {
    return NextResponse.json({ message: "Lecture schedule not found" }, { status: 404 });
  }

  return NextResponse.json(schedule);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const schedule = await LectureSchedule.findByIdAndDelete(id).lean();

  if (!schedule) {
    return NextResponse.json({ message: "Lecture schedule not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Lecture schedule deleted" });
}
