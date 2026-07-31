import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import AcademicSession from "@/models/AcademicSession";
import { logAudit } from "@/lib/audit/logAudit";

const SESSION_PATTERN = /^\d{4}\/\d{4}$/;

export async function GET() {
  await connectDB();
  const sessions = await AcademicSession.find({}).sort({ name: -1 }).lean();
  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  await connectDB();
  const authSession = await getServerSession(authOptions);
  const payload = await request.json();
  const name = typeof payload.name === "string" ? payload.name.trim() : "";

  if (!SESSION_PATTERN.test(name)) {
    return NextResponse.json({ message: "Academic session must be two consecutive years, e.g. 2025/2026." }, { status: 400 });
  }

  const [startYear, endYear] = name.split("/").map(Number);
  if (endYear !== startYear + 1) {
    return NextResponse.json({ message: "Academic session years must be consecutive, e.g. 2025/2026." }, { status: 400 });
  }

  const existing = await AcademicSession.findOne({ name }).lean();
  if (existing) {
    return NextResponse.json({ message: "This academic session already exists." }, { status: 409 });
  }

  const count = await AcademicSession.countDocuments();
  const session = await AcademicSession.create({ name, isCurrent: count === 0 });

  await logAudit({
    userId: authSession?.user?.id,
    userName: authSession?.user?.name,
    userEmail: authSession?.user?.email,
    userRole: authSession?.user?.role,
    action: "ACADEMIC_SESSION_CREATED",
    category: "SCHEDULING",
    description: `${authSession?.user?.name ?? "Someone"} created academic session ${session.name}`,
    entityType: "AcademicSession",
    entityId: session._id.toString(),
    headers: request.headers,
  });

  return NextResponse.json(session, { status: 201 });
}
