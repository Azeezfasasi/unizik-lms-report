import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import CoordinatorReport from "@/models/CoordinatorReport";
import { notifyReportEvent } from "@/lib/notify/notifyReportEvent";
import { logAudit } from "@/lib/audit/logAudit";

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
  const session = await getServerSession(authOptions);
  const body = await req.json();

  if (!body.weekId) {
    return NextResponse.json({ message: "Select or create an academic week before submitting this report." }, { status: 400 });
  }

  const report = await CoordinatorReport.create(body);
  notifyReportEvent("coordinator", report._id.toString(), "created").catch(() => {});

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "REPORT_CREATED",
    category: "REPORT",
    description: `${session?.user?.name ?? "Someone"} created a PG Coordinator Report`,
    entityType: "CoordinatorReport",
    entityId: report._id.toString(),
    headers: req.headers,
  });

  return NextResponse.json(report, { status: 201 });
}
