import { DateTime, Duration, Interval } from 'luxon';

/**
 * Standard SQL Datetime format in UTC: 'YYYY-MM-DD HH:mm:ss'
 * Consistent with SQLite CURRENT_TIMESTAMP and standard SQL DATETIME columns.
 */
export const SQL_DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

/**
 * Returns current time as a standard SQL UTC string.
 * Example: '2026-10-22 12:45:00'
 *
 * @returns {string}
 */
export function nowUtc() {
  return DateTime.utc().toFormat(SQL_DATETIME_FORMAT);
}

/**
 * Returns current DateTime instance in UTC.
 *
 * @returns {DateTime}
 */
export function nowUtcDateTime() {
  return DateTime.utc();
}

/**
 * Safely parse any date value (SQL string, ISO string, timestamp number, JS Date, or Luxon DateTime)
 * into a Luxon DateTime instance in the UTC zone.
 *
 * @param {string | number | Date | DateTime | null | undefined} val
 * @returns {DateTime | null}
 */
export function parseUtc(val) {
  if (val === null || val === undefined || val === '') return null;

  if (DateTime.isDateTime(val)) {
    return val.setZone('utc');
  }

  if (val instanceof Date) {
    return DateTime.fromJSDate(val, { zone: 'utc' });
  }

  if (typeof val === 'number') {
    return DateTime.fromMillis(val, { zone: 'utc' });
  }

  if (typeof val === 'string') {
    const trimmed = val.trim();
    // 1. Try SQL format ('YYYY-MM-DD HH:mm:ss' / with ms)
    let dt = DateTime.fromSQL(trimmed, { zone: 'utc' });
    if (dt.isValid) return dt;

    // 2. Try ISO format ('2026-10-22T12:45:00.000Z')
    dt = DateTime.fromISO(trimmed, { zone: 'utc' });
    if (dt.isValid) return dt;

    // 3. Try RFC2822
    dt = DateTime.fromRFC2822(trimmed, { zone: 'utc' });
    if (dt.isValid) return dt;

    // 4. Try parsing numeric string
    const num = Number(trimmed);
    if (!isNaN(num) && isFinite(num)) {
      return DateTime.fromMillis(num, { zone: 'utc' });
    }
  }

  return null;
}

/**
 * Converts any date representation to a standard SQL UTC string ('YYYY-MM-DD HH:mm:ss').
 * If no argument or null is passed, returns current UTC time string.
 *
 * @param {string | number | Date | DateTime | null | undefined} [val]
 * @returns {string}
 */
export function toSqlUtc(val) {
  if (val === null || val === undefined || val === '') {
    return nowUtc();
  }

  const parsed = parseUtc(val);
  return parsed && parsed.isValid
    ? parsed.toFormat(SQL_DATETIME_FORMAT)
    : nowUtc();
}

export { DateTime, Duration, Interval };

export default {
  SQL_DATETIME_FORMAT,
  nowUtc,
  nowUtcDateTime,
  parseUtc,
  toSqlUtc,
  DateTime,
  Duration,
  Interval,
};
