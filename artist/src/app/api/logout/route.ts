import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { destroyArtistSession } from "@/lib/auth";

/** POST-only: a GET link would let any page log the artist out. */
export async function POST(request: NextRequest) {
  await destroyArtistSession();
  return NextResponse.redirect(new URL("/login", request.url), {
    status: 303,
  });
}
