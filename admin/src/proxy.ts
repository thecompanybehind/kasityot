import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Guards every admin path. In Next 16 the `middleware` convention is
 * deprecated and renamed to `proxy` — see
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
 *
 * This runs before any route renders. It verifies the session JWT itself
 * rather than calling into src/lib/auth, because the proxy is deployed
 * separately from render code and must not rely on shared module state.
 */

const COOKIE = "kasityot_session";
const PUBLIC_PATHS = ["/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets and the login page itself are always reachable.
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE)?.value;
  if (!token) return redirectToLogin(request);

  const secret = process.env.SESSION_SECRET;
  if (!secret) return redirectToLogin(request);

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    // Expired or tampered token — clear it so the browser stops resending.
    const res = redirectToLogin(request);
    res.cookies.delete(COOKIE);
    return res;
  }
}

function redirectToLogin(request: NextRequest) {
  const url = new URL("/login", request.url);
  // Remember where they were headed so login can send them back.
  if (request.nextUrl.pathname !== "/") {
    url.searchParams.set("from", request.nextUrl.pathname);
  }
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except Next internals and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
