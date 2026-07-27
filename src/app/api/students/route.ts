import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import Student from "@/models/Student";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { sendTransactionalEmail } from "@/lib/email/brevoClient";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const facultyId = searchParams.get("facultyId");
  const departmentId = searchParams.get("departmentId");
  const emailQuery = searchParams.get("email");

  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role?.toString().toUpperCase().trim();
  let email = emailQuery ?? undefined;
  if (userRole === "STUDENT") {
    email = session?.user?.email ? session.user.email.toString().trim().toLowerCase() : undefined;
  }

  const filter: Record<string, string | RegExp> = {};
  if (facultyId) filter.facultyId = facultyId;
  if (departmentId) filter.departmentId = departmentId;
  if (email) filter.email = new RegExp(`^${escapeRegExp(email)}$`, "i");

  const students = await Student.find(filter).lean();
  return NextResponse.json(students);
}

export async function POST(request: Request) {
  await connectDB();
  const payload = await request.json();
  const student = await Student.create(payload);

  // If the student provided an email, ensure a corresponding User exists and send activation/reset link
  try {
    const email = (payload.email || "").toString().trim().toLowerCase();
    const name = (payload.fullName || payload.name || "Student").toString();
    if (email) {
      // Create user record if missing
      let existing = await User.findOne({ email }).lean();
      if (!existing) {
        const randomPassword = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
        const hashed = await hashPassword(randomPassword);
        await User.create({ name, email, password: hashed, role: "STUDENT", isActive: true });
      } else if (!existing.isActive) {
        // If user exists but inactive, mark active
        await User.findOneAndUpdate({ email }, { isActive: true });
      }

      // Send activation/reset link (reuses existing reset flow)
      const token = Buffer.from(`${email}:${Date.now()}`).toString("base64");
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://unizik-lms-report.vercel.app"}/reset-password/${token}`;

      await sendTransactionalEmail({
        to: [{ email, name }],
        sender: { email: process.env.BREVO_SENDER_EMAIL || "noreply@example.com", name: process.env.BREVO_SENDER_NAME || "UNIZIK Reporting Portal" },
        subject: "Activate your UNIZIK reporting portal account",
        htmlContent: `<p>Hello ${name},</p><p>An account has been created for you on the UNIZIK reporting portal. Click the link below to set your password and sign in:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not expect this, ignore this message.</p>`,
      });
    }
  } catch (err) {
    // Don't block student creation on email errors; log and continue
    console.error("Failed to create user or send activation email:", err);
  }

  return NextResponse.json(student, { status: 201 });
}
