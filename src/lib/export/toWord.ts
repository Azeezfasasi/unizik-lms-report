import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from "docx";
import { ReportExportPayload } from "./adapters";

const TEAL = "0F766E";

export async function buildWordBuffer(payload: ReportExportPayload): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: payload.title, bold: true, color: TEAL, size: 32 })],
    }),
    new Paragraph({
      spacing: { after: 300 },
      children: [new TextRun({ text: payload.subtitle, italics: true, color: "64748B" })],
    }),
  ];

  payload.meta.forEach((item) => {
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: `${item.label}: `, bold: true }),
          new TextRun({ text: item.value }),
        ],
      })
    );
  });

  const body: (Paragraph | Table)[] = [...children];

  for (const section of payload.sections) {
    body.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 260, after: 120 },
        children: [new TextRun({ text: section.heading, color: TEAL, bold: true })],
      })
    );

    section.rows.forEach((item) => {
      body.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: `${item.label}: `, bold: true }),
            new TextRun({ text: item.value }),
          ],
        })
      );
    });

    if (section.table && section.table.rows.length > 0) {
      const table = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: section.table.headers.map(
              (h) =>
                new TableCell({
                  shading: { fill: TEAL },
                  children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF" })] })],
                })
            ),
          }),
          ...section.table.rows.map(
            (row) =>
              new TableRow({
                children: row.map((cell) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: cell })] })] })),
              })
          ),
        ],
      });
      body.push(table);
    }
  }

  const doc = new Document({
    sections: [{ children: body as Paragraph[] }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
