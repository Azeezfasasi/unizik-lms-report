import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import Department from "@/models/Department";
import { logAudit } from "@/lib/audit/logAudit";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const department = await Department.findById(id).lean();

  if (!department) {
    return NextResponse.json({ message: "Department not found" }, { status: 404 });
  }

  return NextResponse.json(department);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const payload = await request.json();
  const department = await Department.findByIdAndUpdate(id, payload, { new: true }).lean();

  if (!department) {
    return NextResponse.json({ message: "Department not found" }, { status: 404 });
  }

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "DEPARTMENT_UPDATED",
    category: "ACADEMIC_STRUCTURE",
    description: `${session?.user?.name ?? "Someone"} updated department ${department.name}`,
    entityType: "Department",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json(department);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const department = await Department.findByIdAndDelete(id).lean();

  if (!department) {
    return NextResponse.json({ message: "Department not found" }, { status: 404 });
  }

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "DEPARTMENT_DELETED",
    category: "ACADEMIC_STRUCTURE",
    description: `${session?.user?.name ?? "Someone"} deleted department ${department.name}`,
    entityType: "Department",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json({ message: "Department deleted" });
}
