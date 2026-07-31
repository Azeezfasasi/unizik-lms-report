import { connectDB } from "@/lib/db/connectDB";
import AuditLog from "@/models/AuditLog";

export type AuditCategory =
  | "AUTH"
  | "USER"
  | "STUDENT"
  | "REPORT"
  | "ACADEMIC_STRUCTURE"
  | "SCHEDULING"
  | "NOTIFICATION";

export type AuditStatus = "SUCCESS" | "FAILURE";

interface HeadersLike {
  get(name: string): string | null | undefined;
}

interface LogAuditInput {
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  action: string;
  category: AuditCategory;
  status?: AuditStatus;
  description: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  headers?: HeadersLike | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export function extractRequestMeta(headers?: HeadersLike | null) {
  if (!headers) return { ipAddress: undefined, userAgent: undefined };
  const forwardedFor = headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() || headers.get("x-real-ip") || undefined;
  const userAgent = headers.get("user-agent") || undefined;
  return { ipAddress: ipAddress ?? undefined, userAgent: userAgent ?? undefined };
}

export async function logAudit(input: LogAuditInput) {
  try {
    await connectDB();
    const fromHeaders = extractRequestMeta(input.headers);
    const ipAddress = input.ipAddress ?? fromHeaders.ipAddress;
    const userAgent = input.userAgent ?? fromHeaders.userAgent;

    await AuditLog.create({
      userId: input.userId || undefined,
      userName: input.userName || "Unknown",
      userEmail: input.userEmail || undefined,
      userRole: input.userRole || undefined,
      action: input.action,
      category: input.category,
      status: input.status ?? "SUCCESS",
      description: input.description,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
