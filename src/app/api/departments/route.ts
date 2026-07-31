import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import Department from "@/models/Department";
import { logAudit } from "@/lib/audit/logAudit";

export async function GET() {
  await connectDB();
  const departments = await Department.find({}).lean();
  return NextResponse.json(departments);
}

export async function POST(request: Request) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const payload = await request.json();
  const department = await Department.create(payload);

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "DEPARTMENT_CREATED",
    category: "ACADEMIC_STRUCTURE",
    description: `${session?.user?.name ?? "Someone"} created department ${department.name}`,
    entityType: "Department",
    entityId: department._id.toString(),
    headers: request.headers,
  });

  return NextResponse.json(department, { status: 201 });
}
