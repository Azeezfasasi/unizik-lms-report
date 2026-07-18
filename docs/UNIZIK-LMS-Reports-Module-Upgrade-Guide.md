# UNIZIK LMS Portal — Reports Module Upgrade Guide

**Scope:** Add four report types (Student, LMS Rep, PG Coordinator, Examiner), unified Excel/Word/PDF export, and a single "Submitted Reports" page that lists every generated report across all types.

**Based on:** Your current models (`Course`, `Curriculum`, `Department`, `Faculty`, `LectureSchedule`, `ExamTimetable`, `Student`, `User`, `Report`, `ExaminerReport`) and your existing `unizik-lms-report` folder structure.

---

## 1. Where you are vs. where this takes you

**What already exists and works:**
- `ExaminerReport` — a well-developed model with a real status workflow (`DRAFT → SUBMITTED → UNDER_REVIEW → REVISION_REQUESTED → APPROVED/REJECTED`), moderator fields, and malpractice flagging. This is your most mature report type.
- `Report` — a lightweight student report record (`studentId`, `facultyId`, `curriculumId`, `status`, `preparedBy`).
- Your sidebar already has nav entries for all four report types plus "Submitted Reports" — the UI intent is there, the backend isn't yet.

**What's missing:**
- No model for **LMS Rep Report** or **PG Coordinator's Report** — these don't exist yet in your schema.
- No **export layer** — nothing currently generates a `.pdf`, `.docx`, or `.xlsx` file from any report.
- No **registry of generated files** — so there's no way to power a "Submitted Reports" page that lists every export that's ever been produced, across all four types.

**The core architectural decision this guide makes:** instead of writing a separate PDF generator, Word generator, and Excel generator for each of the four report types (12 generators total), you build **one adapter per report type** that normalizes its data into a common shape, and **one builder per file format** that consumes that common shape. That's 4 adapters + 3 builders = 7 pieces instead of 12, and adding a fifth report type later only costs one new adapter.

```
Report models (4 types)
        |
        v
   Adapters (4)  ->  normalize each report into one common shape
        |
        v
  Format builders (3)  ->  Excel / Word / PDF, each reads the common shape
        |
        v
  GeneratedReportFile registry  ->  every export gets logged here
        |
        v
  Submitted Reports page  ->  lists everything, filterable by type/format
```

---

## 2. New data models

### 2.1 `CourseRepReport` (LMS Rep Report)

A course representative (a student, typically) files this to confirm which scheduled lectures actually held, and flag issues. It references your existing `LectureSchedule` entries rather than duplicating scheduling data.

```typescript
// models/CourseRepReport.ts
import { Schema, model, models } from "mongoose";

const LectureComplianceSchema = new Schema(
  {
    lectureScheduleId: { type: Schema.Types.ObjectId, ref: "LectureSchedule", required: true },
    held: { type: Boolean, default: false },
    remarks: { type: String },
  },
  { _id: false }
);

const CourseRepReportSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    curriculumId: { type: Schema.Types.ObjectId, ref: "Curriculum", required: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    academicSession: { type: String, required: true }, // e.g. "2025/2026"
    semester: { type: String, enum: ["FIRST", "SECOND"], required: true },

    lectureCompliance: { type: [LectureComplianceSchema], default: [] },
    totalLecturesScheduled: { type: Number, default: 0 },
    totalLecturesHeld: { type: Number, default: 0 },

    issues: { type: String },
    status: { type: String, enum: ["DRAFT", "SUBMITTED"], default: "DRAFT" },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

CourseRepReportSchema.index({ courseId: 1, academicSession: 1, semester: 1 });

export default models.CourseRepReport || model("CourseRepReport", CourseRepReportSchema);
```

### 2.2 `CoordinatorReport` (PG Coordinator's Report)

A programme coordinator (`FACULTY_OFFICER` or `ADMIN`) files a session-level summary for a curriculum. Most of the numeric fields are auto-calculated (see the summary endpoint in Section 5.3) and reviewed before submission, rather than typed in by hand.

```typescript
// models/CoordinatorReport.ts
import { Schema, model, models } from "mongoose";

const CoordinatorReportSchema = new Schema(
  {
    curriculumId: { type: Schema.Types.ObjectId, ref: "Curriculum", required: true },
    preparedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    academicSession: { type: String, required: true },
    semester: { type: String, enum: ["FIRST", "SECOND"], required: true },

    totalStudents: { type: Number, default: 0 },
    totalCourses: { type: Number, default: 0 },
    lectureComplianceRate: { type: Number, default: 0 }, // percentage, 0-100

    examinerReportsSummary: {
      submitted: { type: Number, default: 0 },
      approved: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
    },
    examTimetableStatus: { type: String }, // e.g. "Confirmed", "Pending release"

    recommendations: { type: String },
    status: { type: String, enum: ["DRAFT", "SUBMITTED"], default: "DRAFT" },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

CoordinatorReportSchema.index({ curriculumId: 1, academicSession: 1, semester: 1 });

export default models.CoordinatorReport || model("CoordinatorReport", CoordinatorReportSchema);
```

### 2.3 `GeneratedReportFile` (the export registry)

This is the model that makes the "Submitted Reports" page possible without querying four different collections and merging results client-side. Every time someone downloads a report as PDF/Word/Excel, one row gets written here.

```typescript
// models/GeneratedReportFile.ts
import { Schema, model, models } from "mongoose";

const GeneratedReportFileSchema = new Schema(
  {
    reportType: {
      type: String,
      enum: ["STUDENT", "LMS_REP", "PG_COORDINATOR", "EXAMINER"],
      required: true,
    },
    sourceId: { type: Schema.Types.ObjectId, required: true }, // points into Report | CourseRepReport | CoordinatorReport | ExaminerReport
    format: { type: String, enum: ["PDF", "DOCX", "XLSX"], required: true },

    fileUrl: { type: String, required: true }, // Cloudinary secure_url
    fileName: { type: String, required: true },

    facultyId: { type: Schema.Types.ObjectId, ref: "Faculty" },
    generatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

GeneratedReportFileSchema.index({ reportType: 1, sourceId: 1, format: 1 });
GeneratedReportFileSchema.index({ createdAt: -1 });

export default models.GeneratedReportFile || model("GeneratedReportFile", GeneratedReportFileSchema);
```

**Why not just generate files on-the-fly with no registry?** You could — but then "Submitted Reports" has nothing to list, re-downloading a report means regenerating it every time (slower, and the file could drift if the underlying data changes after submission), and you lose an audit trail of who exported what and when. The registry is cheap to maintain and solves all three.

---

## 3. Folder structure additions

Mapped onto your existing tree:

```
src/
├── models/
│   ├── CourseRepReport.ts          [new]
│   ├── CoordinatorReport.ts        [new]
│   └── GeneratedReportFile.ts      [new]
│
├── lib/
│   └── export/
│       ├── adapters.ts             [new] - normalizes each report type
│       ├── toExcel.ts              [new]
│       ├── toWord.ts               [new]
│       ├── toPdf.tsx               [new]
│       └── uploadAndRegister.ts    [new] - Cloudinary upload + GeneratedReportFile write
│
├── components/
│   └── reports/
│       ├── ExportButtons.tsx       [new] - reused on every report detail page
│       ├── ReportStatusBadge.tsx   [new]
│       └── GeneratedReportsTable.tsx [new]
│
└── app/
    ├── api/
    │   ├── reports/
    │   │   ├── lms-rep/
    │   │   │   ├── route.ts              [new] GET list, POST create
    │   │   │   └── [id]/
    │   │   │       ├── route.ts          [new] GET, PATCH
    │   │   │       └── submit/route.ts   [new] POST
    │   │   ├── coordinator/
    │   │   │   ├── route.ts              [new]
    │   │   │   ├── summary/route.ts      [new] - auto-calculate stats
    │   │   │   └── [id]/
    │   │   │       ├── route.ts          [new]
    │   │   │       └── submit/route.ts   [new]
    │   │   └── generated/route.ts        [new] - powers Submitted Reports page
    │   │
    │   └── export/
    │       └── [format]/[type]/[id]/route.ts   [new] - unified export endpoint
    │
    └── (dashboard)/dashboard/(reports)/
        ├── lms-rep-report/
        │   ├── page.tsx           [new] list
        │   ├── new/page.tsx       [new] create/submit form
        │   └── [id]/page.tsx      [new] detail + export
        ├── pg-coordinator-report/
        │   ├── page.tsx           [new]
        │   ├── new/page.tsx       [new]
        │   └── [id]/page.tsx      [new]
        └── submitted-reports/
            └── page.tsx           [new] - uses GeneratedReportsTable
```

---

## 4. Export architecture — the adapter pattern

### 4.1 The common shape every adapter produces

```typescript
// lib/export/adapters.ts
export interface ReportExportPayload {
  title: string;
  subtitle: string;
  meta: { label: string; value: string }[];       // key facts shown at the top
  sections: {
    heading: string;
    rows: { label: string; value: string }[];      // simple label/value pairs
    table?: { headers: string[]; rows: string[][] }; // optional tabular data
  }[];
  footerNote?: string;
  generatedAt: Date;
}
```

### 4.2 Adapters — one per report type

Each adapter's only job is to turn a Mongoose document (with its refs populated) into a `ReportExportPayload`. This is where report-specific knowledge lives, so the builders in Sections 4.3-4.5 never need to know the difference between an Examiner Report and a Coordinator Report.

```typescript
// lib/export/adapters.ts (continued)

export function adaptExaminerReport(report: any): ReportExportPayload {
  return {
    title: "Examiner Report",
    subtitle: `${report.courseId?.title ?? "Course"} (${report.courseId?.code ?? ""})`,
    meta: [
      { label: "Examiner", value: report.lecturerId?.name ?? report.externalExaminerName ?? "-" },
      { label: "Faculty", value: report.facultyId?.name ?? "-" },
      { label: "Department", value: report.departmentId?.name ?? "-" },
      { label: "Academic Session", value: report.academicSession },
      { label: "Semester", value: report.semester === "FIRST" ? "First" : "Second" },
      { label: "Exam Type", value: report.examType },
      { label: "Status", value: report.status.replace(/_/g, " ") },
    ],
    sections: [
      {
        heading: "Evaluation",
        rows: [
          { label: "Score", value: `${report.score ?? 0}/100` },
          { label: "Number of Questions", value: String(report.numberOfQuestions ?? "-") },
          { label: "Malpractice Flagged", value: report.malpracticeFlagged ? "Yes" : "No" },
        ],
      },
      {
        heading: "Comments",
        rows: [
          { label: "Examiner Comments", value: report.comments ?? "-" },
          { label: "Moderator Comments", value: report.moderatorComments ?? "-" },
          { label: "Compliance Notes", value: report.complianceNotes ?? "-" },
        ],
      },
      {
        heading: "Status History",
        rows: [],
        table: {
          headers: ["Status", "Changed By", "Date", "Comment"],
          rows: (report.statusHistory ?? []).map((entry: any) => [
            entry.status,
            entry.changedBy?.name ?? "-",
            new Date(entry.changedAt).toLocaleDateString(),
            entry.comment ?? "",
          ]),
        },
      },
    ],
    generatedAt: new Date(),
  };
}

export function adaptCourseRepReport(report: any): ReportExportPayload {
  return {
    title: "LMS Course Rep Report",
    subtitle: `${report.courseId?.title ?? "Course"} (${report.courseId?.code ?? ""})`,
    meta: [
      { label: "Submitted By", value: report.submittedBy?.name ?? "-" },
      { label: "Academic Session", value: report.academicSession },
      { label: "Semester", value: report.semester === "FIRST" ? "First" : "Second" },
      { label: "Status", value: report.status },
    ],
    sections: [
      {
        heading: "Lecture Compliance",
        rows: [
          { label: "Lectures Scheduled", value: String(report.totalLecturesScheduled) },
          { label: "Lectures Held", value: String(report.totalLecturesHeld) },
          {
            label: "Compliance Rate",
            value:
              report.totalLecturesScheduled > 0
                ? `${Math.round((report.totalLecturesHeld / report.totalLecturesScheduled) * 100)}%`
                : "N/A",
          },
        ],
        table: {
          headers: ["Lecture", "Held", "Remarks"],
          rows: (report.lectureCompliance ?? []).map((entry: any) => [
            entry.lectureScheduleId?.title ?? "-",
            entry.held ? "Yes" : "No",
            entry.remarks ?? "",
          ]),
        },
      },
      {
        heading: "Issues Raised",
        rows: [{ label: "Issues", value: report.issues || "None reported" }],
      },
    ],
    generatedAt: new Date(),
  };
}

export function adaptCoordinatorReport(report: any): ReportExportPayload {
  return {
    title: "PG Coordinator's Report",
    subtitle: report.curriculumId?.programName ?? "Programme",
    meta: [
      { label: "Prepared By", value: report.preparedBy?.name ?? "-" },
      { label: "Academic Session", value: report.academicSession },
      { label: "Semester", value: report.semester === "FIRST" ? "First" : "Second" },
      { label: "Status", value: report.status },
    ],
    sections: [
      {
        heading: "Programme Summary",
        rows: [
          { label: "Total Students", value: String(report.totalStudents) },
          { label: "Total Courses", value: String(report.totalCourses) },
          { label: "Lecture Compliance Rate", value: `${report.lectureComplianceRate}%` },
          { label: "Exam Timetable Status", value: report.examTimetableStatus ?? "-" },
        ],
      },
      {
        heading: "Examiner Reports Summary",
        rows: [
          { label: "Submitted", value: String(report.examinerReportsSummary?.submitted ?? 0) },
          { label: "Approved", value: String(report.examinerReportsSummary?.approved ?? 0) },
          { label: "Pending", value: String(report.examinerReportsSummary?.pending ?? 0) },
        ],
      },
      {
        heading: "Recommendations",
        rows: [{ label: "Recommendations", value: report.recommendations || "None" }],
      },
    ],
    generatedAt: new Date(),
  };
}

export function adaptStudentReport(report: any): ReportExportPayload {
  return {
    title: "Student Report",
    subtitle: report.studentId?.fullName ?? "Student",
    meta: [
      { label: "Matric Number", value: report.studentId?.matricNumber ?? "-" },
      { label: "Faculty", value: report.facultyId?.name ?? "-" },
      { label: "Programme", value: report.curriculumId?.programName ?? "-" },
      { label: "Status", value: report.status },
    ],
    sections: [
      {
        heading: "Notes",
        rows: [{ label: "Notes", value: report.notes || "None" }],
      },
    ],
    generatedAt: new Date(),
  };
}

export function getAdapter(type: "STUDENT" | "LMS_REP" | "PG_COORDINATOR" | "EXAMINER") {
  const map = {
    STUDENT: adaptStudentReport,
    LMS_REP: adaptCourseRepReport,
    PG_COORDINATOR: adaptCoordinatorReport,
    EXAMINER: adaptExaminerReport,
  };
  return map[type];
}
```

### 4.3 Excel builder

```typescript
// lib/export/toExcel.ts
import ExcelJS from "exceljs";
import { ReportExportPayload } from "./adapters";

export async function buildExcelBuffer(payload: ReportExportPayload): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(payload.title.slice(0, 31)); // Excel sheet name limit

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

  sheet.columns.forEach((col) => (col.width = 28));

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
```

### 4.4 Word builder

```typescript
// lib/export/toWord.ts
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
                children: row.map(
                  (cell) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: cell })] })] })
                ),
              })
          ),
        ],
      });
      body.push(table as any);
    }
  }

  const doc = new Document({
    sections: [{ children: body as Paragraph[] }],
  });

  return Packer.toBuffer(doc);
}
```

### 4.5 PDF builder

```tsx
// lib/export/toPdf.tsx
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { ReportExportPayload } from "./adapters";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 20, fontWeight: 700, color: "#0F766E", marginBottom: 4 },
  subtitle: { fontSize: 12, color: "#64748B", marginBottom: 16, fontStyle: "italic" },
  metaRow: { flexDirection: "row", marginBottom: 4 },
  metaLabel: { fontWeight: 700, width: 160 },
  sectionHeading: { fontSize: 14, fontWeight: 700, color: "#0F766E", marginTop: 16, marginBottom: 8 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { fontWeight: 700, width: 160 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#0F766E", padding: 4 },
  tableHeaderCell: { flex: 1, color: "#FFFFFF", fontWeight: 700, fontSize: 9 },
  tableRow: { flexDirection: "row", padding: 4, borderBottom: "1 solid #E5E7EB" },
  tableCell: { flex: 1, fontSize: 9 },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, fontSize: 8, color: "#94A3B8" },
});

function ReportDocument({ payload }: { payload: ReportExportPayload }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{payload.title}</Text>
        <Text style={styles.subtitle}>{payload.subtitle}</Text>

        {payload.meta.map((item, i) => (
          <View key={i} style={styles.metaRow}>
            <Text style={styles.metaLabel}>{item.label}</Text>
            <Text>{item.value}</Text>
          </View>
        ))}

        {payload.sections.map((section, i) => (
          <View key={i}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            {section.rows.map((item, j) => (
              <View key={j} style={styles.row}>
                <Text style={styles.label}>{item.label}</Text>
                <Text>{item.value}</Text>
              </View>
            ))}
            {section.table && section.table.rows.length > 0 && (
              <View>
                <View style={styles.tableHeaderRow}>
                  {section.table.headers.map((h, k) => (
                    <Text key={k} style={styles.tableHeaderCell}>{h}</Text>
                  ))}
                </View>
                {section.table.rows.map((row, k) => (
                  <View key={k} style={styles.tableRow}>
                    {row.map((cell, l) => (
                      <Text key={l} style={styles.tableCell}>{cell}</Text>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <Text style={styles.footer}>
          Generated on {payload.generatedAt.toLocaleString()} - UNIZIK LMS Portal
        </Text>
      </Page>
    </Document>
  );
}

export async function buildPdfBuffer(payload: ReportExportPayload): Promise<Buffer> {
  return renderToBuffer(<ReportDocument payload={payload} />);
}
```

### 4.6 Upload + register the generated file

```typescript
// lib/export/uploadAndRegister.ts
import cloudinary from "@/lib/cloudinary/cloudinary";
import GeneratedReportFile from "@/models/GeneratedReportFile";

export async function uploadAndRegister(opts: {
  buffer: Buffer;
  fileName: string;
  format: "PDF" | "DOCX" | "XLSX";
  reportType: "STUDENT" | "LMS_REP" | "PG_COORDINATOR" | "EXAMINER";
  sourceId: string;
  facultyId?: string;
  generatedBy?: string;
}) {
  const uploadResult = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: "raw", folder: "unizik-lms/generated-reports", public_id: opts.fileName }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
      .end(opts.buffer);
  });

  const record = await GeneratedReportFile.create({
    reportType: opts.reportType,
    sourceId: opts.sourceId,
    format: opts.format,
    fileUrl: uploadResult.secure_url,
    fileName: opts.fileName,
    facultyId: opts.facultyId,
    generatedBy: opts.generatedBy,
  });

  return record;
}
```

### 4.7 The unified export API route

This single route serves all 4 report types times 3 formats — 12 combinations handled by one file.

```typescript
// app/api/export/[format]/[type]/[id]/route.ts
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

const MODEL_MAP: Record<string, any> = {
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
  req: NextRequest,
  { params }: { params: Promise<{ format: string; type: string; id: string }> }
) {
  const { format, type, id } = await params;

  const model = MODEL_MAP[type];
  const reportType = TYPE_MAP[type];
  if (!model || !reportType) {
    return NextResponse.json({ message: "Unknown report type" }, { status: 400 });
  }

  await connectDB();

  let query = model.findById(id);
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

  // Fire-and-forget registry write - don't block the download on it
  uploadAndRegister({
    buffer,
    fileName,
    format: fmt as "PDF" | "DOCX" | "XLSX",
    reportType,
    sourceId: id,
    facultyId: (report as any).facultyId?._id?.toString(),
  }).catch((err) => console.error("Failed to register generated report:", err));

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
```

---

## 5. Reusable UI components

### 5.1 `ExportButtons` — used on every report detail page

```tsx
// components/reports/ExportButtons.tsx
"use client";

const FORMATS = [
  { key: "pdf", label: "PDF" },
  { key: "docx", label: "Word" },
  { key: "xlsx", label: "Excel" },
];

export function ExportButtons({
  type,
  id,
}: {
  type: "student" | "lms-rep" | "coordinator" | "examiner";
  id: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {FORMATS.map((format) => (
        <a
          key={format.key}
          href={`/api/export/${format.key}/${type}/${id}`}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-600"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
          {format.label}
        </a>
      ))}
    </div>
  );
}
```

### 5.2 `ReportStatusBadge`

```tsx
// components/reports/ReportStatusBadge.tsx
const TONE: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  SUBMITTED: "bg-sky-100 text-sky-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  REVISION_REQUESTED: "bg-orange-100 text-orange-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

export function ReportStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${TONE[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
```

### 5.3 `GeneratedReportsTable` — powers the Submitted Reports page

```tsx
// components/reports/GeneratedReportsTable.tsx
import { ReportStatusBadge } from "./ReportStatusBadge";

const TYPE_LABEL: Record<string, string> = {
  STUDENT: "Student Report",
  LMS_REP: "LMS Rep Report",
  PG_COORDINATOR: "PG Coordinator's Report",
  EXAMINER: "Examiner Report",
};

export function GeneratedReportsTable({ files }: { files: any[] }) {
  if (files.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <p className="text-sm font-medium text-slate-600">No reports generated yet</p>
        <p className="mt-1 text-sm text-slate-400">Exported reports will appear here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Report</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Format</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Generated By</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Download</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {files.map((file) => (
            <tr key={file._id} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-sm font-medium text-slate-800">{TYPE_LABEL[file.reportType]}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {file.format}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">{file.generatedBy?.name ?? "-"}</td>
              <td className="px-4 py-3 text-sm text-slate-500">
                {new Date(file.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </td>
              <td className="px-4 py-3 text-right">
                <a href={file.fileUrl} className="text-sm font-medium text-teal-600 hover:text-teal-700" target="_blank" rel="noreferrer">
                  Download
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

```typescript
// app/api/reports/generated/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import GeneratedReportFile from "@/models/GeneratedReportFile";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const reportType = searchParams.get("type");
  const format = searchParams.get("format");

  const filter: Record<string, string> = {};
  if (reportType) filter.reportType = reportType;
  if (format) filter.format = format;

  const files = await GeneratedReportFile.find(filter)
    .populate("generatedBy", "name")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  return NextResponse.json(files);
}
```

```tsx
// app/(dashboard)/dashboard/(reports)/submitted-reports/page.tsx
import { GeneratedReportsTable } from "@/components/reports/GeneratedReportsTable";
import { connectDB } from "@/lib/db/connectDB";
import GeneratedReportFile from "@/models/GeneratedReportFile";

export default async function SubmittedReportsPage() {
  await connectDB();
  const files = await GeneratedReportFile.find()
    .populate("generatedBy", "name")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Reports</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Submitted Reports</h2>
        <p className="mt-1 text-sm text-slate-500">Every report generated across the portal, in one place.</p>
      </div>
      <GeneratedReportsTable files={JSON.parse(JSON.stringify(files))} />
    </div>
  );
}
```

---

## 6. LMS Rep Report — full working example

Use this as the template for the other two new report types.

### 6.1 API routes

```typescript
// app/api/reports/lms-rep/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import CourseRepReport from "@/models/CourseRepReport";
import LectureSchedule from "@/models/LectureSchedule";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  const filter: Record<string, string> = {};
  if (courseId) filter.courseId = courseId;

  const reports = await CourseRepReport.find(filter)
    .populate("courseId", "title code")
    .populate("submittedBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  // Pull the curriculum's lecture schedule so the rep can mark each one held/not held
  const schedules = await LectureSchedule.find({ curriculumId: body.curriculumId }).lean();

  const report = await CourseRepReport.create({
    ...body,
    totalLecturesScheduled: schedules.length,
    lectureCompliance: schedules.map((s) => ({ lectureScheduleId: s._id, held: false, remarks: "" })),
  });

  return NextResponse.json(report, { status: 201 });
}
```

```typescript
// app/api/reports/lms-rep/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import CourseRepReport from "@/models/CourseRepReport";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const report = await CourseRepReport.findById(id)
    .populate("courseId", "title code")
    .populate("submittedBy", "name")
    .populate("lectureCompliance.lectureScheduleId", "title startDate endDate")
    .lean();

  if (!report) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(report);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const body = await req.json();

  const totalHeld = (body.lectureCompliance ?? []).filter((e: any) => e.held).length;

  const report = await CourseRepReport.findByIdAndUpdate(
    id,
    { ...body, totalLecturesHeld: totalHeld },
    { new: true }
  );

  if (!report) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(report);
}
```

```typescript
// app/api/reports/lms-rep/[id]/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import CourseRepReport from "@/models/CourseRepReport";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;

  const report = await CourseRepReport.findByIdAndUpdate(
    id,
    { status: "SUBMITTED", submittedAt: new Date() },
    { new: true }
  );

  if (!report) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(report);
}
```

### 6.2 List page

```tsx
// app/(dashboard)/dashboard/(reports)/lms-rep-report/page.tsx
import Link from "next/link";
import { connectDB } from "@/lib/db/connectDB";
import CourseRepReport from "@/models/CourseRepReport";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";

export default async function LmsRepReportListPage() {
  await connectDB();
  const reports = await CourseRepReport.find()
    .populate("courseId", "title code")
    .populate("submittedBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Reporting</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">LMS Rep Report</h2>
        </div>
        <Link
          href="/dashboard/lms-rep-report/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          New report
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {reports.map((report: any) => (
          <Link
            key={report._id}
            href={`/dashboard/lms-rep-report/${report._id}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{report.courseId?.title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {report.courseId?.code} · {report.academicSession}
                </p>
              </div>
              <ReportStatusBadge status={report.status} />
            </div>
            <p className="mt-3 text-sm text-slate-500">
              {report.totalLecturesHeld}/{report.totalLecturesScheduled} lectures held · by {report.submittedBy?.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### 6.3 Detail page (with export buttons)

```tsx
// app/(dashboard)/dashboard/(reports)/lms-rep-report/[id]/page.tsx
import { connectDB } from "@/lib/db/connectDB";
import CourseRepReport from "@/models/CourseRepReport";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { notFound } from "next/navigation";

export default async function LmsRepReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();

  const report = await CourseRepReport.findById(id)
    .populate("courseId", "title code")
    .populate("submittedBy", "name")
    .populate("lectureCompliance.lectureScheduleId", "title startDate endDate")
    .lean();

  if (!report) notFound();
  const r = report as any;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">{r.courseId?.title}</h2>
            <ReportStatusBadge status={r.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {r.courseId?.code} · {r.academicSession} · submitted by {r.submittedBy?.name}
          </p>
        </div>
        <ExportButtons type="lms-rep" id={r._id.toString()} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Lecture Compliance</h3>
        <div className="mt-4 space-y-2">
          {r.lectureCompliance.map((entry: any, i: number) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
              <span className="text-sm text-slate-800">{entry.lectureScheduleId?.title}</span>
              <span className={`text-xs font-semibold ${entry.held ? "text-emerald-600" : "text-red-600"}`}>
                {entry.held ? "Held" : "Not held"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {r.issues ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-base font-semibold text-slate-900">Issues Raised</h3>
          <p className="mt-2 text-sm text-slate-600">{r.issues}</p>
        </div>
      ) : null}
    </div>
  );
}
```

The **create form** (`new/page.tsx`) follows the same pattern as the New Examiner Report form you already have: fetch `courses` for a dropdown, on selecting a course fetch its `curriculumId`'s lecture schedule, render one row per lecture with a held/not-held toggle and a remarks field, then `POST` to `/api/reports/lms-rep`.

---

## 7. PG Coordinator's Report — apply the same pattern

Same shape as Section 6, with these differences:

**Auto-fill via a summary endpoint** instead of manual entry — this is the one meaningfully different piece:

```typescript
// app/api/reports/coordinator/summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import Student from "@/models/Student";
import Course from "@/models/Course";
import ExaminerReport from "@/models/ExaminerReport";
import CourseRepReport from "@/models/CourseRepReport";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const curriculumId = searchParams.get("curriculumId");
  const academicSession = searchParams.get("academicSession");

  const [totalStudents, totalCourses, examinerCounts, repReports] = await Promise.all([
    Student.countDocuments({ curriculumId }),
    Course.countDocuments({ curriculumId }),
    ExaminerReport.aggregate([
      { $match: { academicSession } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    CourseRepReport.find({ curriculumId, academicSession }).lean(),
  ]);

  const submitted = examinerCounts.reduce((sum, s) => sum + s.count, 0);
  const approved = examinerCounts.find((s) => s._id === "APPROVED")?.count ?? 0;
  const pending = examinerCounts
    .filter((s) => ["DRAFT", "SUBMITTED", "UNDER_REVIEW"].includes(s._id))
    .reduce((sum, s) => sum + s.count, 0);

  const totalScheduled = repReports.reduce((sum, r) => sum + r.totalLecturesScheduled, 0);
  const totalHeld = repReports.reduce((sum, r) => sum + r.totalLecturesHeld, 0);
  const lectureComplianceRate = totalScheduled > 0 ? Math.round((totalHeld / totalScheduled) * 100) : 0;

  return NextResponse.json({
    totalStudents,
    totalCourses,
    lectureComplianceRate,
    examinerReportsSummary: { submitted, approved, pending },
  });
}
```

The coordinator's `new/page.tsx` calls this endpoint when they pick a curriculum + session, pre-fills the numeric fields, and lets them add `recommendations` and an `examTimetableStatus` note before submitting — same list/detail/export pages as Sections 6.2-6.3, just pointed at `/api/reports/coordinator` and using `adaptCoordinatorReport`.

---

## 8. Student Report — connecting to your existing pipeline

Your `Report` model and its multi-step submission flow (Faculty → Curriculum → Lectures Calendar → Exam Timetable → General Report, from your original flowchart) already exists conceptually — this module just adds:
- `ExportButtons` on the final "General Report" review page, using `type="student"`.
- The same registry write happens automatically the first time someone downloads it, via the unified `/api/export/[format]/[type]/[id]` route — no extra work needed on the Student Report side beyond dropping `<ExportButtons type="student" id={report._id} />` into the existing detail page.

---

## 9. Examiner Report — what needs updating

Your `ExaminerReport` schema has evolved since the version I built the create form against earlier — the current one uses `lecturerId` (a real `User` ref) instead of a free-text `examinerName`, adds a full status workflow with `statusHistory`, and adds moderator fields. Two things to update on the existing UI:

1. **The create form** — swap the `examinerName` text input for a `lecturerId` select (fetch users with role `EXAMINER`, same dropdown pattern as the faculty/department/course selects already in that form), and add `academicSession` / `examType` fields.
2. **The detail page** — add a status-change control (dropdown or buttons for `SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED`) that `POST`s to a new `app/api/examiner-reports/[id]/status/route.ts`, pushing an entry onto `statusHistory` each time. Drop `<ExportButtons type="examiner" id={report._id} />` onto the same page — the adapter in Section 4.2 already reads `statusHistory`, `moderatorComments`, and `malpracticeFlagged`, so the export will reflect the richer schema as soon as it's populated.

---

## 10. Suggested implementation order

| Phase | Scope |
|---|---|
| 1 | Add the 3 new models (`CourseRepReport`, `CoordinatorReport`, `GeneratedReportFile`) |
| 2 | Build the export layer: adapters -> 3 builders -> unified export route (Section 4) — this is the highest-leverage piece, build it once and every report type benefits |
| 3 | Drop `ExportButtons` onto the existing Examiner Report and Student Report detail pages — confirms the export pipeline works before building new UI |
| 4 | Build LMS Rep Report end-to-end (Section 6) using the working export pipeline |
| 5 | Build PG Coordinator's Report (Section 7), including the summary aggregation endpoint |
| 6 | Build Submitted Reports page (Section 5.3) |
| 7 | Update Examiner Report form/detail page for the evolved schema (Section 9) |

## 11. Packages to add

```bash
npm install exceljs docx @react-pdf/renderer
```

(`cloudinary` and `mongoose` should already be installed per your existing setup.)
