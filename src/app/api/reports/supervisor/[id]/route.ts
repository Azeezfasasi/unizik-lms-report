import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import SupervisorReport from "@/models/SupervisorReport";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const report = await SupervisorReport.findById(id)
    .populate("facultyId", "name")
    .populate("departmentId", "name")
    .populate("submittedBy", "name")
    .lean();

  if (!report) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(report);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const body = await req.json();

  const report = await SupervisorReport.findByIdAndUpdate(id, body, { new: true });
  if (!report) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(report);
}
