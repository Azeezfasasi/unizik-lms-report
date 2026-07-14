import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import Student from "@/models/Student";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const student = await Student.findById<Record<string, unknown>>(id).lean();

  if (!student) {
    return NextResponse.json({ message: "Student not found" }, { status: 404 });
  }

  return NextResponse.json(student);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const payload = (await request.json()) as Record<string, unknown>;
  const student = await Student.findByIdAndUpdate<Record<string, unknown>>(id, payload, { new: true }).lean();

  if (!student) {
    return NextResponse.json({ message: "Student not found" }, { status: 404 });
  }

  return NextResponse.json(student);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const student = await Student.findByIdAndDelete(id).lean();

  if (!student) {
    return NextResponse.json({ message: "Student not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Student deleted" });
}
