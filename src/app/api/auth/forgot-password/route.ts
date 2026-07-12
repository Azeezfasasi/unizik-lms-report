import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import User from "@/models/User";
import { sendTransactionalEmail } from "@/lib/email/brevoClient";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email } = await request.json();
    const user = await User.findOne({ email }).lean();

    if (!user) {
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

    return NextResponse.json({ message: "Reset instructions sent." });
  } catch {
    return NextResponse.json({ message: "Unable to issue reset request" }, { status: 500 });
  }
}
