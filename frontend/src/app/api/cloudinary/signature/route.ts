import { NextResponse } from "next/server";
import { signCloudinaryUpload } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const body = await request.json();
  const folder = body.folder || "clozet";
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = {
    folder,
    timestamp
  };

  const signature = signCloudinaryUpload(paramsToSign);

  return NextResponse.json({
    timestamp,
    folder,
    signature,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY
  });
}
