import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary/cloudinary";

export async function POST(request: Request) {
  const { file, folder = "unizik-lms" } = await request.json();

  const uploadResult = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "auto",
  });

  return NextResponse.json({ url: uploadResult.secure_url, publicId: uploadResult.public_id });
}
