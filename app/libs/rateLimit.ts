/**
 * Lightweight in-memory fixed-window rate limiter.
 *
 * NOTE: state lives in this Node process only, so it is effective for a single
 * instance / long-lived server. For multi-instance or serverless deployments,
 * swap the `buckets` Map for a shared store (e.g. Upstash Redis @upstash/ratelimit).
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetAt: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
    const now = Date.now();

    // Opportunistic cleanup so one-off keys don't grow the map unbounded.
    if (buckets.size > 10000) {
        buckets.forEach((b, k) => {
            if (b.resetAt <= now) buckets.delete(k);
        });
    }

    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
        const resetAt = now + windowMs;
        buckets.set(key, { count: 1, resetAt });
        return { success: true, remaining: limit - 1, resetAt };
    }

    if (bucket.count >= limit) {
        return { success: false, remaining: 0, resetAt: bucket.resetAt };
    }

    bucket.count += 1;
    return { success: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

type HeaderBag = Headers | Record<string, string | string[] | undefined> | undefined;

/** Best-effort client IP from proxy headers. Falls back to 'unknown'. */
export function getClientIp(headers: HeaderBag): string {
    if (!headers) return 'unknown';

    const read = (name: string): string | undefined => {
        if (headers instanceof Headers) return headers.get(name) ?? undefined;
        const value = headers[name];
        return Array.isArray(value) ? value[0] : value;
    };

    const forwarded = read('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();

    return read('x-real-ip') ?? 'unknown';
}
