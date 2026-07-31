import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import AcademicSession from "@/models/AcademicSession";
import { logAudit } from "@/lib/audit/logAudit";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const authSession = await getServerSession(authOptions);
  const { id } = await params;
  const payload = await request.json();

  if (payload.isCurrent === true) {
    await AcademicSession.updateMany({ _id: { $ne: id } }, { isCurrent: false });
  }

  const session = await AcademicSession.findByIdAndUpdate(id, payload, { new: true }).lean();
  if (!session) {
    return NextResponse.json({ message: "Academic session not found" }, { status: 404 });
  }

  await logAudit({
    userId: authSession?.user?.id,
    userName: authSession?.user?.name,
    userEmail: authSession?.user?.email,
    userRole: authSession?.user?.role,
    action: "ACADEMIC_SESSION_UPDATED",
    category: "SCHEDULING",
    description: `${authSession?.user?.name ?? "Someone"} updated academic session ${session.name}`,
    entityType: "AcademicSession",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json(session);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const authSession = await getServerSession(authOptions);
  const { id } = await params;
  const session = await AcademicSession.findByIdAndDelete(id).lean();

  if (!session) {
    return NextResponse.json({ message: "Academic session not found" }, { status: 404 });
  }

  await logAudit({
    userId: authSession?.user?.id,
    userName: authSession?.user?.name,
    userEmail: authSession?.user?.email,
    userRole: authSession?.user?.role,
    action: "ACADEMIC_SESSION_DELETED",
    category: "SCHEDULING",
    description: `${authSession?.user?.name ?? "Someone"} deleted academic session ${session.name}`,
    entityType: "AcademicSession",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json({ message: "Academic session deleted" });
}
