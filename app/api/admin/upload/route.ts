import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { getAdminSession } from "@/lib/auth/session";

// firebase-admin / cloudinary need Node APIs; edge runtime would break them.
export const runtime = "nodejs";

const MAX_SIZE = 15 * 1024 * 1024;

function ensureCloudinaryConfigured() {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env.local.",
    );
  }
  cloudinary.config({
    cloud_name: cloud,
    api_key: key,
    api_secret: secret,
    secure: true,
  });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const folder = (formData.get("folder") as string) || "properties/_unsorted";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }

  try {
    ensureCloudinaryConfigured();
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const isVideo = (file.type || "").startsWith("video/");

  // Cloudinary expects a callback upload_stream for raw buffers; wrap it in a
  // promise so we can await it cleanly in the route handler.
  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder.replace(/^\/+/, ""),
        resource_type: isVideo ? "video" : "image",
        overwrite: false,
        unique_filename: true,
        use_filename: true,
        // Reasonable upload-time transformation for property photos:
        // cap at 2400px wide, auto format + quality. Only for images.
        ...(isVideo
          ? {}
          : {
              eager: [
                { width: 2400, crop: "limit", fetch_format: "auto", quality: "auto:good" },
              ],
            }),
      },
      (error, uploaded) => {
        if (error || !uploaded) return reject(error ?? new Error("Upload failed"));
        resolve(uploaded);
      },
    );
    stream.end(buffer);
  });

  return NextResponse.json({
    url: result.secure_url,
    path: result.public_id,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    format: result.format,
    resourceType: result.resource_type,
  });
}
