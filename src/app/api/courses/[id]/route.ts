import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import Course from "@/models/Course";
import { logAudit } from "@/lib/audit/logAudit";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const course = await Course.findById(id).lean();

  if (!course) {
    return NextResponse.json({ message: "Course not found" }, { status: 404 });
  }

  return NextResponse.json(course);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const payload = await request.json();
  const course = await Course.findByIdAndUpdate(id, payload, { returnDocument: "after" }).lean();

  if (!course) {
    return NextResponse.json({ message: "Course not found" }, { status: 404 });
  }

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "COURSE_UPDATED",
    category: "ACADEMIC_STRUCTURE",
    description: `${session?.user?.name ?? "Someone"} updated course ${course.title}`,
    entityType: "Course",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json(course);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const course = await Course.findByIdAndDelete(id).lean();

  if (!course) {
    return NextResponse.json({ message: "Course not found" }, { status: 404 });
  }

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "COURSE_DELETED",
    category: "ACADEMIC_STRUCTURE",
    description: `${session?.user?.name ?? "Someone"} deleted course ${course.title}`,
    entityType: "Course",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json({ message: "Course deleted" });
}
