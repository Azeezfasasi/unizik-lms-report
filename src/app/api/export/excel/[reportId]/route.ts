import { NextResponse } from "next/server";
import { generateExcelBuffer } from "@/lib/export/generateExcel";

export async function GET(request: Request, { params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const buffer = await generateExcelBuffer(reportId, "Generated export for the UNIZIK portal.");
  const body = Uint8Array.from(buffer);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="report-${reportId}.xlsx"`,
    },
  });
}
