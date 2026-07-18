import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import Report from "@/models/Report";
import Student from "@/models/Student";

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const facultyId = searchParams.get("facultyId");

  const filter: Record<string, string> = {};
  if (status) filter.status = status;
  if (facultyId) filter.facultyId = facultyId;

  const reports = await Report.find(filter).lean();
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

  const report = await Report.create(reportPayload);
  return NextResponse.json(report, { status: 201 });
}
