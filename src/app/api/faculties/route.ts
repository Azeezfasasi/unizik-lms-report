import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import Faculty from "@/models/Faculty";
import { logAudit } from "@/lib/audit/logAudit";

export async function GET() {
  await connectDB();
  const faculties = await Faculty.find({}).lean();
  return NextResponse.json(faculties);
}

export async function POST(request: Request) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const payload = await request.json();
  const faculty = await Faculty.create(payload);

  await logAudit({
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    action: "FACULTY_CREATED",
    category: "ACADEMIC_STRUCTURE",
    description: `${session?.user?.name ?? "Someone"} created faculty ${faculty.name}`,
    entityType: "Faculty",
    entityId: faculty._id.toString(),
    headers: request.headers,
  });

  return NextResponse.json(faculty, { status: 201 });
}
