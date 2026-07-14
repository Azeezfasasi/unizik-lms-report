import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import ExaminerReport from "@/models/ExaminerReport";

const SUBMITTED_OR_LATER = ["SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED", "APPROVED", "REJECTED"];

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const report = await ExaminerReport.findById(id)
    .populate("lecturerId", "name email")
    .populate("moderatorId", "name email")
    .lean();

  if (!report) {
    return NextResponse.json({ message: "Examiner report not found" }, { status: 404 });
  }

  return NextResponse.json(report);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const payload = await request.json();
  const session = await getServerSession(authOptions);

  const existing = await ExaminerReport.findById(id);
  if (!existing) {
    return NextResponse.json({ message: "Examiner report not found" }, { status: 404 });
  }

  const nextStatus = payload.status;
  const statusChanged = nextStatus && nextStatus !== existing.status;

  const update: Record<string, unknown> = { ...payload };

  if (statusChanged) {
    update.statusHistory = [
      ...(existing.statusHistory ?? []),
      {
        status: nextStatus,
        changedBy: session?.user?.id,
        comment: payload.statusComment,
        changedAt: new Date(),
      },
    ];

    if (SUBMITTED_OR_LATER.includes(nextStatus) && !existing.submittedAt) {
      update.submittedAt = new Date();
    }
    if (["APPROVED", "REJECTED"].includes(nextStatus)) {
      update.reviewedAt = new Date();
    }
  }

  const report = await ExaminerReport.findByIdAndUpdate(id, update, { new: true })
    .populate("lecturerId", "name email")
    .populate("moderatorId", "name email")
    .lean();

  return NextResponse.json(report);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const report = await ExaminerReport.findByIdAndDelete(id).lean();

  if (!report) {
    return NextResponse.json({ message: "Examiner report not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Examiner report deleted" });
}
