import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReportPDFDocument } from "@/lib/export/generatePDF";

export async function GET(request: Request, { params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const documentElement = ReportPDFDocument({ reportId, notes: "Generated export for the UNIZIK portal." });
  const pdfBuffer = await renderToBuffer(documentElement);
  const body = Uint8Array.from(pdfBuffer);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="report-${reportId}.pdf"`,
    },
  });
}
