export declare function delay(ms: number): Promise<void>
export declare function isUrl(text: string): boolean
export declare function retry<T>(
  fn: () => Promise<T>,
  retries?: number,
  delayMs?: number,
): Promise<T>
export declare function getRandomItem<T>(arr: T[]): T | undefined
export declare function shuffleArray<T>(arr: T[]): T[]
export declare function toArray<T>(value: T | T[]): T[]
export declare function pluckProperty(
  arr: Record<string, any>[],
  key: string,
): any[]
export declare function chunkArray<T>(arr: T[], size: number): T[][]
export declare function interpolateString(
  str: string,
  params?: Record<string, any>,
): string
export declare function getRandomString(length?: number): string
export declare function toSlug(text: string): string
export declare function toCamelCase(text: string): string
export declare function toKebabCase(text: string): string
export declare function truncateText(
  text: string,
  length?: number,
  end?: string,
): string
export declare function toTitleCase(text: string): string
export declare function ucfirst(text: string): string
export declare function escapeRegExp(text: string): string
export declare function maskPhoneNumber(phone: string): string
export declare function formatNumber(value: number, locale?: string): string
export declare function formatCurrency(
  value: number,
  curr?: string,
  locale?: string,
): string
export declare function formatFileSize(bytes: number, decimals?: number): string
export declare function getRandomInt(min: number, max: number): number
export declare function isNumeric(value: any): boolean
export declare function setNestedValue(
  target: any,
  path: string,
  value: any,
  position?: number | null,
): void
export declare function getNestedValue(target: any, path: string): any
export declare function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K>
export declare function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K>
