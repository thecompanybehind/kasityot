import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { VIDEO_EAGER, VIDEO_FOLDER, VIDEO_FORMATS } from "@kasityot/core/video";
import { getArtistSession } from "@/lib/auth";

/**
 * Signs a video upload so the browser can send the file straight to
 * Cloudinary.
 *
 * Photographs go through /api/upload, which buffers the file on this server.
 * A video is ten or a hundred times the size: buffering it here would exceed
 * the host's request limit and hold the whole file in memory. So this route
 * handles no bytes at all — it only vouches for the upload.
 *
 * The signature covers the folder, the allowed formats and the transcode, so
 * a signed request cannot be redirected elsewhere or used for another kind of
 * file. Signed-in artists only: unlike a join-form photograph, nobody without
 * an account has a reason to send a video.
 */
export async function POST() {
  const session = await getArtistSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Video uploads are not set up yet." },
      { status: 500 },
    );
  }

  // Every field here must be posted to Cloudinary exactly as signed.
  const params = {
    allowed_formats: VIDEO_FORMATS,
    eager: VIDEO_EAGER,
    eager_async: "true",
    folder: VIDEO_FOLDER,
    timestamp: String(Math.round(Date.now() / 1000)),
  };

  return NextResponse.json({
    url: `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    apiKey,
    signature: cloudinary.utils.api_sign_request(params, apiSecret),
    params,
  });
}
