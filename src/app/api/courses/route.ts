import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import Course from "@/models/Course";
import { logAudit } from "@/lib/audit/logAudit";

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
  const session = await getServerSession(authOptions);
  const payload = await request.json();
  const course = await Course.create(payload);

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "COURSE_CREATED",
    category: "ACADEMIC_STRUCTURE",
    description: `${session?.user?.name ?? "Someone"} created course ${course.title}`,
    entityType: "Course",
    entityId: course._id.toString(),
    headers: request.headers,
  });

  return NextResponse.json(course, { status: 201 });
}
