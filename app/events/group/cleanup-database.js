import { defineModule } from '@nakiri/core/services/modules';
import db from '@nakiri/core/services/database';
import cache from '@nakiri/core/services/cache';
import logger from '@nakiri/core/utils/logger';
import { clearGroupMetadataCache } from '#app/services/bot/index.js';
import { deleteGroupNotes } from '#app/services/note.js';

/**
 * Extract clean user digits (without :device suffix or @domain)
 * @param {string | null | undefined} jidOrString
 * @returns {string | null}
 */
function extractUserDigits(jidOrString) {
  if (!jidOrString || typeof jidOrString !== 'string') return null;
  const userPart = jidOrString.split('@')[0].split(':')[0];
  const digits = userPart.replace(/[^0-9]/g, '');
  return digits || null;
}

/**
 * Extract all matching identifiers (JID, PN, LID, digits) for the bot client
 * @param {any} client
 * @returns {Set<string>}
 */
function getBotIdentifiers(client) {
  const ids = new Set();

  function addJid(raw) {
    if (!raw || typeof raw !== 'string') return;
    ids.add(raw);
    const domain = raw.includes('@') ? `@${raw.split('@')[1]}` : '';
    const userWithoutDevice = raw.split('@')[0].split(':')[0];
    if (userWithoutDevice) {
      ids.add(`${userWithoutDevice}${domain}`);
    }
    const digits = extractUserDigits(raw);
    if (digits) ids.add(digits);
  }

  try {
    const creds =
      typeof client?.getCredentials === 'function'
        ? client.getCredentials()
        : null;

    if (creds) {
      addJid(creds.meJid);
      addJid(creds.meLid);
    }
  } catch {}

  if (client?.user) {
    addJid(client.user.jid);
    addJid(client.user.lid);
    addJid(client.user.id);
  }

  return ids;
}

/**
 * Check if a participant object represents the bot
 * @param {any} p
 * @param {Set<string>} botIds
 * @returns {boolean}
 */
function isBotParticipant(p, botIds) {
  if (!p || botIds.size === 0) return false;

  const candidates = [
    p.jid,
    p.phoneJid,
    p.lidJid,
    extractUserDigits(p.jid),
    extractUserDigits(p.phoneJid),
    extractUserDigits(p.lidJid),
  ].filter(Boolean);

  return candidates.some((cand) => botIds.has(cand));
}

export default defineModule({
  name: 'group-cleanup',
  event: 'group',
  level: 1,
  category: 'group',
  description:
    'Clean up group and group member database records when bot exits or member is removed',

  async execute(payload, ctx) {
    const groupJid = payload?.groupJid || payload?.chatJid;
    if (!groupJid || typeof groupJid !== 'string') return;
    if (!groupJid.endsWith('@g.us')) return;

    const action = payload?.action;
    const client = ctx?.client;
    const botIds = getBotIdentifiers(client);

    // 1. Check if the group was deleted or suspended
    const isGroupClosed = action === 'delete' || action === 'suspend';

    // 2. Check if the bot itself was removed or left the group
    const isBotRemoved =
      action === 'remove' &&
      Array.isArray(payload?.participants) &&
      payload.participants.some((p) => isBotParticipant(p, botIds));

    // Case A: Bot exited / kicked or group was deleted -> purge all group records
    if (isGroupClosed || isBotRemoved) {
      const deletedMembers = await db('group_members')
        .where({ group_id: groupJid })
        .del();

      const deletedGroup = await db('groups').where({ id: groupJid }).del();

      const deletedNotes = await deleteGroupNotes({
        sessionId: ctx?.sessionId,
        groupJid,
      });

      // Invalidate memory cache
      clearGroupMetadataCache(groupJid);
      cache.delete(`table_group:${groupJid}`);

      const reason =
        action === 'delete'
          ? 'deleted/disbanded'
          : action === 'suspend'
            ? 'suspended'
            : 'bot exited/removed/kicked';

      logger.info(
        '[GROUP]',
        `Bot left or was removed from group ${groupJid} (${reason}). Purged ${deletedGroup} group record(s), ${deletedMembers} member(s), and ${deletedNotes} note(s).`
      );

      // Halt downstream group handlers so sync won't query a group the bot left
      return ctx.stop();
    }

    // Case B: Regular member departed / was removed -> clean individual member record
    if (
      action === 'remove' &&
      Array.isArray(payload?.participants) &&
      payload.participants.length > 0
    ) {
      let removedCount = 0;

      for (const p of payload.participants) {
        const targets = [
          p.jid,
          p.phoneJid,
          p.lidJid,
          p.jid ? p.jid.replace(/[^0-9]/g, '') : null,
          p.phoneJid ? p.phoneJid.replace(/[^0-9]/g, '') : null,
          p.lidJid ? p.lidJid.replace(/[^0-9]/g, '') : null,
        ].filter(Boolean);

        if (targets.length === 0) continue;

        const count = await db('group_members')
          .where('group_id', groupJid)
          .where((qb) => {
            for (const t of targets) {
              qb.orWhere('user_pn', t)
                .orWhere('user_lid', t)
                .orWhere('user_pn', 'like', `%${t}%`)
                .orWhere('user_lid', 'like', `%${t}%`);
            }
          })
          .del();

        removedCount += count;
      }

      if (removedCount > 0) {
        logger.debug(
          '[GROUP]',
          `Removed ${removedCount} departed participant(s) from group ${groupJid} members table.`
        );
      }
    }
  },
});
