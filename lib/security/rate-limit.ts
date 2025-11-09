import { NextRequest } from 'next/server';

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per window
}

const rateLimitMap = new Map<string, number[]>();

/**
 * Simple in-memory rate limiter
 * For production, use Redis-backed rate limiting
 */
export function rateLimit(config: RateLimitConfig) {
  const { interval, uniqueTokenPerInterval } = config;

  return {
    check: (token: string): { success: boolean; remaining: number } => {
      const now = Date.now();
      const tokenTimestamps = rateLimitMap.get(token) || [];

      // Remove old timestamps outside the window
      const validTimestamps = tokenTimestamps.filter(
        (timestamp) => now - timestamp < interval
      );

      // Check if limit exceeded
      if (validTimestamps.length >= uniqueTokenPerInterval) {
        rateLimitMap.set(token, validTimestamps);
        return {
          success: false,
          remaining: 0,
        };
      }

      // Add current request
      validTimestamps.push(now);
      rateLimitMap.set(token, validTimestamps);

      return {
        success: true,
        remaining: uniqueTokenPerInterval - validTimestamps.length,
      };
    },
  };
}

/**
 * Get rate limit token from request (IP address or user ID)
 */
export function getRateLimitToken(request: NextRequest): string {
  // Try to get user ID from session/token first
  const userId = request.headers.get('x-user-id');
  if (userId) return `user:${userId}`;

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  return `ip:${ip}`;
}

/**
 * Default rate limiter for API routes
 * 100 requests per 15 minutes
 */
export const apiRateLimiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 100,
});

/**
 * Strict rate limiter for auth endpoints
 * 5 requests per minute
 */
export const authRateLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 5,
});
