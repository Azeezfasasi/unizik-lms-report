import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import Faculty from "@/models/Faculty";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const faculty = await Faculty.findById(id).lean();

  if (!faculty) {
    return NextResponse.json({ message: "Faculty not found" }, { status: 404 });
  }

  return NextResponse.json(faculty);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const payload = await request.json();
  const faculty = await Faculty.findByIdAndUpdate(id, payload, { new: true }).lean();

  if (!faculty) {
    return NextResponse.json({ message: "Faculty not found" }, { status: 404 });
  }

  return NextResponse.json(faculty);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const faculty = await Faculty.findByIdAndDelete(id).lean();

  if (!faculty) {
    return NextResponse.json({ message: "Faculty not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Faculty deleted" });
}
