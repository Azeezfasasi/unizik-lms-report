import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import WeeklyEffectivenessReport from "@/models/WeeklyEffectivenessReport";
import { notifyReportEvent } from "@/lib/notify/notifyReportEvent";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;

  const report = await WeeklyEffectivenessReport.findByIdAndUpdate(
    id,
    { status: "SUBMITTED", submittedAt: new Date() },
    { new: true }
  );

  if (!report) return NextResponse.json({ message: "Not found" }, { status: 404 });

  notifyReportEvent("weekly-effectiveness", id, "submitted").catch(() => {});

  return NextResponse.json(report);
}
