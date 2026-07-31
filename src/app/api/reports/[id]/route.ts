import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import StudentReport from "@/models/StudentReport";
import { logAudit } from "@/lib/audit/logAudit";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const report = await StudentReport.findById(id).lean();

  if (!report) {
    return NextResponse.json({ message: "Report not found" }, { status: 404 });
  }

  return NextResponse.json(report);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const payload = await request.json();
  const report = await StudentReport.findByIdAndUpdate(id, payload, { new: true });

  if (!report) {
    return NextResponse.json({ message: "Report not found" }, { status: 404 });
  }

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "REPORT_UPDATED",
    category: "REPORT",
    description: `${session?.user?.name ?? "Someone"} updated a Student Report`,
    entityType: "StudentReport",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json(report);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const report = await StudentReport.findByIdAndDelete(id);

  if (!report) {
    return NextResponse.json({ message: "Report not found" }, { status: 404 });
  }

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "REPORT_DELETED",
    category: "REPORT",
    description: `${session?.user?.name ?? "Someone"} deleted a Student Report`,
    entityType: "StudentReport",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json({ message: "Report deleted" });
}
