import { defineModule } from '@nakiri/core/services/modules';
import {
  clearGroupMetadataCache,
  getGroupMetadata,
} from '#app/services/bot/index.js';
import cache from '@nakiri/core/services/cache/index';
import logger from '@nakiri/core/utils/logger';

const REFRESH_DELAY_MS = 1000;

/** @type {Map<string, NodeJS.Timeout>} */
const pendingRefreshes = new Map();

/**
 * Schedule a debounced forced metadata refresh for a group.
 *
 * @param {any} client
 * @param {string} groupJid
 */
function scheduleMetadataRefresh(client, groupJid) {
  if (!client?.group?.queryGroupMetadata) return;

  const existing = pendingRefreshes.get(groupJid);
  if (existing) {
    clearTimeout(existing);
  }

  const timer = setTimeout(async () => {
    pendingRefreshes.delete(groupJid);
    try {
      await getGroupMetadata(client, groupJid, true);
    } catch (err) {
      logger.warn(
        '[GROUP_SYNC]',
        `Failed to refresh metadata for ${groupJid}: ${err.message}`
      );
    }
  }, REFRESH_DELAY_MS);

  timer.unref?.();
  pendingRefreshes.set(groupJid, timer);
}

export default defineModule({
  name: 'group-sync',
  event: 'group',
  level: 2,
  category: 'group',
  description:
    'Invalidate and refresh cached group metadata on group notification events',

  async execute(payload, ctx) {
    const groupJids = Array.from(
      new Set(
        [payload?.groupJid, payload?.chatJid, payload?.contextGroupJid].filter(
          (jid) => typeof jid === 'string' && jid.endsWith('@g.us')
        )
      )
    );
    if (groupJids.length === 0) return;

    for (const groupJid of groupJids) {
      // Immediately invalidate stale cache
      clearGroupMetadataCache(groupJid);
      cache.delete(`table_group:${groupJid}`);

      // Debounce forced refresh so burst events coalesce and server state settles
      scheduleMetadataRefresh(ctx?.client, groupJid);
    }
  },
});
