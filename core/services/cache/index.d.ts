import { LRUCache } from 'lru-cache'

/**
 * Deterministically serialize any value to a JSON string.
 */
export function stableStringify(value: any, seen?: WeakSet<object>): string

/**
 * Hash any input deterministically into a SHA-256 hexadecimal string.
 */
export function hashKey(input: any): string

/**
 * Parse duration input (number in ms or string like '15m', '10s', '1h', '2d') into milliseconds.
 */
export function parseDuration(val?: number | string): number | undefined

/**
 * Scoped cache wrapper providing a namespace prefix for all keys.
 */
export class CacheNamespace {
  constructor(parent: CacheService, prefix: string)

  get prefix(): string

  /**
   * Get an item from this namespace.
   */
  get<T = any>(key: any, defaultValue?: T | (() => T)): T | undefined

  /**
   * Set an item in this namespace with optional TTL or options.
   */
  set(
    key: any,
    value: any,
    ttlOrOptions?: number | string | LRUCache.SetOptions<string, any, unknown>,
  ): this

  /**
   * Determine if an item exists in this namespace.
   */
  has(key: any): boolean

  /**
   * Delete an item from this namespace.
   */
  delete(key: any): boolean

  /**
   * Alias for delete().
   */
  del(key: any): boolean

  /**
   * Retrieve an item and delete it from this namespace.
   */
  pull<T = any>(key: any, defaultValue?: T | (() => T)): T | undefined

  /**
   * Get an item from this namespace, or resolve factory and store result.
   */
  remember<T = any>(
    key: any,
    ttlOrFactory:
      | number
      | string
      | LRUCache.SetOptions<string, any, unknown>
      | (() => T | Promise<T>),
    factoryFn?: () => T | Promise<T>,
  ): Promise<T>

  /**
   * Alias for remember().
   */
  getOrSet<T = any>(
    key: any,
    ttlOrFactory:
      | number
      | string
      | LRUCache.SetOptions<string, any, unknown>
      | (() => T | Promise<T>),
    factoryFn?: () => T | Promise<T>,
  ): Promise<T>

  /**
   * Get an item, or store factory result permanently (ttl: 0) in this namespace.
   */
  rememberForever<T = any>(
    key: any,
    factoryFn: () => T | Promise<T>,
  ): Promise<T>

  /**
   * Clear all items within this namespace.
   */
  clear(): number

  /**
   * Alias for clear().
   */
  flush(): number

  /**
   * Create a sub-namespace.
   */
  namespace(subPrefix: string): CacheNamespace

  /**
   * Hash any input deterministically.
   */
  hash(input: any): string
}

/**
 * Standard Unified Cache Driver Service built on top of lru-cache.
 */
export class CacheService {
  constructor(options?: Partial<LRUCache.Options<string, any, unknown>>)

  /**
   * Raw underlying LRUCache instance.
   */
  get raw(): LRUCache<string, any, unknown>

  /**
   * Total number of cached entries.
   */
  get size(): number

  /**
   * Default configured TTL in milliseconds.
   */
  get defaultTtl(): number | undefined

  /**
   * Normalize input into a string cache key.
   */
  normalizeKey(key: any): string

  /**
   * Hash any input deterministically into a SHA-256 hexadecimal string.
   */
  hash(input: any): string

  /**
   * Get an item from the cache.
   */
  get<T = any>(key: any, defaultValue?: T | (() => T)): T | undefined

  /**
   * Set an item in the cache with optional TTL.
   */
  set(
    key: any,
    value: any,
    ttlOrOptions?: number | string | LRUCache.SetOptions<string, any, unknown>,
  ): this

  /**
   * Determine if an item exists in the cache and is not expired.
   */
  has(key: any): boolean

  /**
   * Delete an item from the cache.
   */
  delete(key: any): boolean

  /**
   * Alias for delete().
   */
  del(key: any): boolean

  /**
   * Retrieve an item and delete it from cache.
   */
  pull<T = any>(key: any, defaultValue?: T | (() => T)): T | undefined

  /**
   * Get an item from cache, or resolve factory function and store the result.
   * Supports dogpile / thundering-herd prevention via in-flight promise deduplication.
   */
  remember<T = any>(
    key: any,
    ttlOrFactory:
      | number
      | string
      | LRUCache.SetOptions<string, any, unknown>
      | (() => T | Promise<T>),
    factoryFn?: () => T | Promise<T>,
  ): Promise<T>

  /**
   * Alias for remember().
   */
  getOrSet<T = any>(
    key: any,
    ttlOrFactory:
      | number
      | string
      | LRUCache.SetOptions<string, any, unknown>
      | (() => T | Promise<T>),
    factoryFn?: () => T | Promise<T>,
  ): Promise<T>

  /**
   * Get an item from cache, or store factory result permanently (ttl: 0).
   */
  rememberForever<T = any>(
    key: any,
    factoryFn: () => T | Promise<T>,
  ): Promise<T>

  /**
   * Delete all keys that start with the given prefix.
   */
  deletePrefix(prefix: string): number

  /**
   * Delete all keys matching a regular expression.
   */
  deletePattern(pattern: RegExp): number

  /**
   * Clear the entire cache.
   */
  clear(): void

  /**
   * Alias for clear().
   */
  flush(): void

  /**
   * Create a namespaced cache wrapper.
   */
  namespace(prefix: string): CacheNamespace

  /**
   * Return an iterator of keys.
   */
  keys(): Generator<string, void, unknown>

  /**
   * Return an iterator of values.
   */
  values(): Generator<any, void, unknown>

  /**
   * Return an iterator of [key, value] entries.
   */
  entries(): Generator<[string, any], void, unknown>

  /**
   * Create a new isolated CacheService instance.
   */
  createInstance(
    options?: Partial<LRUCache.Options<string, any, unknown>>,
  ): CacheService
}

/**
 * Global Default Cache Service instance.
 */
export const cache: CacheService

export default cache
