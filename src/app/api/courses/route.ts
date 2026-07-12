import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import Course from "@/models/Course";

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const curriculumId = searchParams.get("curriculumId");

  const filter = curriculumId ? { curriculumId } : {};
  const courses = await Course.find(filter).lean();
  return NextResponse.json(courses);
}

export async function POST(request: Request) {
  await connectDB();
  const payload = await request.json();
  const course = await Course.create(payload);
  return NextResponse.json(course, { status: 201 });
}
