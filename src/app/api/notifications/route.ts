import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import Notification from "@/models/Notification";

export async function GET() {
  await connectDB();
  const notifications = await Notification.find({}).lean();
  return NextResponse.json(notifications);
}

export async function POST(request: Request) {
  await connectDB();
  const payload = await request.json();
  const notification = await Notification.create(payload);
  return NextResponse.json(notification, { status: 201 });
}
