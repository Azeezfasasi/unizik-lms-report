import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import CoordinatorReport from "@/models/CoordinatorReport";
import { logAudit } from "@/lib/audit/logAudit";
import { canViewAssociateProvostReport } from "@/lib/auth/reportAccess";
import { resolveReportContext } from "@/lib/auth/reportContext";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const associateProvostField = session?.user?.associateProvostField;
  const report = await CoordinatorReport.findById(id)
    .populate("curriculumId", "programName")
    .populate("preparedBy", "name")
    .lean();

  if (!report) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const role = session?.user?.role?.toUpperCase().trim();
  if (role === "ASSOCIATE_PROVOST") {
    const context = await resolveReportContext("coordinator", report as unknown as Record<string, unknown>);
    if (!canViewAssociateProvostReport(role, associateProvostField, context.associateProvostField)) {
      return NextResponse.json({ message: "This report is outside your assigned field." }, { status: 403 });
    }
  }
  return NextResponse.json(report);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const body = await req.json();
  const report = await CoordinatorReport.findByIdAndUpdate(id, body, { new: true });

  if (!report) return NextResponse.json({ message: "Not found" }, { status: 404 });

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "REPORT_UPDATED",
    category: "REPORT",
    description: `${session?.user?.name ?? "Someone"} updated a PG Coordinator Report`,
    entityType: "CoordinatorReport",
    entityId: id,
    headers: req.headers,
  });

  return NextResponse.json(report);
}
