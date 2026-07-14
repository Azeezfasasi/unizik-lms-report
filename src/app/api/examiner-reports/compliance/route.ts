import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getExaminerReportCompliance } from "@/lib/data/portal";

const ALLOWED_ROLES = ["ADMIN", "FACULTY_OFFICER"];

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ message: "You are not permitted to view compliance reports." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const academicSession = searchParams.get("academicSession");
  const semester = searchParams.get("semester") as "FIRST" | "SECOND" | null;

  if (!academicSession) {
    return NextResponse.json({ message: "academicSession query parameter is required." }, { status: 400 });
  }

  const summary = await getExaminerReportCompliance(academicSession, semester ?? undefined);
  return NextResponse.json(summary);
}
