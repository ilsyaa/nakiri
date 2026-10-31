import { LRUCache } from 'lru-cache';
import { createHash } from 'node:crypto';

/**
 * Deterministically serialize any value to a JSON string.
 * Recursively sorts object keys so { a: 1, b: 2 } and { b: 2, a: 1 } serialize identically.
 *
 * @param {*} value
 * @param {WeakSet<object>} [seen]
 * @returns {string}
 */
export function stableStringify(value, seen = new WeakSet()) {
  if (value === null || value === undefined) {
    return String(value);
  }

  const type = typeof value;
  if (type !== 'object') {
    return JSON.stringify(value);
  }

  if (Buffer.isBuffer(value)) {
    return `{"__buffer__":"${value.toString('hex')}"}`;
  }

  if (seen.has(value)) {
    return '"[Circular]"';
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item, seen)).join(',')}]`;
  }

  if (value instanceof Date) {
    return `{"__date__":"${value.toISOString()}"}`;
  }

  if (value instanceof RegExp) {
    return `{"__regexp__":"${value.toString()}"}`;
  }

  if (value instanceof Set) {
    const sorted = Array.from(value)
      .map((v) => stableStringify(v, seen))
      .sort();
    return `{"__set__":[${sorted.join(',')}]}`;
  }

  if (value instanceof Map) {
    const entries = Array.from(value.entries())
      .map(([k, v]) => [stableStringify(k, seen), stableStringify(v, seen)])
      .sort(([k1], [k2]) => k1.localeCompare(k2));
    return `{"__map__":[${entries.map(([k, v]) => `[${k},${v}]`).join(',')}]}`;
  }

  const keys = Object.keys(value).sort();
  const pairs = keys.map(
    (key) => `${JSON.stringify(key)}:${stableStringify(value[key], seen)}`
  );
  return `{${pairs.join(',')}}`;
}

/**
 * Hash any input deterministically into a SHA-256 hexadecimal string.
 *
 * @param {*} input
 * @returns {string}
 */
export function hashKey(input) {
  if (typeof input === 'string') {
    return createHash('sha256').update(input).digest('hex');
  }
  return createHash('sha256').update(stableStringify(input)).digest('hex');
}

/**
 * Parse duration input (number in ms or string like '15m', '10s', '1h', '2d') into milliseconds.
 *
 * @param {number | string} [val]
 * @returns {number | undefined}
 */
export function parseDuration(val) {
  if (typeof val === 'number') return val;
  if (typeof val !== 'string') return undefined;
  const match = val.trim().match(/^(\d+(?:\.\d+)?)\s*(ms|s|m|h|d)?$/i);
  if (!match) return undefined;
  const num = parseFloat(match[1]);
  const unit = (match[2] || 'ms').toLowerCase();
  switch (unit) {
    case 's':
      return num * 1000;
    case 'm':
      return num * 60 * 1000;
    case 'h':
      return num * 60 * 60 * 1000;
    case 'd':
      return num * 24 * 60 * 60 * 1000;
    case 'ms':
    default:
      return num;
  }
}

/**
 * Scoped cache wrapper providing a namespace prefix for all keys.
 */
export class CacheNamespace {
  #parent;
  #prefix;

  /**
   * @param {CacheService} parent
   * @param {string} prefix
   */
  constructor(parent, prefix) {
    this.#parent = parent;
    this.#prefix = prefix.endsWith(':') ? prefix : `${prefix}:`;
  }

  get prefix() {
    return this.#prefix;
  }

  #qualify(key) {
    return `${this.#prefix}${typeof key === 'object' && key !== null ? hashKey(key) : String(key)}`;
  }

  /**
   * Get an item from this namespace.
   *
   * @param {*} key
   * @param {*} [defaultValue]
   * @returns {*}
   */
  get(key, defaultValue = undefined) {
    return this.#parent.get(this.#qualify(key), defaultValue);
  }

  /**
   * Set an item in this namespace.
   *
   * @param {*} key
   * @param {*} value
   * @param {number | string | import('lru-cache').LRUCache.SetOptions<string, any, unknown>} [ttlOrOptions]
   * @returns {this}
   */
  set(key, value, ttlOrOptions) {
    this.#parent.set(this.#qualify(key), value, ttlOrOptions);
    return this;
  }

  /**
   * Determine if an item exists in this namespace.
   *
   * @param {*} key
   * @returns {boolean}
   */
  has(key) {
    return this.#parent.has(this.#qualify(key));
  }

  /**
   * Delete an item from this namespace.
   *
   * @param {*} key
   * @returns {boolean}
   */
  delete(key) {
    return this.#parent.delete(this.#qualify(key));
  }

  /**
   * Alias for delete().
   */
  del(key) {
    return this.delete(key);
  }

  /**
   * Retrieve an item and delete it from this namespace.
   *
   * @param {*} key
   * @param {*} [defaultValue]
   * @returns {*}
   */
  pull(key, defaultValue = undefined) {
    return this.#parent.pull(this.#qualify(key), defaultValue);
  }

  /**
   * Get an item from this namespace, or resolve factory and store result.
   *
   * @param {*} key
   * @param {number | string | import('lru-cache').LRUCache.SetOptions<string, any, unknown> | Function} ttlOrFactory
   * @param {Function} [factoryFn]
   * @returns {Promise<*>}
   */
  remember(key, ttlOrFactory, factoryFn) {
    return this.#parent.remember(this.#qualify(key), ttlOrFactory, factoryFn);
  }

  /**
   * Alias for remember().
   */
  getOrSet(key, ttlOrFactory, factoryFn) {
    return this.remember(key, ttlOrFactory, factoryFn);
  }

  /**
   * Get an item, or store factory result permanently (ttl: 0) in this namespace.
   *
   * @param {*} key
   * @param {Function} factoryFn
   * @returns {Promise<*>}
   */
  rememberForever(key, factoryFn) {
    return this.#parent.rememberForever(this.#qualify(key), factoryFn);
  }

  /**
   * Clear all items within this namespace.
   *
   * @returns {number} Number of deleted keys
   */
  clear() {
    return this.#parent.deletePrefix(this.#prefix);
  }

  /**
   * Alias for clear().
   */
  flush() {
    return this.clear();
  }

  /**
   * Create a sub-namespace.
   *
   * @param {string} subPrefix
   * @returns {CacheNamespace}
   */
  namespace(subPrefix) {
    return new CacheNamespace(this.#parent, `${this.#prefix}${subPrefix}`);
  }

  /**
   * Hash any input deterministically.
   *
   * @param {*} input
   * @returns {string}
   */
  hash(input) {
    return this.#parent.hash(input);
  }
}

/**
 * Standard Unified Cache Driver Service built on top of lru-cache.
 */
export class CacheService {
  #lru;
  #inFlight = new Map();
  #defaultTtl;

  /**
   * @param {Partial<import('lru-cache').LRUCache.Options<string, any, unknown>>} [options]
   */
  constructor(options = {}) {
    const {
      max = 10_000,
      ttl = 15 * 60 * 1000, // 15 minutes default
      allowStale = false,
      updateAgeOnGet = false,
      updateAgeOnHas = false,
      ...rest
    } = options;

    this.#defaultTtl = ttl;
    this.#lru = new LRUCache({
      max,
      ttl,
      allowStale,
      updateAgeOnGet,
      updateAgeOnHas,
      ...rest,
    });
  }

  /**
   * Raw underlying LRUCache instance.
   */
  get raw() {
    return this.#lru;
  }

  /**
   * Total number of cached entries.
   */
  get size() {
    return this.#lru.size;
  }

  /**
   * Default configured TTL in milliseconds.
   */
  get defaultTtl() {
    return this.#defaultTtl;
  }

  /**
   * Normalize input into a string cache key.
   * If key is an object, it is automatically hashed deterministically.
   *
   * @param {*} key
   * @returns {string}
   */
  normalizeKey(key) {
    if (typeof key === 'string') return key;
    if (
      typeof key === 'number' ||
      typeof key === 'boolean' ||
      typeof key === 'bigint'
    ) {
      return String(key);
    }
    return hashKey(key);
  }

  /**
   * Hash any input deterministically into a SHA-256 hexadecimal string.
   *
   * @param {*} input
   * @returns {string}
   */
  hash(input) {
    return hashKey(input);
  }

  /**
   * Get an item from the cache.
   *
   * @param {*} key
   * @param {*} [defaultValue]
   * @returns {*}
   */
  get(key, defaultValue = undefined) {
    const normKey = this.normalizeKey(key);
    const value = this.#lru.get(normKey);
    if (value !== undefined) {
      return value;
    }
    return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
  }

  /**
   * Set an item in the cache with optional TTL.
   *
   * @param {*} key
   * @param {*} value
   * @param {number | string | import('lru-cache').LRUCache.SetOptions<string, any, unknown>} [ttlOrOptions]
   * @returns {this}
   */
  set(key, value, ttlOrOptions) {
    const normKey = this.normalizeKey(key);
    let options;

    if (typeof ttlOrOptions === 'number' || typeof ttlOrOptions === 'string') {
      const parsedTtl = parseDuration(ttlOrOptions);
      options = parsedTtl !== undefined ? { ttl: parsedTtl } : undefined;
    } else if (ttlOrOptions && typeof ttlOrOptions === 'object') {
      options = { ...ttlOrOptions };
      if (typeof options.ttl === 'string') {
        options.ttl = parseDuration(options.ttl);
      }
    }

    this.#lru.set(normKey, value, options);
    return this;
  }

  /**
   * Determine if an item exists in the cache and is not expired.
   *
   * @param {*} key
   * @returns {boolean}
   */
  has(key) {
    return this.#lru.has(this.normalizeKey(key));
  }

  /**
   * Delete an item from the cache.
   *
   * @param {*} key
   * @returns {boolean}
   */
  delete(key) {
    const normKey = this.normalizeKey(key);
    this.#inFlight.delete(normKey);
    return this.#lru.delete(normKey);
  }

  /**
   * Alias for delete().
   */
  del(key) {
    return this.delete(key);
  }

  /**
   * Retrieve an item and delete it from cache.
   *
   * @param {*} key
   * @param {*} [defaultValue]
   * @returns {*}
   */
  pull(key, defaultValue = undefined) {
    const val = this.get(key, defaultValue);
    this.delete(key);
    return val;
  }

  /**
   * Get an item from cache, or resolve factory function and store the result.
   * Supports dogpile / thundering-herd prevention via in-flight promise deduplication.
   *
   * @param {*} key
   * @param {number | string | import('lru-cache').LRUCache.SetOptions<string, any, unknown> | Function} ttlOrFactory
   * @param {Function} [factoryFn]
   * @returns {Promise<*>}
   */
  async remember(key, ttlOrFactory, factoryFn) {
    const normKey = this.normalizeKey(key);

    let ttl;
    let factory;

    if (typeof ttlOrFactory === 'function') {
      factory = ttlOrFactory;
      ttl = undefined;
    } else {
      ttl = ttlOrFactory;
      factory = factoryFn;
    }

    if (typeof factory !== 'function') {
      throw new TypeError(
        `[Cache] Factory callback for key "${normKey}" must be a function.`
      );
    }

    // 1. Return cached value if exists and not expired
    if (this.#lru.has(normKey)) {
      return this.#lru.get(normKey);
    }

    // 2. Coalesce concurrent requests (anti-dogpiling / thundering herd)
    if (this.#inFlight.has(normKey)) {
      return await this.#inFlight.get(normKey);
    }

    // 3. Execute factory
    const executionPromise = (async () => {
      try {
        const result = await factory();
        if (result !== undefined) {
          this.set(normKey, result, ttl);
        }
        return result;
      } finally {
        this.#inFlight.delete(normKey);
      }
    })();

    this.#inFlight.set(normKey, executionPromise);
    return await executionPromise;
  }

  /**
   * Alias for remember().
   */
  getOrSet(key, ttlOrFactory, factoryFn) {
    return this.remember(key, ttlOrFactory, factoryFn);
  }

  /**
   * Get an item from cache, or store factory result permanently (ttl: 0).
   *
   * @param {*} key
   * @param {Function} factoryFn
   * @returns {Promise<*>}
   */
  rememberForever(key, factoryFn) {
    return this.remember(key, { ttl: 0 }, factoryFn);
  }

  /**
   * Delete all keys that start with the given prefix.
   *
   * @param {string} prefix
   * @returns {number} Number of deleted keys
   */
  deletePrefix(prefix) {
    let deletedCount = 0;
    for (const key of this.#lru.keys()) {
      if (typeof key === 'string' && key.startsWith(prefix)) {
        this.#inFlight.delete(key);
        if (this.#lru.delete(key)) {
          deletedCount++;
        }
      }
    }
    return deletedCount;
  }

  /**
   * Delete all keys matching a regular expression.
   *
   * @param {RegExp} pattern
   * @returns {number} Number of deleted keys
   */
  deletePattern(pattern) {
    let deletedCount = 0;
    for (const key of this.#lru.keys()) {
      if (typeof key === 'string' && pattern.test(key)) {
        this.#inFlight.delete(key);
        if (this.#lru.delete(key)) {
          deletedCount++;
        }
      }
    }
    return deletedCount;
  }

  /**
   * Clear the entire cache.
   */
  clear() {
    this.#inFlight.clear();
    this.#lru.clear();
  }

  /**
   * Alias for clear().
   */
  flush() {
    this.clear();
  }

  /**
   * Create a namespaced cache wrapper.
   *
   * @param {string} prefix
   * @returns {CacheNamespace}
   */
  namespace(prefix) {
    return new CacheNamespace(this, prefix);
  }

  /**
   * Return an iterator of keys.
   */
  keys() {
    return this.#lru.keys();
  }

  /**
   * Return an iterator of values.
   */
  values() {
    return this.#lru.values();
  }

  /**
   * Return an iterator of [key, value] entries.
   */
  entries() {
    return this.#lru.entries();
  }

  /**
   * Create a new isolated CacheService instance.
   *
   * @param {Partial<import('lru-cache').LRUCache.Options<string, any, unknown>>} [options]
   * @returns {CacheService}
   */
  createInstance(options) {
    return new CacheService(options);
  }
}

/**
 * Global Default Cache Service instance.
 */
export const cache = new CacheService();

export default cache;
