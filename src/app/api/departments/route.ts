import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import Department from "@/models/Department";

export async function GET() {
  await connectDB();
  const departments = await Department.find({}).lean();
  return NextResponse.json(departments);
}

export async function POST(request: Request) {
  await connectDB();
  const payload = await request.json();
  const department = await Department.create(payload);
  return NextResponse.json(department, { status: 201 });
}
