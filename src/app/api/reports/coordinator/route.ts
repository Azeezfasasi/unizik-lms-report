import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import CoordinatorReport from "@/models/CoordinatorReport";
import { notifyReportEvent } from "@/lib/notify/notifyReportEvent";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const curriculumId = searchParams.get("curriculumId");

  const filter: Record<string, string> = {};
  if (curriculumId) filter.curriculumId = curriculumId;

  const reports = await CoordinatorReport.find(filter)
    .populate("curriculumId", "programName")
    .populate("preparedBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const report = await CoordinatorReport.create(body);
  notifyReportEvent("coordinator", report._id.toString(), "created").catch(() => {});
  return NextResponse.json(report, { status: 201 });
}
