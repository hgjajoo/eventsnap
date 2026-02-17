import Redis from "ioredis";

const getRedisUrl = (): string => {
    if (process.env.REDIS_URL) {
        return process.env.REDIS_URL;
    }
    return "redis://localhost:6379";
};

// Singleton pattern to avoid creating multiple connections in dev (Next.js HMR)
const globalForRedis = globalThis as unknown as {
    redis: InstanceType<typeof Redis> | undefined;
};

export const redis =
    globalForRedis.redis ??
    new Redis(getRedisUrl(), {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
            if (times > 3) return null; // Stop retrying after 3 attempts
            return Math.min(times * 200, 2000);
        },
        lazyConnect: true,
    });

if (process.env.NODE_ENV !== "production") {
    globalForRedis.redis = redis;
}

// ─── Rate Limiter ────────────────────────────────────────
interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetIn: number; // seconds
}

/**
 * Simple sliding-window rate limiter using Redis.
 * @param key    Unique identifier (e.g., `ratelimit:login:{ip}`)
 * @param limit  Max requests allowed in the window
 * @param windowSeconds  Time window in seconds
 */
export async function rateLimit(
    key: string,
    limit: number,
    windowSeconds: number
): Promise<RateLimitResult> {
    try {
        await redis.connect().catch(() => { }); // Connect if not connected

        const current = await redis.incr(key);
        if (current === 1) {
            await redis.expire(key, windowSeconds);
        }

        const ttl = await redis.ttl(key);

        return {
            allowed: current <= limit,
            remaining: Math.max(0, limit - current),
            resetIn: ttl > 0 ? ttl : windowSeconds,
        };
    } catch {
        // If Redis is unavailable, allow the request (fail open)
        console.warn("Redis unavailable, rate limiting disabled");
        return { allowed: true, remaining: limit, resetIn: 0 };
    }
}

export default redis;
