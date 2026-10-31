import { DateTime, Duration, Interval } from 'luxon'

export const SQL_DATETIME_FORMAT: string

/**
 * Returns current time as a standard SQL UTC string ('YYYY-MM-DD HH:mm:ss').
 */
export function nowUtc(): string

/**
 * Returns current DateTime instance in UTC.
 */
export function nowUtcDateTime(): DateTime

/**
 * Safely parse any date value into a Luxon DateTime instance in the UTC zone.
 */
export function parseUtc(
  val: string | number | Date | DateTime | null | undefined,
): DateTime | null

/**
 * Converts any date representation to a standard SQL UTC string ('YYYY-MM-DD HH:mm:ss').
 */
export function toSqlUtc(
  val?: string | number | Date | DateTime | null | undefined,
): string

export { DateTime, Duration, Interval }

declare const _default: {
  SQL_DATETIME_FORMAT: string
  nowUtc: typeof nowUtc
  nowUtcDateTime: typeof nowUtcDateTime
  parseUtc: typeof parseUtc
  toSqlUtc: typeof toSqlUtc
  DateTime: typeof DateTime
  Duration: typeof Duration
  Interval: typeof Interval
}

export default _default
