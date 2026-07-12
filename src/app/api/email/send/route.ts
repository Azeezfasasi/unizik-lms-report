import { NextResponse } from "next/server";
import sendTransactionalEmail from "@/lib/email/brevoClient";

export async function POST(request: Request) {
  const { email, name, reportId } = await request.json();

  const sendSmtpEmail = {
    to: [{ email, name }],
    sender: { email: process.env.BREVO_SENDER_EMAIL || "noreply@example.com", name: process.env.BREVO_SENDER_NAME || "UNIZIK Portal" },
    subject: "Your report update",
    htmlContent: `<p>Hi ${name},</p><p>Your report ${reportId} has been processed.</p>`,
  };

  try {
    await sendTransactionalEmail(sendSmtpEmail);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Email delivery failed" }, { status: 500 });
  }
}
