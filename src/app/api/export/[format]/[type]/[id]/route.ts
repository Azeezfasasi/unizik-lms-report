import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import { getAdapter } from "@/lib/export/adapters";
import { buildExcelBuffer } from "@/lib/export/toExcel";
import { buildWordBuffer } from "@/lib/export/toWord";
import { buildPdfBuffer } from "@/lib/export/toPdf";
import { uploadAndRegister } from "@/lib/export/uploadAndRegister";
import { getDirectorSummary } from "@/lib/data/portal";
import { REPORT_TYPE_MAP, loadPopulatedReport, type ReportKey } from "@/lib/reports/reportRegistry";

type ReportRecord = Record<string, unknown> & {
  facultyId?: { _id?: { toString: () => string } } | string;
  preparedBy?: { _id?: { toString: () => string } };
  submittedBy?: { _id?: { toString: () => string } };
};

function isReportKey(type: string): type is ReportKey {
  return type in REPORT_TYPE_MAP;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ format: string; type: string; id: string }> }
) {
  const { format, type, id } = await params;

  if (type !== "director" && !isReportKey(type)) {
    return NextResponse.json({ message: "Unknown report type" }, { status: 400 });
  }

  const reportType = type === "director" ? "DIRECTOR" : REPORT_TYPE_MAP[type];

  await connectDB();

  let report: Record<string, unknown> | null = null;
  if (type === "director") {
    const query = new URL(_req.url);
    const academicSession = query.searchParams.get("academicSession") ?? undefined;
    const semester = query.searchParams.get("semester") as "FIRST" | "SECOND" | undefined;
    report = await getDirectorSummary(academicSession, semester);
  } else {
    report = await loadPopulatedReport(type, id);

    if (!report) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 });
    }
  }

  const adapter = getAdapter(reportType);
  const payload = adapter(report);

  let buffer: Buffer;
  let mimeType: string;
  let ext: string;
  const fmt = format.toUpperCase();

  if (fmt === "XLSX") {
    buffer = await buildExcelBuffer(payload);
    mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    ext = "xlsx";
  } else if (fmt === "DOCX") {
    buffer = await buildWordBuffer(payload);
    mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    ext = "docx";
  } else if (fmt === "PDF") {
    buffer = await buildPdfBuffer(payload);
    mimeType = "application/pdf";
    ext = "pdf";
  } else {
    return NextResponse.json({ message: "Unsupported format" }, { status: 400 });
  }

  const fileName = `${type}-${id}-${Date.now()}.${ext}`;

  const facultyValue = (report as ReportRecord).facultyId;
  const facultyIdValue =
    typeof facultyValue === "object" && facultyValue !== null && "_id" in facultyValue
      ? (facultyValue as { _id?: { toString: () => string } })._id?.toString()
      : facultyValue?.toString();

  const typedReportType = reportType as Parameters<typeof uploadAndRegister>[0]["reportType"];

  uploadAndRegister({
    buffer,
    fileName,
    format: fmt as "PDF" | "DOCX" | "XLSX",
    reportType: typedReportType,
    sourceId: id,
    facultyId: facultyIdValue,
    generatedBy: (report as ReportRecord).preparedBy?._id?.toString() ?? (report as ReportRecord).submittedBy?._id?.toString(),
  }).catch((err) => console.error("Failed to register generated report:", err));

  return new NextResponse(Uint8Array.from(buffer), {
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
