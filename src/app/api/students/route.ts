import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import Student from "@/models/Student";

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const facultyId = searchParams.get("facultyId");
  const departmentId = searchParams.get("departmentId");
  const email = searchParams.get("email");

  const filter: Record<string, string> = {};
  if (facultyId) filter.facultyId = facultyId;
  if (departmentId) filter.departmentId = departmentId;
  if (email) filter.email = email;

  const students = await Student.find(filter).lean();
  return NextResponse.json(students);
}

export async function POST(request: Request) {
  await connectDB();
  const payload = await request.json();
  const student = await Student.create(payload);
  return NextResponse.json(student, { status: 201 });
}
