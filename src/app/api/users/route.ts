import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import { hashPassword } from "@/lib/auth";
import User from "@/models/User";
import { logAudit } from "@/lib/audit/logAudit";

export async function GET() {
  await connectDB();
  const users = await User.find({}).lean();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const payload = await request.json();
  const hashedPassword = await hashPassword(payload.password);
  const user = await User.create({
    ...payload,
    password: hashedPassword,
  });

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "USER_CREATED",
    category: "USER",
    description: `${session?.user?.name ?? "Someone"} created user ${user.name} (${user.role})`,
    entityType: "User",
    entityId: user._id.toString(),
    headers: request.headers,
  });

  return NextResponse.json(user, { status: 201 });
}
