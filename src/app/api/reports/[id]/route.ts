import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import StudentReport from "@/models/StudentReport";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const report = await StudentReport.findById(id).lean();

  if (!report) {
    return NextResponse.json({ message: "Report not found" }, { status: 404 });
  }

  return NextResponse.json(report);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const payload = await request.json();
  const report = await StudentReport.findByIdAndUpdate(id, payload, { new: true });

  if (!report) {
    return NextResponse.json({ message: "Report not found" }, { status: 404 });
  }

  return NextResponse.json(report);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const report = await StudentReport.findByIdAndDelete(id);

  if (!report) {
    return NextResponse.json({ message: "Report not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Report deleted" });
}
