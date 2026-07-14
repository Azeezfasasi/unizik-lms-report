import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import ExaminerReport from "@/models/ExaminerReport";

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const facultyId = searchParams.get("facultyId");
  const filter = facultyId ? { facultyId } : {};
  const reports = await ExaminerReport.find(filter).lean();
  return NextResponse.json(reports);
}

export async function POST(request: Request) {
  await connectDB();
  const payload = await request.json();
  const report = await ExaminerReport.create(payload);
  return NextResponse.json(report, { status: 201 });
}
