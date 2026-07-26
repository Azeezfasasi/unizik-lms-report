import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import { getDirectorSummary } from "@/lib/data/portal";
import { getAdapter } from "@/lib/export/adapters";
import { buildPdfBuffer } from "@/lib/export/toPdf";
import { uploadAndRegister } from "@/lib/export/uploadAndRegister";

const ALLOWED_ROLES = ["ADMIN", "FACULTY_OFFICER", "PG_COORDINATOR", "DIRECTOR"];

export async function POST(request: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || !ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const academicSession = body.academicSession as string | undefined;
  const semester = body.semester as "FIRST" | "SECOND" | undefined;

  const summary = await getDirectorSummary(academicSession, semester);
  const payload = getAdapter("DIRECTOR")(summary);
  const buffer = await buildPdfBuffer(payload);
  const fileName = `director-summary-${academicSession ?? "all"}${semester ? `-${semester}` : ""}-${Date.now()}.pdf`;

  const generatedFile = await uploadAndRegister({
    buffer,
    fileName,
    format: "PDF",
    reportType: "DIRECTOR",
    generatedBy: session.user.id,
  });

  return NextResponse.json(generatedFile, { status: 201 });
}
