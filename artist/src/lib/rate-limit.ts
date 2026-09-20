/**
 * In-memory IP rate limiter for the public join form and its uploads.
 *
 * This is per-instance state. On Vercel each serverless instance keeps its
 * own map, so a determined attacker spread across instances gets more than
 * the stated limit — it stops casual form spam, not a botnet. If abuse
 * becomes real, move this to Upstash Redis; the call site stays the same.
 */

type Entry = { count: number; resetAt: number };

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_PER_WINDOW = 5;

const hits = new Map<string, Entry>();

/** Drop expired entries so the map cannot grow without bound. */
function sweep(now: number) {
  if (hits.size < 500) return;
  for (const [key, entry] of hits) {
    if (entry.resetAt <= now) hits.delete(key);
  }
}

export function checkRateLimit(ip: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  sweep(now);

  const entry = hits.get(ip);
  if (!entry || entry.resetAt <= now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= MAX_PER_WINDOW) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Best-effort client IP. Vercel sets x-forwarded-for; the left-most entry
 * is the original client. Falls back to a constant so a missing header
 * throttles everyone together rather than disabling the limit entirely.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}
