import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import Report from "@/models/Report";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const report = await Report.findById(id);

  if (!report) {
    return NextResponse.json({ message: "Report not found" }, { status: 404 });
  }

  report.status = "SUBMITTED";
  report.submittedAt = new Date();
  await report.save();

  return NextResponse.json({ message: "Report submitted successfully", report });
}
