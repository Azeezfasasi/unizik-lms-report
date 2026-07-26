import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import SupervisorReport from "@/models/SupervisorReport";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;

  const report = await SupervisorReport.findByIdAndUpdate(
    id,
    { status: "SUBMITTED", submittedAt: new Date() },
    { new: true }
  );

  if (!report) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(report);
}
