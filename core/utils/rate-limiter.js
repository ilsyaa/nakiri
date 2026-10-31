export class RateLimiter {
  cache;

  constructor(cache) {
    this.cache = cache;
  }

  async tooManyAttempts(key, maxAttempts) {
    const data = await this.cache.get(`ratelimit:${key}`);
    if (!data) return false;
    return data.count >= maxAttempts;
  }

  async hit(key, decaySeconds = 60) {
    const cacheKey = `ratelimit:${key}`;
    const data = await this.cache.get(cacheKey);
    const now = Date.now();

    if (!data) {
      await this.cache.set(
        cacheKey,
        { count: 1, resetAt: now + decaySeconds * 1000 },
        decaySeconds * 1000
      );
      return 1;
    }

    const ttl = Math.max(0, data.resetAt - now);
    if (ttl > 0) {
      const newCount = data.count + 1;
      await this.cache.set(
        cacheKey,
        { count: newCount, resetAt: data.resetAt },
        ttl
      );
      return newCount;
    }

    await this.cache.set(
      cacheKey,
      { count: 1, resetAt: now + decaySeconds * 1000 },
      decaySeconds * 1000
    );
    return 1;
  }

  async attempt(key, maxAttempts, callback, decaySeconds = 60) {
    if (await this.tooManyAttempts(key, maxAttempts)) {
      return false;
    }
    await this.hit(key, decaySeconds);
    return await callback();
  }

  async availableIn(key) {
    const data = await this.cache.get(`ratelimit:${key}`);
    if (!data) return 0;
    const remaining = Math.ceil((data.resetAt - Date.now()) / 1000);
    return Math.max(0, remaining);
  }

  async remaining(key, maxAttempts) {
    const data = await this.cache.get(`ratelimit:${key}`);
    if (!data) return maxAttempts;
    return Math.max(0, maxAttempts - data.count);
  }

  async clear(key) {
    await this.cache.del(`ratelimit:${key}`);
  }
}

export default RateLimiter;
