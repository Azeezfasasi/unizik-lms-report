import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import StudentReport from "@/models/StudentReport";
import Student from "@/models/Student";
import { notifyReportEvent } from "@/lib/notify/notifyReportEvent";
import { logAudit } from "@/lib/audit/logAudit";

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const facultyId = searchParams.get("facultyId");

  const filter: Record<string, string> = {};
  if (status) filter.status = status;
  if (facultyId) filter.facultyId = facultyId;

  const reports = await StudentReport.find(filter).lean();
  return NextResponse.json(reports);
}

export async function POST(request: Request) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const payload = await request.json();

  let reportPayload = payload;
  if (session?.user?.role === "STUDENT") {
    if (!session.user.email) {
      return NextResponse.json({ message: "Unable to determine student from session." }, { status: 403 });
    }

    const student = await Student.findOne({ email: session.user.email }).lean();
    if (!student) {
      return NextResponse.json({ message: "No student record found for the signed-in user." }, { status: 403 });
    }

    reportPayload = {
      ...payload,
      studentId: student._id,
      facultyId: student.facultyId ?? payload.facultyId,
      curriculumId: student.curriculumId ?? payload.curriculumId,
    };
  }

  const report = await StudentReport.create(reportPayload);
  notifyReportEvent("student", report._id.toString(), "created").catch(() => {});

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "REPORT_CREATED",
    category: "REPORT",
    description: `${session?.user?.name ?? "Someone"} created a Student Report`,
    entityType: "StudentReport",
    entityId: report._id.toString(),
    headers: request.headers,
  });

  return NextResponse.json(report, { status: 201 });
}
