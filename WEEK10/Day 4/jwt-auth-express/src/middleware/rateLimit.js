/**
 * Step 10 exercise #7: simple in-memory sliding-window rate limiter.
 * For production use a shared store (Redis) so limits survive restarts
 * and work across multiple server instances.
 */
const buckets = new Map();

function rateLimit({ windowMs, max, skipSuccessful = false }) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    const hits = (buckets.get(key) || []).filter((t) => t > windowStart);
    if (hits.length >= max) {
      res.set("Retry-After", String(Math.ceil(windowMs / 1000)));
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }

    hits.push(now);
    buckets.set(key, hits);

    if (skipSuccessful) {
      // only count failed attempts: on success, drop the recorded hit
      res.on("finish", () => {
        if (res.statusCode < 400) {
          const current = buckets.get(key) || [];
          const idx = current.lastIndexOf(hits[hits.length - 1]);
          if (idx !== -1) current.splice(idx, 1);
        }
      });
    }
    next();
  };
}

module.exports = { rateLimit };
