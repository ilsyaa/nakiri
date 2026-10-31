import cache from '@nakiri/core/services/cache';
import db from '@nakiri/core/services/database';

/**
 * Clear the in-memory bot table cache.
 */
export function clearTableBotCache() {
  cache.delete('table_bot');
}

/**
 * Fetch bot configuration from the database with caching.
 *
 * @returns {Promise<Record<string, any> | null>}
 */
export async function getTableBot() {
  return cache.remember('table_bot', '15m', async () => {
    const bot = await db('bots').first();
    if (!bot) return null;

    for (const key of ['owners', 'prefixes', 'shortcuts']) {
      if (typeof bot[key] === 'string') {
        try {
          bot[key] = JSON.parse(bot[key]);
        } catch {}
      }
    }

    return bot;
  });
}

/**
 * Bot database table loader middleware.
 * Injects ctx.tableBot.
 *
 * @type {import('@nakiri/core/services/modules').EventMiddleware<'message'>}
 */
export default async function botTableMiddleware(payload, ctx) {
  const tableBot = await getTableBot();
  if (tableBot) {
    Object.defineProperty(tableBot, 'clearCache', {
      value: clearTableBotCache,
      enumerable: false,
      configurable: true,
    });
  }
  ctx.tableBot = tableBot;
}
