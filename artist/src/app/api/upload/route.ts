import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getArtistSession } from "@/lib/auth";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Image uploads for the studio and for the public join form.
 *
 * The join form has to accept a photograph from someone who has no account
 * yet, so this route cannot simply require a session. Anonymous uploads are
 * instead rate limited per IP and sent to a separate Cloudinary folder, so
 * anything swept up by abuse can be cleared without touching real work.
 *
 * Signed-in artists skip the limit: they are known, and a legitimate piece
 * may carry a dozen photographs.
 */
export async function POST(request: Request) {
  const session = await getArtistSession();

  if (!session) {
    const { allowed, retryAfterSeconds } = checkRateLimit(
      `upload:${clientIp(request.headers)}`,
    );
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many uploads just now. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
      );
    }
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file supplied" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "Use a JPEG, PNG, WebP or AVIF image." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "That image is over 10 MB. Please compress it first." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: session
                ? "kasityot/submissions"
                : "kasityot/applications",
              resource_type: "image",
            },
            (err, res) => {
              if (err || !res) reject(err ?? new Error("Upload failed"));
              else resolve(res as { secure_url: string });
            },
          )
          .end(buffer);
      },
    );
    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Upload failed" },
      { status: 500 },
    );
  }
}
