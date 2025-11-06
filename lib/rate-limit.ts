/**
 * Simple in-memory rate limiter
 *
 * For production with multiple instances, consider using:
 * - @upstash/ratelimit with Redis
 * - Vercel Edge Config
 * - External rate limiting service
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor(maxRequests: number = 10, windowSeconds: number = 60) {
    this.maxRequests = maxRequests;
    this.windowMs = windowSeconds * 1000;

    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Check if request should be rate limited
   * @param identifier - Usually IP address or user ID
   * @returns { limited: boolean, remaining: number, resetTime: number }
   */
  check(identifier: string): { limited: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    // No previous requests or window expired
    if (!entry || now > entry.resetTime) {
      const resetTime = now + this.windowMs;
      this.requests.set(identifier, {
        count: 1,
        resetTime,
      });
      return {
        limited: false,
        remaining: this.maxRequests - 1,
        resetTime,
      };
    }

    // Within rate limit window
    if (entry.count < this.maxRequests) {
      entry.count++;
      return {
        limited: false,
        remaining: this.maxRequests - entry.count,
        resetTime: entry.resetTime,
      };
    }

    // Rate limit exceeded
    return {
      limited: true,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  /**
   * Clean up on shutdown
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.requests.clear();
  }
}

// Create rate limiter instances for different endpoints
export const apiRateLimiter = new RateLimiter(10, 60); // 10 requests per minute
export const lessonCreationRateLimiter = new RateLimiter(5, 60); // 5 lesson creations per minute

/**
 * Get client identifier from request
 * Uses IP address, falling back to a default for development
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (works with most proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, use the first one
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback for local development
  return 'dev-client';
}
