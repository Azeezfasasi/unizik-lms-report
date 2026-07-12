import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import Curriculum from "@/models/Curriculum";

export async function GET() {
  await connectDB();
  const curriculums = await Curriculum.find({}).lean();
  return NextResponse.json(curriculums);
}

export async function POST(request: Request) {
  await connectDB();
  const payload = await request.json();
  const curriculum = await Curriculum.create(payload);
  return NextResponse.json(curriculum, { status: 201 });
}
