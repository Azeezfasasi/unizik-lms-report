import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import User from "@/models/User";

export async function GET() {
  await connectDB();
  const users = await User.find({}).lean();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  await connectDB();
  const payload = await request.json();
  const user = await User.create(payload);
  return NextResponse.json(user, { status: 201 });
}
