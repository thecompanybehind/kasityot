import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Guards the wholesaler panel. In Next 16 the `middleware` convention is
 * deprecated and renamed to `proxy` — see
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
 *
 * Verifies the token's signature only: the proxy has no database access. The
 * account's approval is checked on every page and action (see
 * getWholesaler), and that check, not this one, is what keeps products and
 * prices from anyone not approved.
 *
 * Registration and sign-in must be reachable with no session; the catalogue
 * and enquiries are not.
 */

const COOKIE = "kasityot_wholesale_session";
const PROTECTED = ["/catalogue", "/enquiries"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE)?.value;
  const secret = process.env.WHOLESALE_SESSION_SECRET;
  if (!token || !secret) return redirectToLogin(request);

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    // Expired or tampered: clear it so the browser stops resending.
    const res = redirectToLogin(request);
    res.cookies.delete(COOKIE);
    return res;
  }
}

function redirectToLogin(request: NextRequest) {
  const url = new URL("/login", request.url);
  url.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
