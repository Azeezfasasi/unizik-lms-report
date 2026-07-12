import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import Faculty from "@/models/Faculty";

export async function GET() {
  await connectDB();
  const faculties = await Faculty.find({}).lean();
  return NextResponse.json(faculties);
}

export async function POST(request: Request) {
  await connectDB();
  const payload = await request.json();
  const faculty = await Faculty.create(payload);
  return NextResponse.json(faculty, { status: 201 });
}
