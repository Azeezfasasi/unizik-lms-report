import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import SupervisorReport from "@/models/SupervisorReport";
import { notifyReportEvent } from "@/lib/notify/notifyReportEvent";
import { logAudit } from "@/lib/audit/logAudit";

export async function GET(request: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || !["ADMIN", "SUPERVISOR", "PG_COORDINATOR"].includes(session.user.role)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const facultyId = searchParams.get("facultyId");
  const departmentId = searchParams.get("departmentId");

  const filter: Record<string, unknown> = {};
  if (facultyId) filter.facultyId = facultyId;
  if (departmentId) filter.departmentId = departmentId;

  const reports = await SupervisorReport.find(filter)
    .populate("facultyId", "name")
    .populate("departmentId", "name")
    .populate("submittedBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(reports);
}

export async function POST(request: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session?.user?.role || !["ADMIN", "SUPERVISOR"].includes(session.user.role)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();

  if (!body.curriculumId) {
    return NextResponse.json({ message: "Select a curriculum before submitting this report." }, { status: 400 });
  }

  if (!body.projectTitle?.trim() || !body.milestone?.trim() || !body.progressSummary?.trim()) {
    return NextResponse.json({ message: "Provide the project or thesis title, milestone, and progress summary." }, { status: 400 });
  }

  const report = await SupervisorReport.create({
    ...body,
    submittedBy: session.user.id,
    status: body.status || "DRAFT",
    submittedAt: body.status === "SUBMITTED" ? new Date() : undefined,
  });

  notifyReportEvent("supervisor", report._id.toString(), "created").catch(() => {});

  await logAudit({
    userId: session.user.id,
    userName: session.user.name,
    userEmail: session.user.email,
    userRole: session.user.role,
    action: "REPORT_CREATED",
    category: "REPORT",
    description: `${session.user.name ?? "Someone"} created a Supervisor Report`,
    entityType: "SupervisorReport",
    entityId: report._id.toString(),
    headers: request.headers,
  });

  return NextResponse.json(report, { status: 201 });
}
