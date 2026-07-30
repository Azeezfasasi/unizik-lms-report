import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import AcademicWeek from "@/models/AcademicWeek";

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const curriculumId = searchParams.get("curriculumId");
  const courseId = searchParams.get("courseId");
  const academicSession = searchParams.get("academicSession");
  const semester = searchParams.get("semester");

  const filter: Record<string, string> = {};
  if (curriculumId) filter.curriculumId = curriculumId;
  if (courseId) filter.courseId = courseId;
  if (academicSession) filter.academicSession = academicSession;
  if (semester) filter.semester = semester;

  const weeks = await AcademicWeek.find(filter)
    .populate("curriculumId", "programName")
    .populate("courseId", "title code")
    .sort({ weekNumber: 1 })
    .lean();

  return NextResponse.json(weeks);
}

export async function POST(request: Request) {
  await connectDB();
  const payload = await request.json();

  if (!payload.curriculumId) {
    return NextResponse.json({ message: "curriculumId is required" }, { status: 400 });
  }

  if (!payload.courseId) {
    return NextResponse.json({ message: "courseId is required" }, { status: 400 });
  }

  if (!payload.weekNumber) {
    return NextResponse.json({ message: "weekNumber is required" }, { status: 400 });
  }

  const week = await AcademicWeek.create(payload);
  return NextResponse.json(week, { status: 201 });
}
