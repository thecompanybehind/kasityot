import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { destroyWholesalerSession } from "@/lib/auth";

/** POST-only: a GET link would let any page sign the wholesaler out. */
export async function POST(request: NextRequest) {
  await destroyWholesalerSession();
  return NextResponse.redirect(new URL("/login", request.url), {
    status: 303,
  });
}
