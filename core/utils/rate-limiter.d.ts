export interface CacheService {
  get(key: string): Promise<any>
  set(key: string, value: any, ttl?: number): Promise<void>
  del(key: string): Promise<void>
}

export declare class RateLimiter {
  private cache
  constructor(cache: CacheService)
  tooManyAttempts(key: string, maxAttempts: number): Promise<boolean>
  hit(key: string, decaySeconds?: number): Promise<number>
  attempt<T>(
    key: string,
    maxAttempts: number,
    callback: () => Promise<T> | T,
    decaySeconds?: number,
  ): Promise<T | false>
  availableIn(key: string): Promise<number>
  remaining(key: string, maxAttempts: number): Promise<number>
  clear(key: string): Promise<void>
}
