import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import ExamTimetable from "@/models/ExamTimetable";

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
  const payload = await request.json();
  const entry = await ExamTimetable.create(payload);
  return NextResponse.json(entry, { status: 201 });
}
