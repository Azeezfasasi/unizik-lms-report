import { ExaminerReportItem } from "@/lib/data/portal";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function formatDate(value: string | Date | undefined) {
  if (!value) return "N/A";
  if (typeof value === "string") return escapeHtml(value);
  return escapeHtml(value.toISOString().slice(0, 10));
}

export function generateWordBuffer(report: ExaminerReportItem) {
  const submittedAt = formatDate(report.submittedAt);
  const comments = report.comments ? escapeHtml(report.comments) : "No comments provided.";
  const attachmentUrl = report.questionPaperUrl ? escapeHtml(report.questionPaperUrl) : "None";

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta charset="utf-8" />
    <title>Examiner Report</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
      h1 { font-size: 24px; margin-bottom: 16px; }
      h2 { font-size: 18px; margin-top: 24px; margin-bottom: 8px; }
      p { margin: 4px 0; line-height: 1.6; }
      .field-label { font-weight: 700; }
      .section { margin-bottom: 16px; }
    </style>
  </head>
  <body>
    <h1>UNIZIK Postgraduate Examiner Report</h1>
    <div class="section">
      <p><span class="field-label">Report ID:</span> ${escapeHtml(report.id)}</p>
      <p><span class="field-label">Examiner:</span> ${escapeHtml(report.examinerName)}</p>
      <p><span class="field-label">Faculty ID:</span> ${escapeHtml(String(report.facultyId ?? "N/A"))}</p>
      <p><span class="field-label">Department ID:</span> ${escapeHtml(String(report.departmentId ?? "N/A"))}</p>
      <p><span class="field-label">Course ID:</span> ${escapeHtml(String(report.courseId ?? "N/A"))}</p>
      <p><span class="field-label">Academic Session:</span> ${escapeHtml(String(report.academicSession ?? "N/A"))}</p>
      <p><span class="field-label">Semester:</span> ${escapeHtml(String(report.semester ?? "N/A"))}</p>
      <p><span class="field-label">Exam Type:</span> ${escapeHtml(String(report.examType ?? "N/A"))}</p>
      <p><span class="field-label">Status:</span> ${escapeHtml(String(report.status ?? "N/A"))}</p>
      <p><span class="field-label">Score:</span> ${escapeHtml(String(report.score ?? "N/A"))}</p>
      <p><span class="field-label">Submitted:</span> ${submittedAt}</p>
    </div>
    <div class="section">
      <h2>Comments</h2>
      <p>${comments}</p>
    </div>
    <div class="section">
      <h2>Question Paper</h2>
      <p>${attachmentUrl}</p>
    </div>
  </body>
</html>`;

  return Buffer.from(html, "utf-8");
}
