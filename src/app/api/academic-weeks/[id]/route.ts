import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import AcademicWeek from "@/models/AcademicWeek";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const week = await AcademicWeek.findById(id).lean();

  if (!week) {
    return NextResponse.json({ message: "Academic week not found" }, { status: 404 });
  }

  return NextResponse.json(week);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const payload = await request.json();
  const week = await AcademicWeek.findByIdAndUpdate(id, payload, { new: true }).lean();

  if (!week) {
    return NextResponse.json({ message: "Academic week not found" }, { status: 404 });
  }

  return NextResponse.json(week);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const week = await AcademicWeek.findByIdAndDelete(id).lean();

  if (!week) {
    return NextResponse.json({ message: "Academic week not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Academic week deleted" });
}
