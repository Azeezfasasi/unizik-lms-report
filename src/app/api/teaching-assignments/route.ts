import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectDB } from "@/lib/db/connectDB";
import TeachingAssignment from "@/models/TeachingAssignment";
import { logAudit } from "@/lib/audit/logAudit";

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);

  const filter: Record<string, unknown> = {};
  for (const key of ["courseId", "lecturerId", "academicSession", "semester"]) {
    const value = searchParams.get(key);
    if (value) filter[key] = value;
  }

  const assignments = await TeachingAssignment.find(filter).populate("lecturerId", "name email").lean();
  return NextResponse.json(assignments);
}

export async function POST(request: Request) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const payload = await request.json();

  for (const field of ["courseId", "lecturerId", "academicSession", "semester"]) {
    if (!payload[field]) {
      return NextResponse.json({ message: `${field} is required.` }, { status: 400 });
    }
  }

  try {
    const assignment = await TeachingAssignment.create(payload);

    await logAudit({
      userId: session?.user?.id,
      userName: session?.user?.name,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      action: "TEACHING_ASSIGNMENT_CREATED",
      category: "SCHEDULING",
      description: `${session?.user?.name ?? "Someone"} created a teaching assignment`,
      entityType: "TeachingAssignment",
      entityId: assignment._id.toString(),
      headers: request.headers,
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { message: "This lecturer is already assigned to this course for the given session and semester." },
        { status: 409 }
      );
    }
    return NextResponse.json({ message: "Unable to create teaching assignment." }, { status: 500 });
  }
}
