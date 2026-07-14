import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import LectureSchedule from "@/models/LectureSchedule";

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const curriculumId = searchParams.get("curriculumId");
  const filter = curriculumId ? { curriculumId } : {};
  const schedules = await LectureSchedule.find(filter).lean();
  return NextResponse.json(schedules);
}

export async function POST(request: Request) {
  await connectDB();
  const payload = await request.json();
  const schedule = await LectureSchedule.create(payload);
  return NextResponse.json(schedule, { status: 201 });
}
