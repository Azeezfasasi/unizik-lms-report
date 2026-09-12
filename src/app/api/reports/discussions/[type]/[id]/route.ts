import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import { getPortalSession } from "@/lib/auth/reportAccess";
import ReportDiscussion from "@/models/ReportDiscussion";
import User from "@/models/User";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  await connectDB();
  const session = await getPortalSession();
  if (!session?.user) return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  const { type, id } = await params;
  const discussions = await ReportDiscussion.find({ reportType: type, reportId: id })
    .populate("authorId", "name role")
    .sort({ createdAt: 1 })
    .lean();
  return NextResponse.json(discussions);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  await connectDB();
  const session = await getPortalSession();
  if (!session?.user) return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  const { type, id } = await params;
  const body = await request.json();
  const message = String(body.message ?? "").trim();
  if (!message) return NextResponse.json({ message: "A comment is required." }, { status: 400 });

  const author = await User.findById(session.user.id).select("_id").lean();
  if (!author) return NextResponse.json({ message: "User not found." }, { status: 404 });
  const discussion = await ReportDiscussion.create({ reportType: type, reportId: id, authorId: author._id, message, attachmentUrl: body.attachmentUrl });
  const populated = await ReportDiscussion.findById(discussion._id).populate("authorId", "name role").lean();
  return NextResponse.json(populated, { status: 201 });
}