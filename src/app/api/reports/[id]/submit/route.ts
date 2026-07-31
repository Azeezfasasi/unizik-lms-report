import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import StudentReport from "@/models/StudentReport";
import { notifyReportEvent } from "@/lib/notify/notifyReportEvent";
import { logAudit } from "@/lib/audit/logAudit";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const report = await StudentReport.findById(id);

  if (!report) {
    return NextResponse.json({ message: "Report not found" }, { status: 404 });
  }

  report.status = "SUBMITTED";
  report.submittedAt = new Date();
  await report.save();

  notifyReportEvent("student", id, "submitted").catch(() => {});

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "REPORT_SUBMITTED",
    category: "REPORT",
    description: `${session?.user?.name ?? "Someone"} submitted a Student Report`,
    entityType: "StudentReport",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json({ message: "Report submitted successfully", report });
}
