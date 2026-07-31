import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import TeachingAssignment from "@/models/TeachingAssignment";
import { logAudit } from "@/lib/audit/logAudit";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const assignment = await TeachingAssignment.findById(id).populate("lecturerId", "name email").lean();

  if (!assignment) {
    return NextResponse.json({ message: "Teaching assignment not found" }, { status: 404 });
  }

  return NextResponse.json(assignment);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const payload = await request.json();
  const assignment = await TeachingAssignment.findByIdAndUpdate(id, payload, { new: true }).lean();

  if (!assignment) {
    return NextResponse.json({ message: "Teaching assignment not found" }, { status: 404 });
  }

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "TEACHING_ASSIGNMENT_UPDATED",
    category: "SCHEDULING",
    description: `${session?.user?.name ?? "Someone"} updated a teaching assignment`,
    entityType: "TeachingAssignment",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json(assignment);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const assignment = await TeachingAssignment.findByIdAndDelete(id).lean();

  if (!assignment) {
    return NextResponse.json({ message: "Teaching assignment not found" }, { status: 404 });
  }

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "TEACHING_ASSIGNMENT_DELETED",
    category: "SCHEDULING",
    description: `${session?.user?.name ?? "Someone"} deleted a teaching assignment`,
    entityType: "TeachingAssignment",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json({ message: "Teaching assignment deleted" });
}
