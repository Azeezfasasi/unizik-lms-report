import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import AcademicSession from "@/models/AcademicSession";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const payload = await request.json();

  if (payload.isCurrent === true) {
    await AcademicSession.updateMany({ _id: { $ne: id } }, { isCurrent: false });
  }

  const session = await AcademicSession.findByIdAndUpdate(id, payload, { new: true }).lean();
  if (!session) {
    return NextResponse.json({ message: "Academic session not found" }, { status: 404 });
  }

  return NextResponse.json(session);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const session = await AcademicSession.findByIdAndDelete(id).lean();

  if (!session) {
    return NextResponse.json({ message: "Academic session not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Academic session deleted" });
}
