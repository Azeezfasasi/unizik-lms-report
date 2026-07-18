import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import Student from "@/models/Student";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const facultyId = searchParams.get("facultyId");
  const departmentId = searchParams.get("departmentId");
  const emailQuery = searchParams.get("email");

  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role?.toString().toUpperCase().trim();
  let email = emailQuery ?? undefined;
  if (userRole === "STUDENT") {
    email = session?.user?.email ? session.user.email.toString().trim().toLowerCase() : undefined;
  }

  const filter: Record<string, string | RegExp> = {};
  if (facultyId) filter.facultyId = facultyId;
  if (departmentId) filter.departmentId = departmentId;
  if (email) filter.email = new RegExp(`^${escapeRegExp(email)}$`, "i");

  const students = await Student.find(filter).lean();
  return NextResponse.json(students);
}

export async function POST(request: Request) {
  await connectDB();
  const payload = await request.json();
  const student = await Student.create(payload);
  return NextResponse.json(student, { status: 201 });
}
