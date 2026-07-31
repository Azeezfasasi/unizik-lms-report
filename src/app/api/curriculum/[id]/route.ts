import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import Curriculum from "@/models/Curriculum";
import { logAudit } from "@/lib/audit/logAudit";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const curriculum = await Curriculum.findById(id).lean();

  if (!curriculum) {
    return NextResponse.json({ message: "Curriculum not found" }, { status: 404 });
  }

  return NextResponse.json(curriculum);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const payload = await request.json();
  const curriculum = await Curriculum.findByIdAndUpdate(id, payload, { new: true });

  if (!curriculum) {
    return NextResponse.json({ message: "Curriculum not found" }, { status: 404 });
  }

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "CURRICULUM_UPDATED",
    category: "ACADEMIC_STRUCTURE",
    description: `${session?.user?.name ?? "Someone"} updated curriculum ${curriculum.programName}`,
    entityType: "Curriculum",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json(curriculum);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const curriculum = await Curriculum.findByIdAndDelete(id);

  if (!curriculum) {
    return NextResponse.json({ message: "Curriculum not found" }, { status: 404 });
  }

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "CURRICULUM_DELETED",
    category: "ACADEMIC_STRUCTURE",
    description: `${session?.user?.name ?? "Someone"} deleted curriculum ${curriculum.programName}`,
    entityType: "Curriculum",
    entityId: id,
    headers: request.headers,
  });

  return NextResponse.json({ message: "Curriculum deleted" });
}
