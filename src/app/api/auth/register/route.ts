import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await connectDB();
    const payload = await request.json();

    const existing = await User.findOne({ email: payload.email }).lean();
    if (existing) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    const user = await User.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role ?? "STUDENT",
      isActive: true,
    });

    return NextResponse.json({ user: { id: user._id.toString(), email: user.email, role: user.role } }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Unable to create account" }, { status: 500 });
  }
}
