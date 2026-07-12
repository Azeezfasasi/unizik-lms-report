import ExcelJS from "exceljs";

export async function generateExcelBuffer(reportId: string, notes: string) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Report");

  sheet.columns = [
    { header: "Report ID", key: "reportId", width: 24 },
    { header: "Notes", key: "notes", width: 48 },
  ];

  sheet.addRow({ reportId, notes });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer as ArrayBufferLike);
}
