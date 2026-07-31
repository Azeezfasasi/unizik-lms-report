import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import Student from "@/models/Student";
import { logAudit } from "@/lib/audit/logAudit";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const student = await Student.findById<Record<string, unknown>>(id).lean();

  if (!student) {
    return NextResponse.json({ message: "Student not found" }, { status: 404 });
  }

  return NextResponse.json(student);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const payload = (await request.json()) as Record<string, unknown>;
  const student = await Student.findByIdAndUpdate<Record<string, unknown>>(id, payload, { new: true }).lean();

  if (!student) {
    return NextResponse.json({ message: "Student not found" }, { status: 404 });
  }

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "STUDENT_UPDATED",
    category: "STUDENT",
    description: `${session?.user?.name ?? "Someone"} updated student ${(student as { fullName?: string }).fullName ?? id}`,
    entityType: "Student",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json(student);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const student = await Student.findByIdAndDelete(id).lean();

  if (!student) {
    return NextResponse.json({ message: "Student not found" }, { status: 404 });
  }

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "STUDENT_DELETED",
    category: "STUDENT",
    description: `${session?.user?.name ?? "Someone"} deleted student ${(student as { fullName?: string }).fullName ?? id}`,
    entityType: "Student",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json({ message: "Student deleted" });
}
