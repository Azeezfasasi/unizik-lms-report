import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import StudentReport from "@/models/StudentReport";
import { notifyReportEvent } from "@/lib/notify/notifyReportEvent";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const report = await StudentReport.findById(id);

  if (!report) {
    return NextResponse.json({ message: "Report not found" }, { status: 404 });
  }

  report.status = "SUBMITTED";
  report.submittedAt = new Date();
  await report.save();

  notifyReportEvent("student", id, "submitted").catch(() => {});

  return NextResponse.json({ message: "Report submitted successfully", report });
}
