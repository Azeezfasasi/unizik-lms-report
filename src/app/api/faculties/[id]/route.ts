import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import Faculty from "@/models/Faculty";
import { logAudit } from "@/lib/audit/logAudit";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const faculty = await Faculty.findById(id).lean();

  if (!faculty) {
    return NextResponse.json({ message: "Faculty not found" }, { status: 404 });
  }

  return NextResponse.json(faculty);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const payload = await request.json();
  const faculty = await Faculty.findByIdAndUpdate(id, payload, { new: true }).lean();

  if (!faculty) {
    return NextResponse.json({ message: "Faculty not found" }, { status: 404 });
  }

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "FACULTY_UPDATED",
    category: "ACADEMIC_STRUCTURE",
    description: `${session?.user?.name ?? "Someone"} updated faculty ${faculty.name}`,
    entityType: "Faculty",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json(faculty);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const faculty = await Faculty.findByIdAndDelete(id).lean();

  if (!faculty) {
    return NextResponse.json({ message: "Faculty not found" }, { status: 404 });
  }

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "FACULTY_DELETED",
    category: "ACADEMIC_STRUCTURE",
    description: `${session?.user?.name ?? "Someone"} deleted faculty ${faculty.name}`,
    entityType: "Faculty",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json({ message: "Faculty deleted" });
}
