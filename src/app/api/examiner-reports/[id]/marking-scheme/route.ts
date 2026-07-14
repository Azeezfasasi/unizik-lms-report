import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import ExaminerReport from "@/models/ExaminerReport";

// The marking scheme is the answer key for the exam. Unlike the question
// paper, it must never be served from a bare public URL — only ADMIN,
// FACULTY_OFFICER, or the assigned moderator may retrieve it, and only
// through this authenticated, role-checked route.
const ALLOWED_ROLES = ["ADMIN", "FACULTY_OFFICER"];

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  await connectDB();
  const { id } = await params;
  const report = await ExaminerReport.findById(id).lean();

  if (!report) {
    return NextResponse.json({ message: "Examiner report not found" }, { status: 404 });
  }

  const role = session.user.role;
  const userId = session.user.id;
  const isModerator = Boolean(userId) && String(report.moderatorId ?? "") === userId;
  const isAuthorized = ALLOWED_ROLES.includes(role) || isModerator;

  if (!isAuthorized) {
    return NextResponse.json({ message: "You are not permitted to access the marking scheme." }, { status: 403 });
  }

  if (!report.markingSchemeUrl) {
    return NextResponse.json({ message: "No marking scheme has been uploaded for this report." }, { status: 404 });
  }

  const upstream = await fetch(report.markingSchemeUrl);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ message: "Unable to retrieve the marking scheme file." }, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  const extension = contentType.includes("pdf") ? "pdf" : "bin";

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="marking-scheme-${id}.${extension}"`,
      "Cache-Control": "no-store",
    },
  });
}
