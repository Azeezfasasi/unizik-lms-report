import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import Curriculum from "@/models/Curriculum";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const curriculum = await Curriculum.findById(id).lean();

  if (!curriculum) {
    return NextResponse.json({ message: "Curriculum not found" }, { status: 404 });
  }

  return NextResponse.json(curriculum);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const payload = await request.json();
  const curriculum = await Curriculum.findByIdAndUpdate(id, payload, { new: true });

  if (!curriculum) {
    return NextResponse.json({ message: "Curriculum not found" }, { status: 404 });
  }

  return NextResponse.json(curriculum);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const curriculum = await Curriculum.findByIdAndDelete(id);

  if (!curriculum) {
    return NextResponse.json({ message: "Curriculum not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Curriculum deleted" });
}
