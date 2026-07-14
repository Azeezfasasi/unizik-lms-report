import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import TeachingAssignment from "@/models/TeachingAssignment";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const assignment = await TeachingAssignment.findById(id).populate("lecturerId", "name email").lean();

  if (!assignment) {
    return NextResponse.json({ message: "Teaching assignment not found" }, { status: 404 });
  }

  return NextResponse.json(assignment);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const payload = await request.json();
  const assignment = await TeachingAssignment.findByIdAndUpdate(id, payload, { new: true }).lean();

  if (!assignment) {
    return NextResponse.json({ message: "Teaching assignment not found" }, { status: 404 });
  }

  return NextResponse.json(assignment);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const assignment = await TeachingAssignment.findByIdAndDelete(id).lean();

  if (!assignment) {
    return NextResponse.json({ message: "Teaching assignment not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Teaching assignment deleted" });
}
