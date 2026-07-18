import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import { getAdapter } from "@/lib/export/adapters";
import { buildExcelBuffer } from "@/lib/export/toExcel";
import { buildWordBuffer } from "@/lib/export/toWord";
import { buildPdfBuffer } from "@/lib/export/toPdf";
import { uploadAndRegister } from "@/lib/export/uploadAndRegister";
import Report from "@/models/Report";
import CourseRepReport from "@/models/CourseRepReport";
import CoordinatorReport from "@/models/CoordinatorReport";
import ExaminerReport from "@/models/ExaminerReport";

type QueryHandle = {
  populate: (path: string) => QueryHandle;
  lean: () => Promise<Record<string, unknown> | null>;
};

type QueryModel = {
  findById: (id: string) => QueryHandle;
};

type ReportRecord = Record<string, unknown> & {
  facultyId?: { _id?: { toString: () => string } } | string;
  preparedBy?: { _id?: { toString: () => string } };
  submittedBy?: { _id?: { toString: () => string } };
};

const MODEL_MAP: Record<string, unknown> = {
  student: Report,
  "lms-rep": CourseRepReport,
  coordinator: CoordinatorReport,
  examiner: ExaminerReport,
};

const TYPE_MAP: Record<string, "STUDENT" | "LMS_REP" | "PG_COORDINATOR" | "EXAMINER"> = {
  student: "STUDENT",
  "lms-rep": "LMS_REP",
  coordinator: "PG_COORDINATOR",
  examiner: "EXAMINER",
};

const POPULATE_MAP: Record<string, string[]> = {
  student: ["studentId", "facultyId", "curriculumId"],
  "lms-rep": ["courseId", "curriculumId", "submittedBy", "lectureCompliance.lectureScheduleId"],
  coordinator: ["curriculumId", "preparedBy"],
  examiner: ["lecturerId", "facultyId", "departmentId", "courseId", "statusHistory.changedBy"],
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ format: string; type: string; id: string }> }
) {
  const { format, type, id } = await params;
  const model = MODEL_MAP[type] as QueryModel | undefined;
  const reportType = TYPE_MAP[type];

  if (!model || !reportType) {
    return NextResponse.json({ message: "Unknown report type" }, { status: 400 });
  }

  await connectDB();

  let query: QueryHandle = model.findById(id);
  for (const path of POPULATE_MAP[type] ?? []) query = query.populate(path);
  const report = await query.lean();

  if (!report) {
    return NextResponse.json({ message: "Report not found" }, { status: 404 });
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

  uploadAndRegister({
    buffer,
    fileName,
    format: fmt as "PDF" | "DOCX" | "XLSX",
    reportType,
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
