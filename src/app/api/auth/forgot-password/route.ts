import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import User from "@/models/User";
import { sendTransactionalEmail } from "@/lib/email/brevoClient";
import { logAudit } from "@/lib/audit/logAudit";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email } = await request.json();
    const user = await User.findOne({ email }).lean();

    if (!user) {
      await logAudit({
        userName: email,
        userEmail: email,
        action: "PASSWORD_RESET_REQUESTED",
        category: "AUTH",
        status: "FAILURE",
        description: `Password reset requested for unknown email ${email}`,
        headers: request.headers,
      });
      return NextResponse.json({ message: "If the address exists, a reset link has been sent." });
    }

    const token = Buffer.from(`${email}:${Date.now()}`).toString("base64");
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password/${token}`;

    await sendTransactionalEmail({
      to: [{ email, name: user.name }],
      sender: { email: process.env.BREVO_SENDER_EMAIL || "noreply@example.com", name: process.env.BREVO_SENDER_NAME || "UNIZIK Portal" },
      subject: "Reset your UNIZIK portal password",
      htmlContent: `<p>Hello ${user.name},</p><p>Use the following link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    await logAudit({
      userId: String(user._id),
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: "PASSWORD_RESET_REQUESTED",
      category: "AUTH",
      status: "SUCCESS",
      description: `${user.name} requested a password reset`,
      headers: request.headers,
    });

    return NextResponse.json({ message: "Reset instructions sent." });
  } catch {
    return NextResponse.json({ message: "Unable to issue reset request" }, { status: 500 });
  }
}
