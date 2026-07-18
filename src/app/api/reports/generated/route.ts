import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import GeneratedReportFile from "@/models/GeneratedReportFile";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const reportType = searchParams.get("type");
  const format = searchParams.get("format");

  const filter: Record<string, string> = {};
  if (reportType) filter.reportType = reportType;
  if (format) filter.format = format;

  const files = await GeneratedReportFile.find(filter)
    .populate("generatedBy", "name")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  return NextResponse.json(files);
}
