import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import type { AssociateProvostField } from "@/types/portal";

export const REVIEWER_ROLES = ["ADMIN", "DEAN", "SUB_DEAN"] as const;
export const REPORT_SUBMITTER_ROLES = ["ADMIN", "HOD", "PG_COORDINATOR", "SUPERVISOR"] as const;

export type ReportScope = {
  facultyId?: string;
  departmentId?: string;
  associateProvostField?: AssociateProvostField;
};

export async function getPortalSession() {
  return getServerSession(authOptions);
}

export function isAdmin(role?: string) {
  return role === "ADMIN";
}

export function canReviewReport(role: string | undefined, userFacultyId: string | undefined, reportFacultyId?: string) {
  if (role === "ADMIN") return true;
  if (role !== "DEAN" && role !== "SUB_DEAN") return false;
  return Boolean(userFacultyId && reportFacultyId && userFacultyId === reportFacultyId);
}

export function canViewAssociateProvostReport(role: string | undefined, field: string | undefined, reportField?: string) {
  if (role === "ADMIN") return true;
  return role === "ASSOCIATE_PROVOST" && Boolean(field && reportField && field === reportField);
}

export function canSubmitReport(role: string | undefined, reportAuthorId: string | undefined, userId: string | undefined) {
  if (role === "ADMIN") return true;
  return REPORT_SUBMITTER_ROLES.includes(role as (typeof REPORT_SUBMITTER_ROLES)[number]) && reportAuthorId === userId;
}

export function canEditReport(status: string | undefined) {
  return status === "DRAFT" || status === "REVISION_REQUESTED";
}

export function normalizeRole(role?: string) {
  return role?.toUpperCase().trim();
}