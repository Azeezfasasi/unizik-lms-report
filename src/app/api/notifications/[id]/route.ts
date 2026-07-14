import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import Notification from "@/models/Notification";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const notification = await Notification.findById(id).lean();

  if (!notification) {
    return NextResponse.json({ message: "Notification not found" }, { status: 404 });
  }

  return NextResponse.json(notification);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const payload = await request.json();
  const notification = await Notification.findByIdAndUpdate(id, payload, { new: true }).lean();

  if (!notification) {
    return NextResponse.json({ message: "Notification not found" }, { status: 404 });
  }

  return NextResponse.json(notification);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const notification = await Notification.findByIdAndDelete(id).lean();

  if (!notification) {
    return NextResponse.json({ message: "Notification not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Notification deleted" });
}
