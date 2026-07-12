import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ message: "Missing reset data" }, { status: 400 });
    }

    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [email] = decoded.split(":");
    await User.findOneAndUpdate({ email }, { password });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch {
    return NextResponse.json({ message: "Unable to reset password" }, { status: 500 });
  }
}
