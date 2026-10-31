import cache from '@nakiri/core/services/cache';
import db from '@nakiri/core/services/database';

const botCache = cache.namespace('bot:settings');

/**
 * Clear the in-memory bot table cache to force a fresh database read.
 */
export function clearTableBotCache() {
  botCache.clear();
}

/**
 * Fetch bot configuration from the database with standardized caching.
 * Dynamically passes through all columns from the 'bots' table without hardcoded schemas.
 *
 * @returns {Promise<Record<string, any>>}
 */
export async function getTableBot() {
  return botCache.remember('current', 30_000, async () => {
    try {
      const row = await db('bots').first();

      if (!row) {
        return {};
      }

      // Dynamically preserve all table columns
      const record = { ...row };

      // Automatically parse any stringified JSON columns
      for (const [key, value] of Object.entries(record)) {
        if (
          typeof value === 'string' &&
          (value.startsWith('[') || value.startsWith('{'))
        ) {
          try {
            record[key] = JSON.parse(value);
          } catch {}
        }
      }

      // Pre-compute normalized owner set if owners field exists
      if (Array.isArray(record.owners)) {
        const ownerSet = new Set();
        for (const o of record.owners) {
          if (!o) continue;
          const s = String(o).trim();
          ownerSet.add(s);
          const digits = s.replace(/[^0-9]/g, '');
          if (digits.length >= 7) {
            ownerSet.add(digits);
          }
        }
        record._ownerSet = ownerSet;
      }

      return record;
    } catch {
      return {};
    }
  });
}

/**
 * Bot database table loader middleware.
 * Attaches the bot record (tableBot) to ctx.
 *
 * @type {import('@nakiri/core/services/modules').EventMiddleware<'message'>}
 */
export default async function botTableMiddleware(payload, ctx) {
  const tableBot = await getTableBot();
  ctx.tableBot = tableBot;
}
