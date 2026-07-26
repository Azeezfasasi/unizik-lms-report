import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import Student from "@/models/Student";
import StudentReport from "@/models/StudentReport";

export async function GET(_request: Request) {
  void _request;
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Not available in production" }, { status: 403 });
  }

  await connectDB();
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;

  if (!email) {
    return NextResponse.json({ message: "No session email" }, { status: 400 });
  }

  const safe = String(email).replace(/[.*+?^${}()|[\\]\\]/g, "\\$&").trim();
  const students = await Student.find({ email: new RegExp(`^${safe}$`, "i") }).lean();
  const reports = await StudentReport.find({}).lean();

  const matchedReports = reports.filter((r) => students.some((s) => String(s._id) === String(r.studentId))).map((r) => String(r._id));

  return NextResponse.json({ sessionEmail: email, matchedStudents: students, matchedReportIds: matchedReports });
}
