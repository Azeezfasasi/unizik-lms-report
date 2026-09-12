import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import { getPortalSession, canReviewReport, REVIEWER_ROLES } from "@/lib/auth/reportAccess";
import { resolveReportContext } from "@/lib/auth/reportContext";
import { REPORT_MODEL_MAP, type ReportKey } from "@/lib/reports/reportRegistry";
import { logAudit } from "@/lib/audit/logAudit";

const REVIEW_STATUSES = ["UNDER_REVIEW", "APPROVED", "REJECTED", "REVISION_REQUESTED"] as const;
const VALID_TYPES = new Set(Object.keys(REPORT_MODEL_MAP));

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  await connectDB();
  const session = await getPortalSession();
  const role = session?.user?.role?.toUpperCase().trim();
  if (!session?.user || !REVIEWER_ROLES.includes(role as (typeof REVIEWER_ROLES)[number])) {
    return NextResponse.json({ message: "Only a Dean or Sub-Dean may review reports." }, { status: 403 });
  }

  const { type, id } = await params;
  if (!VALID_TYPES.has(type)) return NextResponse.json({ message: "Unknown report type." }, { status: 400 });

  const body = await request.json();
  const nextStatus = body.status as string;
  if (!REVIEW_STATUSES.includes(nextStatus as (typeof REVIEW_STATUSES)[number])) {
    return NextResponse.json({ message: "Invalid review status." }, { status: 400 });
  }
  if (["REJECTED", "REVISION_REQUESTED"].includes(nextStatus) && !String(body.comment ?? "").trim()) {
    return NextResponse.json({ message: "A comment is required when returning a report." }, { status: 400 });
  }

  type ReviewModel = {
    findById: (value: string) => { then: (resolve: (value: { toObject?: () => Record<string, unknown> } | null) => unknown) => unknown };
    findByIdAndUpdate: (value: string, update: unknown, options: unknown) => Promise<unknown>;
  };
  const model = REPORT_MODEL_MAP[type as ReportKey] as ReviewModel;
  const existing = await model.findById(id);
  if (!existing) return NextResponse.json({ message: "Report not found." }, { status: 404 });

  const context = await resolveReportContext(type, existing.toObject ? existing.toObject() : existing);
  if (!canReviewReport(role, session.user.facultyId, context.facultyId)) {
    return NextResponse.json({ message: "This report is outside your assigned faculty." }, { status: 403 });
  }

  const report = await model.findByIdAndUpdate(
    id,
    { status: nextStatus, reviewedAt: ["APPROVED", "REJECTED"].includes(nextStatus) ? new Date() : undefined },
    { new: true, runValidators: true }
  );

  await logAudit({
    userId: session.user.id,
    userName: session.user.name,
    userEmail: session.user.email,
    userRole: role,
    action: "REPORT_STATUS_CHANGED",
    category: "REPORT",
    description: `${session.user.name ?? "Someone"} changed ${type} report ${id} to ${nextStatus}`,
    entityType: "Report",
    entityId: id,
    metadata: { reportType: type, comment: body.comment },
    headers: request.headers,
  });

  return NextResponse.json(report);
}