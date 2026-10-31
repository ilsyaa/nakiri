import { defineModule } from '@nakiri/core/services/modules';
import {
  clearGroupMetadataCache,
  getGroupMetadata,
} from '#app/services/bot/index.js';

export default defineModule({
  name: 'group-sync',
  event: 'group',
  level: 2,
  category: 'group',
  description:
    'Invalidate and refresh cached group metadata on group notification events',

  async execute(payload, ctx) {
    const groupJid = payload?.groupJid || payload?.chatJid;
    if (!groupJid) return;

    // Invalidate stale cache
    clearGroupMetadataCache(groupJid);

    // Eagerly pre-warm cache with latest metadata from WhatsApp server
    if (ctx?.client?.group?.queryGroupMetadata) {
      try {
        await getGroupMetadata(ctx.client, groupJid, true);
      } catch {}
    }
  },
});
