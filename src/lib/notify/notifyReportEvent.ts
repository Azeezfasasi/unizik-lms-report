import { connectDB } from "@/lib/db/connectDB";
import User from "@/models/User";
import { getAdapter } from "@/lib/export/adapters";
import { buildPdfBuffer } from "@/lib/export/toPdf";
import { sendTransactionalEmail } from "@/lib/email/brevoClient";
import { REPORT_TYPE_MAP, loadPopulatedReport, type ReportKey } from "@/lib/reports/reportRegistry";

const NOTIFY_ROLES = ["ADMIN", "PG_COORDINATOR"];

export async function notifyReportEvent(type: ReportKey, id: string, event: "created" | "submitted") {
  try {
    await connectDB();

    const report = await loadPopulatedReport(type, id);
    if (!report) return;

    const recipients = (await User.find({ role: { $in: NOTIFY_ROLES } }, "name email").lean()) as Array<{
      name?: string;
      email?: string;
    }>;
    const toList = recipients.filter((user): user is { name?: string; email: string } => Boolean(user.email));
    if (!toList.length) return;

    const adapter = getAdapter(REPORT_TYPE_MAP[type]);
    const payload = adapter(report);
    const pdfBuffer = await buildPdfBuffer(payload);

    const verb = event === "submitted" ? "submitted" : "created";

    await sendTransactionalEmail({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL || "noreply@example.com",
        name: process.env.BREVO_SENDER_NAME || "UNIZIK Portal",
      },
      to: toList.map((user) => ({ email: user.email, name: user.name })),
      subject: `${payload.title} ${verb}: ${payload.subtitle}`,
      htmlContent: `<p>A <strong>${payload.title}</strong> has been ${verb}.</p><p>${payload.subtitle}</p><p>The full report is attached as a PDF.</p>`,
      attachment: [
        {
          content: pdfBuffer.toString("base64"),
          name: `${type}-${id}.pdf`,
          contentType: "application/pdf",
        },
      ],
    });
  } catch (error) {
    console.error(`Failed to send ${event} notification for ${type} report ${id}:`, error);
  }
}
