/**
 * Simple in-memory rate limiter for login attempts.
 * Note: In a production environment with multiple server instances, 
 * use Redis or Upstash as recommended in the audit.
 */

type RateLimitInfo = {
  count: number;
  lastAttempt: number;
};

const storage = new Map<string, RateLimitInfo>();

const LIMIT = 5; // Max attempts
const WINDOW = 15 * 60 * 1000; // 15 minutes window

export async function checkRateLimit(identifier: string): Promise<{
  success: boolean;
  remaining: number;
  resetTime?: number;
}> {
  const now = Date.now();
  const info = storage.get(identifier);

  if (!info) {
    storage.set(identifier, { count: 1, lastAttempt: now });
    return { success: true, remaining: LIMIT - 1 };
  }

  // Reset if window passed
  if (now - info.lastAttempt > WINDOW) {
    storage.set(identifier, { count: 1, lastAttempt: now });
    return { success: true, remaining: LIMIT - 1 };
  }

  if (info.count >= LIMIT) {
    const resetTime = info.lastAttempt + WINDOW;
    return { success: false, remaining: 0, resetTime };
  }

  info.count += 1;
  info.lastAttempt = now;
  storage.set(identifier, { count: info.count, lastAttempt: now });

  return { success: true, remaining: LIMIT - info.count };
}

// Optional: clean up old entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, info] of storage.entries()) {
      if (now - info.lastAttempt > WINDOW) {
        storage.delete(key);
      }
    }
  }, WINDOW);
}
