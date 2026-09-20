import mongoose from "mongoose";

/**
 * MongoDB Atlas connection.
 *
 * Next.js hot-reloads modules in dev, which would open a new connection pool
 * on every edit and exhaust Atlas's limit. The connection is cached on the
 * global object so it survives reloads, and the in-flight promise is cached
 * too so concurrent requests during a cold start share one connect() call.
 */

type Cached = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var _mongoose: Cached | undefined;
}

const cached: Cached = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  // Read at call time, not module load: scripts load .env.local via dotenv
  // after the import graph is already evaluated.
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error(
      "DATABASE_URL is not set. Add your MongoDB Atlas connection string to .env.local",
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      // Fail fast with a clear error rather than hanging a page render.
      serverSelectionTimeoutMS: 10_000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Clear the failed promise so the next request retries instead of
    // replaying the same rejection forever.
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
