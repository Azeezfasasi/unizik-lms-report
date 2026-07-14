import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import Department from "@/models/Department";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const department = await Department.findById(id).lean();

  if (!department) {
    return NextResponse.json({ message: "Department not found" }, { status: 404 });
  }

  return NextResponse.json(department);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const payload = await request.json();
  const department = await Department.findByIdAndUpdate(id, payload, { new: true }).lean();

  if (!department) {
    return NextResponse.json({ message: "Department not found" }, { status: 404 });
  }

  return NextResponse.json(department);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const department = await Department.findByIdAndDelete(id).lean();

  if (!department) {
    return NextResponse.json({ message: "Department not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Department deleted" });
}
