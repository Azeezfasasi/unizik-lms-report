import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import { hashPassword } from "@/lib/auth";
import User from "@/models/User";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const user = await User.findById(id).lean();

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const payload = await request.json();

  // Strip empty-string ObjectId fields so Mongoose doesn't attempt to cast "" as an ObjectId
  // Hash the password before saving if provided
  const $unset: Record<string, 1> = {};
  const update: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === "" || value === null || value === undefined) {
      $unset[key] = 1;
    } else if (key === "password" && typeof value === "string") {
      update[key] = await hashPassword(value);
    } else {
      update[key] = value;
    }
  }

  const op: Record<string, unknown> = { $set: update };
  if (Object.keys($unset).length > 0) op.$unset = $unset;

  const user = await User.findByIdAndUpdate(id, op, { returnDocument: "after" }).lean();

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const user = await User.findByIdAndDelete(id).lean();

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "User deleted" });
}
