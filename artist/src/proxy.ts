import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Guards the studio. In Next 16 the `middleware` convention is deprecated and
 * renamed to `proxy` — see
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
 *
 * Verifies the token itself rather than calling into src/lib/auth: the proxy
 * is deployed separately from render code and must not rely on shared module
 * state, and the Edge runtime has no database access to re-check approval.
 * That deeper check happens in getArtistSession on every page.
 *
 * Unlike the owner panel, most of this app is public: the join form, login,
 * and invite redemption all have to be reachable by someone with no session.
 * Only /studio is behind the gate.
 */

const COOKIE = "kasityot_artist_session";
const PROTECTED = "/studio";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith(PROTECTED)) return NextResponse.next();

  const token = request.cookies.get(COOKIE)?.value;
  if (!token) return redirectToLogin(request);

  const secret = process.env.ARTIST_SESSION_SECRET;
  if (!secret) return redirectToLogin(request);

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    // Expired or tampered — clear it so the browser stops resending.
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
