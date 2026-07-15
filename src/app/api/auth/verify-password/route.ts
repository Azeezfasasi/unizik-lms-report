import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import { verifyPassword } from "@/lib/auth";
import User from "@/models/User";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { userId, password } = await request.json();

  // Only allow verifying your own password
  if (userId !== session.user.id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const user = await User.findById(userId).select("+password").lean();

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const valid = await verifyPassword(password, user.password ?? "");
  if (!valid) {
    return NextResponse.json({ message: "Incorrect password" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
