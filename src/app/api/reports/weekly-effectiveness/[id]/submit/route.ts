import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import WeeklyEffectivenessReport from "@/models/WeeklyEffectivenessReport";
import { notifyReportEvent } from "@/lib/notify/notifyReportEvent";
import { logAudit } from "@/lib/audit/logAudit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const report = await WeeklyEffectivenessReport.findByIdAndUpdate(
    id,
    { status: "SUBMITTED", submittedAt: new Date() },
    { new: true }
  );

  if (!report) return NextResponse.json({ message: "Not found" }, { status: 404 });

  notifyReportEvent("weekly-effectiveness", id, "submitted").catch(() => {});

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "REPORT_SUBMITTED",
    category: "REPORT",
    description: `${session?.user?.name ?? "Someone"} submitted a Weekly Effectiveness Report`,
    entityType: "WeeklyEffectivenessReport",
    entityId: id,
    headers: req.headers,
  });

  return NextResponse.json(report);
}
