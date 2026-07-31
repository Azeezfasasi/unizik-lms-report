import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import { hashPassword } from "@/lib/auth";
import User from "@/models/User";
import { logAudit } from "@/lib/audit/logAudit";

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
  const session = await getServerSession(authOptions);
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

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "USER_UPDATED",
    category: "USER",
    description: `${session?.user?.name ?? "Someone"} updated user ${user.name}`,
    entityType: "User",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json(user);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const user = await User.findByIdAndDelete(id).lean();

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "USER_DELETED",
    category: "USER",
    description: `${session?.user?.name ?? "Someone"} deleted user ${user.name}`,
    entityType: "User",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json({ message: "User deleted" });
}
