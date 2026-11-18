import db from '@nakiri/core/services/database';
import logger from '@nakiri/core/utils/logger';
import { delay } from '@nakiri/core/utils/common';
import { DateTime } from 'luxon';
import { composeReminderMessage } from '#app/services/ai/reminder.js';
import {
  getRememberedClient,
  getRememberedSessions,
} from '#app/services/client-registry.js';

export const DEFAULT_REMINDER_TIMEZONE = 'Asia/Jakarta';
export const MAX_ACTIVE_REMINDERS = 10;
export const MAX_REMINDER_MESSAGE_LENGTH = 500;
export const MAX_CALL_SECONDS = 30;

const SCHEDULER_INTERVAL_MS = 30_000;
const DUE_BATCH_SIZE = 20;

let schedulerTimer = null;
let schedulerRunning = false;

/**
 * Convert a raw phone/LID value into a full JID.
 *
 * @param {string | null | undefined} value
 * @param {string} domain
 * @returns {string | null}
 */
function toFullJid(value, domain) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  return raw.includes('@') ? raw : `${raw}@${domain}`;
}

/**
 * Resolve and normalize sender identities for ownership checks.
 *
 * @param {{ id?: string | null, pn?: string | null, lid?: string | null } | null | undefined} sender
 * @returns {{ jid: string | null, pn: string | null, lid: string | null, candidates: string[] }}
 */
function resolveSender(sender) {
  const pn =
    toFullJid(sender?.pn, 's.whatsapp.net') ||
    (sender?.id?.endsWith('@s.whatsapp.net') ? sender.id : null);
  const lid =
    toFullJid(sender?.lid, 'lid') ||
    (sender?.id?.endsWith('@lid') ? sender.id : null);
  const jid =
    pn ||
    lid ||
    (sender?.id
      ? sender.id.includes('@')
        ? sender.id
        : toFullJid(sender.id, 's.whatsapp.net')
      : null);

  return {
    jid,
    pn,
    lid,
    candidates: Array.from(new Set([jid, pn, lid].filter(Boolean))),
  };
}

/**
 * Apply an ownership filter to a reminder query.
 *
 * @param {import('knex').Knex.QueryBuilder} qb
 * @param {{ jid: string | null, pn: string | null, lid: string | null, candidates: string[] }} owner
 */
function scopeToOwner(builder, owner) {
  builder.where('sender_jid', owner.jid);
  if (owner.candidates.length > 0) {
    builder
      .orWhereIn('sender_pn', owner.candidates)
      .orWhereIn('sender_lid', owner.candidates);
  }
}

/**
 * Format a database date value into a Luxon DateTime in UTC.
 *
 * @param {string | Date} value
 * @returns {DateTime}
 */
function parseDbDate(value) {
  if (value instanceof Date) {
    return DateTime.fromJSDate(value, { zone: 'utc' });
  }
  return DateTime.fromSQL(String(value), { zone: 'utc' });
}

/**
 * Format a DateTime as a SQL UTC timestamp.
 *
 * @param {DateTime} value
 * @returns {string}
 */
function toSqlDate(value) {
  return value.toUTC().toSQL({ includeOffset: false });
}

/**
 * Compute the next daily occurrence from a local DateTime.
 *
 * @param {DateTime} fromLocal
 * @param {number} hour
 * @param {number} minute
 * @returns {DateTime}
 */
function nextDaily(fromLocal, hour, minute) {
  let next = fromLocal.set({
    hour,
    minute,
    second: 0,
    millisecond: 0,
  });
  if (next <= fromLocal) {
    next = next.plus({ days: 1 });
  }
  return next;
}

/**
 * Compute the next monthly occurrence from a local DateTime.
 *
 * @param {DateTime} fromLocal
 * @param {number} dayOfMonth
 * @param {number} hour
 * @param {number} minute
 * @returns {DateTime}
 */
function nextMonthly(fromLocal, dayOfMonth, hour, minute) {
  const build = (year, month) => {
    const first = DateTime.fromObject(
      { year, month, day: 1 },
      { zone: fromLocal.zoneName }
    );
    const day = Math.min(dayOfMonth, first.daysInMonth);
    return DateTime.fromObject(
      { year, month, day, hour, minute, second: 0, millisecond: 0 },
      { zone: fromLocal.zoneName }
    );
  };

  let next = build(fromLocal.year, fromLocal.month);
  if (next <= fromLocal) {
    const shifted = fromLocal.plus({ months: 1 });
    next = build(shifted.year, shifted.month);
  }
  return next;
}

/**
 * Compute the next recurrence of a reminder from a given local DateTime.
 *
 * @param {{ frequency: string, hour: number | null, minute: number | null, day_of_month: number | null, timezone: string }} reminder
 * @param {DateTime} fromLocal
 * @returns {DateTime | null}
 */
function computeFollowingRun(reminder, fromLocal) {
  if (reminder.frequency === 'daily') {
    return nextDaily(fromLocal, reminder.hour ?? 0, reminder.minute ?? 0);
  }
  if (reminder.frequency === 'monthly') {
    return nextMonthly(
      fromLocal,
      reminder.day_of_month ?? 1,
      reminder.hour ?? 0,
      reminder.minute ?? 0
    );
  }
  return null;
}

/**
 * Parse a reminder schedule.
 *
 * Supported formats:
 * - `10m`, `2h`, `1d` (one-time relative)
 * - `20:30` (one-time today or tomorrow)
 * - `2026-11-18 08:00` (one-time absolute)
 * - `daily 08:00`
 * - `monthly 1 09:00`
 *
 * @param {string} schedule
 * @param {{ now?: DateTime, timezone?: string }} [options]
 * @returns {{
 *   frequency: 'once' | 'daily' | 'monthly',
 *   nextRunAt: DateTime,
 *   hour: number | null,
 *   minute: number | null,
 *   dayOfMonth: number | null,
 *   timezone: string,
 *   scheduleText: string
 * } | null}
 */
export function parseReminderSchedule(schedule, options = {}) {
  const timezone = options.timezone || DEFAULT_REMINDER_TIMEZONE;
  const nowUtc = (options.now || DateTime.utc()).setZone('utc');
  const nowLocal = nowUtc.setZone(timezone);
  const text = String(schedule || '').trim();
  if (!text) return null;

  const relative = text.match(/^(\d+)\s*(s|m|h|d)$/i);
  if (relative) {
    const amount = Number(relative[1]);
    if (!Number.isFinite(amount) || amount <= 0) return null;
    const unit = {
      s: 'seconds',
      m: 'minutes',
      h: 'hours',
      d: 'days',
    }[relative[2].toLowerCase()];

    return {
      frequency: 'once',
      nextRunAt: nowLocal.plus({ [unit]: amount }).toUTC(),
      hour: null,
      minute: null,
      dayOfMonth: null,
      timezone,
      scheduleText: text,
    };
  }

  const daily = text.match(/^daily\s+(\d{1,2}):(\d{2})$/i);
  if (daily) {
    const hour = Number(daily[1]);
    const minute = Number(daily[2]);
    if (hour > 23 || minute > 59) return null;

    return {
      frequency: 'daily',
      nextRunAt: nextDaily(nowLocal, hour, minute).toUTC(),
      hour,
      minute,
      dayOfMonth: null,
      timezone,
      scheduleText: text,
    };
  }

  const monthly = text.match(/^monthly\s+(\d{1,2})\s+(\d{1,2}):(\d{2})$/i);
  if (monthly) {
    const dayOfMonth = Number(monthly[1]);
    const hour = Number(monthly[2]);
    const minute = Number(monthly[3]);
    if (dayOfMonth < 1 || dayOfMonth > 31 || hour > 23 || minute > 59) {
      return null;
    }

    return {
      frequency: 'monthly',
      nextRunAt: nextMonthly(nowLocal, dayOfMonth, hour, minute).toUTC(),
      hour,
      minute,
      dayOfMonth,
      timezone,
      scheduleText: text,
    };
  }

  const absolute = text.match(
    /^(\d{4})-(\d{2})-(\d{2})[ t](\d{1,2}):(\d{2})$/i
  );
  if (absolute) {
    const dt = DateTime.fromObject(
      {
        year: Number(absolute[1]),
        month: Number(absolute[2]),
        day: Number(absolute[3]),
        hour: Number(absolute[4]),
        minute: Number(absolute[5]),
        second: 0,
        millisecond: 0,
      },
      { zone: timezone }
    );
    if (!dt.isValid) return null;

    return {
      frequency: 'once',
      nextRunAt: dt.toUTC(),
      hour: null,
      minute: null,
      dayOfMonth: null,
      timezone,
      scheduleText: text,
    };
  }

  const timeOnly = text.match(/^(\d{1,2}):(\d{2})$/);
  if (timeOnly) {
    const hour = Number(timeOnly[1]);
    const minute = Number(timeOnly[2]);
    if (hour > 23 || minute > 59) return null;

    return {
      frequency: 'once',
      nextRunAt: nextDaily(nowLocal, hour, minute).toUTC(),
      hour: null,
      minute: null,
      dayOfMonth: null,
      timezone,
      scheduleText: text,
    };
  }

  return null;
}

/**
 * Format a reminder's next run for display.
 *
 * @param {{ next_run_at: string | Date, timezone?: string }} reminder
 * @param {string} [timezone]
 * @returns {string}
 */
export function formatReminderTime(reminder, timezone) {
  const zone = timezone || reminder.timezone || DEFAULT_REMINDER_TIMEZONE;
  const dt = parseDbDate(reminder.next_run_at).setZone(zone);
  if (!dt.isValid) return '-';
  return dt.setLocale('id').toFormat('dd LLL yyyy, HH:mm');
}

/**
 * Create a stored reminder.
 *
 * @param {object} options
 * @param {string} options.sessionId
 * @param {string} options.chatJid
 * @param {any} options.sender
 * @param {string} [options.senderName]
 * @param {string} options.message
 * @param {string} options.schedule
 * @param {boolean} [options.ai=false]
 * @param {number} [options.callSeconds=0]
 * @param {string} [options.timezone]
 * @returns {Promise<{ ok: true, reminder: Record<string, any> } | { ok: false, error: string }>}
 */
export async function createReminder({
  sessionId,
  chatJid,
  sender,
  senderName = null,
  message,
  schedule,
  ai = false,
  callSeconds = 0,
  timezone = DEFAULT_REMINDER_TIMEZONE,
}) {
  if (!sessionId || !chatJid) {
    return { ok: false, error: 'invalid_context' };
  }

  const text = String(message || '').trim();
  if (!text || text.length > MAX_REMINDER_MESSAGE_LENGTH) {
    return { ok: false, error: 'invalid_message' };
  }

  const parsed = parseReminderSchedule(schedule, { timezone });
  if (!parsed) {
    return { ok: false, error: 'invalid_schedule' };
  }

  const ringSeconds = Number(callSeconds || 0);
  if (
    !Number.isInteger(ringSeconds) ||
    ringSeconds < 0 ||
    ringSeconds > MAX_CALL_SECONDS
  ) {
    return { ok: false, error: 'invalid_call_seconds' };
  }

  const owner = resolveSender(sender);
  if (!owner.jid) {
    return { ok: false, error: 'invalid_sender' };
  }
  if (ringSeconds > 0 && !owner.pn) {
    return { ok: false, error: 'call_requires_pn' };
  }

  const countRow = await db('reminders')
    .where({ session_id: sessionId, status: 'active' })
    .where((builder) => scopeToOwner(builder, owner))
    .count({ count: '*' })
    .first();

  if (Number(countRow?.count || 0) >= MAX_ACTIVE_REMINDERS) {
    return { ok: false, error: 'limit' };
  }

  const now = DateTime.utc();
  const nowSql = toSqlDate(now);
  const [id] = await db('reminders').insert({
    session_id: sessionId,
    chat_jid: chatJid,
    sender_jid: owner.jid,
    sender_pn: owner.pn,
    sender_lid: owner.lid,
    sender_name: senderName || null,
    message: text,
    mode: ai ? 'ai' : 'static',
    frequency: parsed.frequency,
    timezone: parsed.timezone,
    hour: parsed.hour,
    minute: parsed.minute,
    day_of_month: parsed.dayOfMonth,
    schedule_text: parsed.scheduleText,
    next_run_at: toSqlDate(parsed.nextRunAt),
    call_seconds: ringSeconds,
    status: 'active',
    created_at: nowSql,
    updated_at: nowSql,
  });

  return {
    ok: true,
    reminder: {
      id,
      session_id: sessionId,
      chat_jid: chatJid,
      sender_jid: owner.jid,
      sender_pn: owner.pn,
      sender_lid: owner.lid,
      sender_name: senderName || null,
      message: text,
      mode: ai ? 'ai' : 'static',
      frequency: parsed.frequency,
      timezone: parsed.timezone,
      hour: parsed.hour,
      minute: parsed.minute,
      day_of_month: parsed.dayOfMonth,
      schedule_text: parsed.scheduleText,
      next_run_at: toSqlDate(parsed.nextRunAt),
      call_seconds: ringSeconds,
      status: 'active',
    },
  };
}

/**
 * List a user's active and paused reminders.
 *
 * @param {{ sessionId: string, sender: any }} options
 * @returns {Promise<Array<Record<string, any>>>}
 */
export async function listReminders({ sessionId, sender }) {
  const owner = resolveSender(sender);
  if (!sessionId || !owner.jid) return [];

  return db('reminders')
    .where('session_id', sessionId)
    .whereIn('status', ['active', 'paused'])
    .where((builder) => scopeToOwner(builder, owner))
    .orderBy('next_run_at', 'asc')
    .limit(50);
}

/**
 * Update a user's reminder status.
 *
 * @param {{ id: number, sessionId: string, sender: any, status: 'active' | 'paused' }} options
 * @returns {Promise<Record<string, any> | null>}
 */
export async function updateReminderStatus({ id, sessionId, sender, status }) {
  const owner = resolveSender(sender);
  if (!id || !sessionId || !owner.jid) return null;
  if (!['active', 'paused'].includes(status)) return null;

  const reminder = await db('reminders')
    .where({ id, session_id: sessionId })
    .where((builder) => scopeToOwner(builder, owner))
    .first();

  if (!reminder) return null;

  let nextRunAt = reminder.next_run_at;
  if (status === 'active' && reminder.frequency !== 'once') {
    const now = DateTime.utc();
    const scheduled = parseDbDate(reminder.next_run_at);
    if (scheduled <= now) {
      const next = computeFollowingRun(
        reminder,
        now.setZone(reminder.timezone || DEFAULT_REMINDER_TIMEZONE)
      );
      if (next) nextRunAt = toSqlDate(next);
    }
  }

  await db('reminders')
    .where({ id })
    .update({
      status,
      next_run_at: nextRunAt,
      updated_at: toSqlDate(DateTime.utc()),
    });

  return { ...reminder, status, next_run_at: nextRunAt };
}

/**
 * Delete a user's reminder.
 *
 * @param {{ id: number, sessionId: string, sender: any }} options
 * @returns {Promise<boolean>}
 */
export async function deleteReminder({ id, sessionId, sender }) {
  const owner = resolveSender(sender);
  if (!id || !sessionId || !owner.jid) return false;

  const deleted = await db('reminders')
    .where({ id, session_id: sessionId })
    .where((builder) => scopeToOwner(builder, owner))
    .delete();

  return deleted > 0;
}

/**
 * Load due active reminders.
 *
 * @param {DateTime} [now]
 * @returns {Promise<Array<Record<string, any>>>}
 */
export async function getDueReminders(now = DateTime.utc()) {
  return db('reminders')
    .where('status', 'active')
    .where('next_run_at', '<=', toSqlDate(now))
    .orderBy('next_run_at', 'asc')
    .limit(DUE_BATCH_SIZE);
}

/**
 * Claim a due reminder before sending it.
 * Advancing or completing before send makes delivery at-most-once.
 *
 * @param {Record<string, any>} reminder
 * @param {DateTime} [now]
 * @returns {Promise<boolean>}
 */
export async function claimReminder(reminder, now = DateTime.utc()) {
  const nowSql = toSqlDate(now);
  const where = {
    id: reminder.id,
    status: 'active',
    next_run_at: reminder.next_run_at,
  };

  if (reminder.frequency === 'once') {
    const updated = await db('reminders').where(where).update({
      status: 'done',
      last_run_at: nowSql,
      updated_at: nowSql,
    });
    return updated > 0;
  }

  const scheduled = parseDbDate(reminder.next_run_at);
  const timezone = reminder.timezone || DEFAULT_REMINDER_TIMEZONE;
  const baseLocal = (scheduled > now ? scheduled : now).setZone(timezone);
  const next = computeFollowingRun(reminder, baseLocal);
  if (!next) return false;

  const updated = await db('reminders')
    .where(where)
    .update({
      next_run_at: toSqlDate(next),
      last_run_at: nowSql,
      updated_at: nowSql,
    });

  return updated > 0;
}

/**
 * Deliver a reminder message, wrapping it with the AI persona when mode is `ai`.
 *
 * @param {Record<string, any>} reminder
 * @param {any} client
 * @returns {Promise<string>}
 */
export async function deliverReminder(reminder, client) {
  const ringSeconds = Number(reminder.call_seconds || 0);
  const isGroupChat = String(reminder.chat_jid).endsWith('@g.us');
  const callJid =
    reminder.sender_pn ||
    (!isGroupChat && String(reminder.chat_jid).endsWith('@s.whatsapp.net')
      ? reminder.chat_jid
      : null);

  if (
    ringSeconds > 0 &&
    callJid &&
    client.voip?.startCall &&
    client.voip?.endCall
  ) {
    try {
      const callId = await client.voip.startCall({
        peerJid: callJid,
        isVideo: false,
      });
      logger.info(
        '[REMINDER]',
        `Miscall ${callJid} for ${ringSeconds}s (reminder ${reminder.id})`
      );
      await delay(ringSeconds * 1000);
      await client.voip.endCall(callId);
    } catch (err) {
      logger.error(
        '[REMINDER]',
        `Miscall failed for reminder ${reminder.id}: ${err.message}`
      );
    }
  } else if (ringSeconds > 0) {
    logger.warn(
      '[REMINDER]',
      `Miscall skipped for reminder ${reminder.id}: call target or VoIP plugin is unavailable`
    );
  }

  const body =
    reminder.mode === 'ai'
      ? await composeReminderMessage({
          message: reminder.message,
          senderName: reminder.sender_name,
          timezone: reminder.timezone,
        })
      : reminder.message;

  // A miscall goes to one person. In a group, keep the text with the same person.
  const sendToDm = Boolean(ringSeconds > 0 && isGroupChat && callJid);
  const targetChat = sendToDm ? callJid : reminder.chat_jid;
  const mentionJid =
    isGroupChat && !sendToDm
      ? reminder.sender_pn || reminder.sender_jid || null
      : null;
  const text = mentionJid
    ? `@${String(mentionJid).split('@')[0]} ${body}`
    : body;

  await client.message.send(
    targetChat,
    text,
    mentionJid ? { mentions: [mentionJid] } : undefined
  );

  return text;
}

/**
 * Resolve the WhatsApp client for a reminder session.
 * Falls back to the only active session when the stored session id differs.
 *
 * @param {any} sessionManager
 * @param {string} sessionId
 * @returns {any | null}
 */
function resolveReminderClient(sessionManager, sessionId) {
  const direct = sessionManager?.getClient?.(sessionId);
  if (direct) return direct;

  const remembered = getRememberedClient(sessionId);
  if (remembered) return remembered;

  const active = sessionManager?.getActiveSessions?.() || [];
  if (active.length === 1) {
    return sessionManager.getClient(active[0]);
  }

  const rememberedSessions = getRememberedSessions();
  if (rememberedSessions.length === 1) {
    return getRememberedClient(rememberedSessions[0]);
  }

  return null;
}

/**
 * Process all due reminders once.
 *
 * @param {object} [options]
 * @param {any} [options.sessionManager]
 * @param {(sessionId: string) => any} [options.getClient]
 * @param {DateTime} [options.now]
 * @returns {Promise<number>} Number of due reminders inspected
 */
export async function processDueReminders({
  sessionManager = null,
  getClient = null,
  now = DateTime.utc(),
} = {}) {
  const due = await getDueReminders(now);
  if (due.length === 0) return 0;

  for (const reminder of due) {
    const client =
      typeof getClient === 'function'
        ? getClient(reminder.session_id)
        : resolveReminderClient(sessionManager, reminder.session_id);

    if (!client?.message?.send) {
      logger.debug(
        '[REMINDER]',
        `Client not ready for session ${reminder.session_id}`
      );
      continue;
    }

    const claimed = await claimReminder(reminder, now);
    if (!claimed) continue;

    try {
      await deliverReminder(reminder, client);
      logger.info(
        '[REMINDER]',
        `Delivered reminder ${reminder.id} to ${reminder.chat_jid}`
      );
    } catch (err) {
      logger.error(
        '[REMINDER]',
        `Failed to deliver reminder ${reminder.id}: ${err.message}`
      );
    }
  }

  return due.length;
}

/**
 * Start the reminder scheduler loop.
 *
 * @param {{ sessionManager: any, intervalMs?: number }} options
 * @returns {NodeJS.Timeout | null}
 */
export function startReminderScheduler({
  sessionManager,
  intervalMs = SCHEDULER_INTERVAL_MS,
} = {}) {
  if (schedulerTimer) return schedulerTimer;
  if (!sessionManager) return null;

  const run = async () => {
    if (schedulerRunning) return;
    schedulerRunning = true;
    try {
      await processDueReminders({ sessionManager });
    } catch (err) {
      logger.error('[REMINDER]', `Scheduler tick failed: ${err.message}`);
    } finally {
      schedulerRunning = false;
    }
  };

  run();
  schedulerTimer = setInterval(run, intervalMs);
  schedulerTimer.unref?.();

  logger.info('[REMINDER]', `Scheduler started (interval ${intervalMs}ms)`);

  return schedulerTimer;
}

/**
 * Stop the reminder scheduler loop.
 */
export function stopReminderScheduler() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
  schedulerRunning = false;
}
