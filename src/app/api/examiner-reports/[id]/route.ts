import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import ExaminerReport from "@/models/ExaminerReport";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const report = await ExaminerReport.findById(id).lean();

  if (!report) {
    return NextResponse.json({ message: "Examiner report not found" }, { status: 404 });
  }

  return NextResponse.json(report);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const payload = await request.json();
  const report = await ExaminerReport.findByIdAndUpdate(id, payload, { new: true }).lean();

  if (!report) {
    return NextResponse.json({ message: "Examiner report not found" }, { status: 404 });
  }

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
