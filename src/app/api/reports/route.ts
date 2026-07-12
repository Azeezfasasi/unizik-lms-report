import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import Report from "@/models/Report";

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const facultyId = searchParams.get("facultyId");

  const filter: Record<string, string> = {};
  if (status) filter.status = status;
  if (facultyId) filter.facultyId = facultyId;

  const reports = await Report.find(filter).lean();
  return NextResponse.json(reports);
}

export async function POST(request: Request) {
  await connectDB();
  const payload = await request.json();
  const report = await Report.create(payload);
  return NextResponse.json(report, { status: 201 });
}
