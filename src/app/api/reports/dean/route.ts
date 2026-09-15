import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import CoordinatorReport from "@/models/CoordinatorReport";
import DeanReport from "@/models/DeanReport";
import { canReviewReport } from "@/lib/auth/reportAccess";
import { resolveReportContext } from "@/lib/auth/reportContext";

const METRIC_KEYS = [
  "studentLectureResponse",
  "studentAssignmentResponse",
  "studentQuizResponse",
  "studentCourseworkResponse",
  "weeklySyllabusCovered",
  "courseMaterialsReleased",
  "examReadiness",
  "supervisorActiveness",
  "studentProgression",
] as const;

const DECISION_STATUSES = new Set(["PENDING", "APPROVED", "REJECTED"]);

export async function GET(request: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toUpperCase().trim();
  if (!session?.user || !["ADMIN", "DEAN", "SUB_DEAN"].includes(role ?? "")) {
    return NextResponse.json({ message: "Only Deans and Sub-Deans may view Dean reports." }, { status: 403 });
  }

  const coordinatorReportId = new URL(request.url).searchParams.get("coordinatorReportId");
  const filter: Record<string, string> = coordinatorReportId ? { coordinatorReportId } : {};
  if (role !== "ADMIN") filter.reviewerRole = role ?? "";
  const reports = await DeanReport.find(filter).populate("coordinatorReportId").populate("reviewerId", "name").sort({ createdAt: -1 }).lean();
  return NextResponse.json(reports);
}

export async function POST(request: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toUpperCase().trim();
  if (!session?.user || !["ADMIN", "DEAN", "SUB_DEAN"].includes(role ?? "")) {
    return NextResponse.json({ message: "Only Deans and Sub-Deans may create Dean reports." }, { status: 403 });
  }

  const body = await request.json();
  const source = await CoordinatorReport.findById(body.coordinatorReportId).lean();
  if (!source) return NextResponse.json({ message: "Coordinator report not found." }, { status: 404 });

  const context = await resolveReportContext("coordinator", source as unknown as Record<string, unknown>);
  if (!canReviewReport(role, session.user.facultyId, context.facultyId)) {
    return NextResponse.json({ message: "This report is outside your assigned faculty." }, { status: 403 });
  }

  const decisions = body.decisions && typeof body.decisions === "object" ? body.decisions as Record<string, unknown> : {};
  const update: Record<string, unknown> = {
    coordinatorReportId: source._id,
    facultyId: context.facultyId,
    departmentId: context.departmentId,
    reviewerId: session.user.id,
    reviewerRole: role,
    overallStatus: body.overallStatus ?? "PENDING",
    submittedAt: new Date(),
  };
  if (!DECISION_STATUSES.has(update.overallStatus as string)) update.overallStatus = "PENDING";
  for (const key of METRIC_KEYS) {
    const decision = decisions[key];
    if (!decision || typeof decision !== "object") continue;
    const value = decision as Record<string, unknown>;
    update[key] = {
      status: DECISION_STATUSES.has(String(value.status)) ? value.status : "PENDING",
      comment: String(value.comment ?? ""),
    };
  }

  const report = await DeanReport.findOneAndUpdate(
    { coordinatorReportId: source._id, reviewerRole: role },
    update,
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  return NextResponse.json(report, { status: 201 });
}