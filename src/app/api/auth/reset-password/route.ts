import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import { hashPassword } from "@/lib/auth";
import User from "@/models/User";
import { logAudit } from "@/lib/audit/logAudit";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ message: "Missing reset data" }, { status: 400 });
    }

    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [email] = decoded.split(":");
    const hashedPassword = await hashPassword(password);
    const user = await User.findOneAndUpdate({ email }, { password: hashedPassword }).lean();

    if (!user) {
      await logAudit({
        userName: email,
        userEmail: email,
        action: "PASSWORD_RESET_COMPLETED",
        category: "AUTH",
        status: "FAILURE",
        description: `Password reset failed: no account found for ${email}`,
        headers: request.headers,
      });
      return NextResponse.json({ message: "Unable to reset password" }, { status: 400 });
    }

    await logAudit({
      userId: String(user._id),
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: "PASSWORD_RESET_COMPLETED",
      category: "AUTH",
      status: "SUCCESS",
      description: `${user.name} reset their password`,
      headers: request.headers,
    });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch {
    return NextResponse.json({ message: "Unable to reset password" }, { status: 500 });
  }
}
