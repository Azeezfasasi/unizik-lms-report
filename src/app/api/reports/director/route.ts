import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import { getDirectorSummary } from "@/lib/data/portal";

const ALLOWED_ROLES = ["ADMIN", "FACULTY_OFFICER", "PG_COORDINATOR", "DIRECTOR"];

export async function GET(request: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || !ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const academicSession = searchParams.get("academicSession") ?? undefined;
  const rawSemester = searchParams.get("semester");
  const semester = rawSemester === "FIRST" || rawSemester === "SECOND" ? rawSemester : undefined;

  const summary = await getDirectorSummary(academicSession, semester);
  return NextResponse.json(summary);
}
