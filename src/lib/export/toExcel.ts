import ExcelJS from "exceljs";
import { ReportExportPayload } from "./adapters";

export async function buildExcelBuffer(payload: ReportExportPayload): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(payload.title.slice(0, 31));

  sheet.mergeCells("A1:B1");
  sheet.getCell("A1").value = payload.title;
  sheet.getCell("A1").font = { size: 16, bold: true, color: { argb: "FF0F766E" } };

  sheet.mergeCells("A2:B2");
  sheet.getCell("A2").value = payload.subtitle;
  sheet.getCell("A2").font = { italic: true, color: { argb: "FF64748B" } };

  let row = 4;
  payload.meta.forEach((item) => {
    sheet.getCell(`A${row}`).value = item.label;
    sheet.getCell(`A${row}`).font = { bold: true };
    sheet.getCell(`B${row}`).value = item.value;
    row++;
  });

  row++;

  for (const section of payload.sections) {
    sheet.getCell(`A${row}`).value = section.heading;
    sheet.getCell(`A${row}`).font = { bold: true, size: 13, color: { argb: "FF0F766E" } };
    row++;

    section.rows.forEach((item) => {
      sheet.getCell(`A${row}`).value = item.label;
      sheet.getCell(`A${row}`).font = { bold: true };
      sheet.getCell(`B${row}`).value = item.value;
      row++;
    });

    if (section.table) {
      const headerRow = sheet.getRow(row);
      section.table.headers.forEach((h, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = h;
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F766E" } };
      });
      row++;

      section.table.rows.forEach((tableRow) => {
        tableRow.forEach((value, i) => {
          sheet.getRow(row).getCell(i + 1).value = value;
        });
        row++;
      });
    }
    row++;
  }

  sheet.columns.forEach((col) => {
    if (col) {
      col.width = 28;
    }
  });

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
