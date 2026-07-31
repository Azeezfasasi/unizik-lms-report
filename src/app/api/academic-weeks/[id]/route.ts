import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import AcademicWeek from "@/models/AcademicWeek";
import { logAudit } from "@/lib/audit/logAudit";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const week = await AcademicWeek.findById(id).lean();

  if (!week) {
    return NextResponse.json({ message: "Academic week not found" }, { status: 404 });
  }

  return NextResponse.json(week);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const payload = await request.json();
  const week = await AcademicWeek.findByIdAndUpdate(id, payload, { new: true }).lean();

  if (!week) {
    return NextResponse.json({ message: "Academic week not found" }, { status: 404 });
  }

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "ACADEMIC_WEEK_UPDATED",
    category: "SCHEDULING",
    description: `${session?.user?.name ?? "Someone"} updated academic week ${week.weekNumber}`,
    entityType: "AcademicWeek",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json(week);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const week = await AcademicWeek.findByIdAndDelete(id).lean();

  if (!week) {
    return NextResponse.json({ message: "Academic week not found" }, { status: 404 });
  }

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "ACADEMIC_WEEK_DELETED",
    category: "SCHEDULING",
    description: `${session?.user?.name ?? "Someone"} deleted academic week ${week.weekNumber}`,
    entityType: "AcademicWeek",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json({ message: "Academic week deleted" });
}
