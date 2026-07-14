import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import ExaminerReport from "@/models/ExaminerReport";

const REQUIRED_FIELDS = [
  "facultyId",
  "departmentId",
  "courseId",
  "academicSession",
  "semester",
  "examType",
] as const;

const SUBMITTED_OR_LATER = ["SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED", "APPROVED", "REJECTED"];

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);

  const filter: Record<string, unknown> = {};
  for (const key of ["facultyId", "departmentId", "courseId", "lecturerId", "academicSession", "semester", "status"]) {
    const value = searchParams.get(key);
    if (value) filter[key] = value;
  }

  const reports = await ExaminerReport.find(filter)
    .populate("lecturerId", "name email")
    .populate("moderatorId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(reports);
}

export async function POST(request: Request) {
  await connectDB();
  const payload = await request.json();

  if (!payload.lecturerId && !payload.externalExaminerName) {
    return NextResponse.json(
      { message: "Either lecturerId or externalExaminerName is required." },
      { status: 400 }
    );
  }

  const missingField = REQUIRED_FIELDS.find((field) => !payload[field]);
  if (missingField) {
    return NextResponse.json({ message: `${missingField} is required.` }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const status = payload.status ?? "DRAFT";

  const report = await ExaminerReport.create({
    ...payload,
    status,
    submittedAt: SUBMITTED_OR_LATER.includes(status) ? payload.submittedAt ?? new Date() : payload.submittedAt,
    statusHistory: [
      {
        status,
        changedBy: session?.user?.id,
        changedAt: new Date(),
      },
    ],
  });

  return NextResponse.json(report, { status: 201 });
}
