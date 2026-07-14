import { NextResponse } from "next/server";
import { getExaminerReportById } from "@/lib/data/portal";
import { generateWordBuffer } from "@/lib/export/generateWord";

export async function GET(request: Request, { params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const report = await getExaminerReportById(reportId);

  if (!report) {
    return NextResponse.json({ message: "Examiner report not found" }, { status: 404 });
  }

  const buffer = generateWordBuffer(report);
  const body = Uint8Array.from(buffer);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/msword",
      "Content-Disposition": `attachment; filename="examiner-report-${reportId}.doc"`,
    },
  });
}
