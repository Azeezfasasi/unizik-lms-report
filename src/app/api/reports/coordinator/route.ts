import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import CoordinatorReport from "@/models/CoordinatorReport";
import { notifyReportEvent } from "@/lib/notify/notifyReportEvent";
import { logAudit } from "@/lib/audit/logAudit";
import Faculty from "@/models/Faculty";
import Department from "@/models/Department";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const curriculumId = searchParams.get("curriculumId");
  const session = await getServerSession(authOptions);

  const filter: Record<string, unknown> = {};
  if (curriculumId) filter.curriculumId = curriculumId;
  if (session?.user?.role?.toUpperCase().trim() === "ASSOCIATE_PROVOST" && session.user.associateProvostField) {
    const faculties = await Faculty.find({ associateProvostField: session.user.associateProvostField }).select("_id").lean();
    const departments = await Department.find({ facultyId: { $in: faculties.map((faculty) => faculty._id) } }).select("_id").lean();
    filter.departmentId = { $in: departments.map((department) => department._id) };
  }

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
  const role = session?.user?.role?.toUpperCase().trim();
  if (!session?.user || !["ADMIN", "HOD", "PG_COORDINATOR"].includes(role ?? "")) {
    return NextResponse.json({ message: "Only HODs and PG Coordinators may submit departmental reports." }, { status: 403 });
  }
  const body = await req.json();

  if (!body.weekId) {
    return NextResponse.json({ message: "Select or create an academic week before submitting this report." }, { status: 400 });
  }

  const report = await CoordinatorReport.create({
    ...body,
    preparedBy: session.user.id,
    reportRole: role === "HOD" ? "HOD" : "PG_COORDINATOR",
    reportFrequency: "WEEKLY",
    status: body.status === "SUBMITTED" ? "SUBMITTED" : "DRAFT",
    submittedAt: body.status === "SUBMITTED" ? new Date() : undefined,
  });
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
