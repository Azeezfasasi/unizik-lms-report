import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import { getDirectorSummary } from "@/lib/data/portal";
import { getAdapter } from "@/lib/export/adapters";
import { buildPdfBuffer } from "@/lib/export/toPdf";
import { buildWordBuffer } from "@/lib/export/toWord";
import { buildExcelBuffer } from "@/lib/export/toExcel";
import { sendTransactionalEmail } from "@/lib/email/brevoClient";
import { uploadAndRegister } from "@/lib/export/uploadAndRegister";
import DirectorReview from "@/models/DirectorReview";

const ALLOWED_ROLES = ["ADMIN", "FACULTY_OFFICER", "PG_COORDINATOR", "DIRECTOR"];

export async function POST(request: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || !ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const email = body.email as string;
    const name = body.name as string;
    const subject = body.subject as string;
    const htmlContent = body.htmlContent as string;
    const academicSession = body.academicSession as string | undefined;
    const semester = body.semester as "FIRST" | "SECOND" | undefined;
    const format = (body.format as string | undefined)?.toUpperCase() || "PDF";

    if (!email || !subject || !htmlContent) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const summary = await getDirectorSummary(academicSession, semester);
    const payload = getAdapter("DIRECTOR")(summary);

    let buffer: Buffer;
    let mimeType: string;
    let fileName: string;

    if (format === "DOCX") {
      buffer = await buildWordBuffer(payload);
      mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      fileName = `director-summary-${academicSession ?? "all"}${semester ? `-${semester}` : ""}-${Date.now()}.docx`;
    } else if (format === "XLSX") {
      buffer = await buildExcelBuffer(payload);
      mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      fileName = `director-summary-${academicSession ?? "all"}${semester ? `-${semester}` : ""}-${Date.now()}.xlsx`;
    } else {
      buffer = await buildPdfBuffer(payload);
      mimeType = "application/pdf";
      fileName = `director-summary-${academicSession ?? "all"}${semester ? `-${semester}` : ""}-${Date.now()}.pdf`;
    }

    const generatedFile = await uploadAndRegister({
      buffer,
      fileName,
      format: format === "DOCX" ? "DOCX" : format === "XLSX" ? "XLSX" : "PDF",
      reportType: "DIRECTOR",
      generatedBy: session.user.id,
    });

    await sendTransactionalEmail({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL || "noreply@example.com",
        name: process.env.BREVO_SENDER_NAME || "UNIZIK Portal",
      },
      to: [{ email, name }],
      subject,
      htmlContent,
      attachment: [
        {
          content: buffer.toString("base64"),
          name: fileName,
          contentType: mimeType,
        },
      ],
    });

    const review = await DirectorReview.create({
      period: `${academicSession ?? "all"}${semester ? `-${semester}` : ""}`,
      academicSession,
      semester,
      includedReports: [],
      generatedFile: generatedFile._id,
      sentBy: session.user.id,
      sentToEmail: email,
      sentToName: name,
      subject,
      htmlContent,
    });

    return NextResponse.json({ generatedFile, review }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send summary email.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
