import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import Curriculum from "@/models/Curriculum";
import { logAudit } from "@/lib/audit/logAudit";

export async function GET() {
  await connectDB();
  const curriculums = await Curriculum.find({}).lean();
  return NextResponse.json(curriculums);
}

export async function POST(request: Request) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const payload = await request.json();
  const curriculum = await Curriculum.create(payload);

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "CURRICULUM_CREATED",
    category: "ACADEMIC_STRUCTURE",
    description: `${session?.user?.name ?? "Someone"} created curriculum ${curriculum.programName}`,
    entityType: "Curriculum",
    entityId: curriculum._id.toString(),
    headers: request.headers,
  });

  return NextResponse.json(curriculum, { status: 201 });
}
