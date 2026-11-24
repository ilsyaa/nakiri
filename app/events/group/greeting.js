import { defineModule } from '@nakiri/core/services/modules';
import db from '@nakiri/core/services/database';
import cache from '@nakiri/core/services/cache';
import logger from '@nakiri/core/utils/logger';
import { send, getGroupMetadata } from '#app/services/bot/index.js';
import { composeGreetingMessage } from '#app/services/ai/group.js';

const DEBOUNCE_DELAY_MS = 3500;
const MAX_WAIT_MS = 10000;

/**
 * @type {Map<string, {
 *   joins: Map<string, string>,
 *   leaves: Map<string, string>,
 *   timer: NodeJS.Timeout | null,
 *   firstSeen: number,
 *   client: any
 * }>}
 */
const greetingBuffers = new Map();

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
 * Extract all matching identifiers for the bot client
 * @param {any} client
 * @returns {Set<string>}
 */
function getBotIdentifiers(client) {
  const ids = new Set();

  function addJid(raw) {
    if (!raw || typeof raw !== 'string') return;
    ids.add(raw);
    const digits = extractUserDigits(raw);
    if (digits) {
      ids.add(digits);
      ids.add(`${digits}@s.whatsapp.net`);
      ids.add(`${digits}@lid`);
    }
  }

  try {
    const creds = client?.getCredentials?.();
    if (creds) {
      addJid(creds.meJid);
      addJid(creds.meLid);
    }
  } catch {}

  if (client?.user) {
    addJid(client.user.id);
    addJid(client.user.lid);
    addJid(client.user.jid);
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

/**
 * Retrieve group settings from cache or database
 * @param {string} groupId
 * @returns {Promise<Record<string, any> | null>}
 */
async function getGroupSettings(groupId) {
  const cachedGroup = cache.get(`table_group:${groupId}`);
  if (cachedGroup?.settings) {
    return cachedGroup.settings;
  }

  const group = await db('groups').where({ id: groupId }).first();
  if (!group) return null;

  let settings = {};
  if (group.settings) {
    try {
      settings =
        typeof group.settings === 'string'
          ? JSON.parse(group.settings)
          : group.settings;
    } catch {}
  }
  return settings;
}

/**
 * Flush debounced greetings for a specific group
 * @param {string} groupJid
 */
async function flushBuffer(groupJid) {
  const buffer = greetingBuffers.get(groupJid);
  if (!buffer) return;
  greetingBuffers.delete(groupJid);

  const client = buffer.client;
  if (!client) return;

  try {
    const [metadata, settings] = await Promise.all([
      getGroupMetadata(client, groupJid).catch(() => null),
      getGroupSettings(groupJid).catch(() => null),
    ]);
    const groupSubject = metadata?.subject || 'grup';

    // 1. Process Welcomes
    if (buffer.joins.size > 0) {
      const mentions = Array.from(buffer.joins.keys());
      const tags = Array.from(buffer.joins.values());
      let fallbackText = '';

      if (buffer.joins.size === 1) {
        fallbackText = [
          '｢ *WELCOME* ｣',
          `Selamat datang ${tags[0]} di *${groupSubject}*!`,
        ].join('\n');
      } else {
        const lines = tags.map((tag) => `• ${tag}`).join('\n');
        fallbackText = [
          '｢ *WELCOME* ｣',
          `Selamat datang kepada ${buffer.joins.size} anggota baru di *${groupSubject}*:`,
          lines,
        ].join('\n');
      }

      const text = settings?.welcomeAi
        ? await composeGreetingMessage({
            kind: 'welcome',
            groupSubject,
            tags,
            fallbackText,
          })
        : fallbackText;

      await send(client, groupJid, text, { mentions, autoMention: false });
      logger.info(
        '[GREETING]',
        `Sent welcome greeting for ${mentions.length} new member(s) in group ${groupJid}`
      );
    }

    // 2. Process Goodbyes
    if (buffer.leaves.size > 0) {
      const mentions = Array.from(buffer.leaves.keys());
      const tags = Array.from(buffer.leaves.values());
      let fallbackText = '';

      if (buffer.leaves.size === 1) {
        fallbackText = [
          '｢ *GOODBYE* ｣',
          `Selamat tinggal ${tags[0]} dari *${groupSubject}*.`,
        ].join('\n');
      } else {
        const lines = tags.map((tag) => `• ${tag}`).join('\n');
        fallbackText = [
          '｢ *GOODBYE* ｣',
          `Selamat tinggal kepada ${buffer.leaves.size} anggota yang telah keluar dari *${groupSubject}*:`,
          lines,
        ].join('\n');
      }

      const text = settings?.goodbyeAi
        ? await composeGreetingMessage({
            kind: 'goodbye',
            groupSubject,
            tags,
            fallbackText,
          })
        : fallbackText;

      await send(client, groupJid, text, { mentions, autoMention: false });
      logger.info(
        '[GREETING]',
        `Sent goodbye greeting for ${mentions.length} departed member(s) in group ${groupJid}`
      );
    }
  } catch (err) {
    logger.error(
      '[GREETING]',
      `Failed to flush greeting messages for group ${groupJid}: ${err.message}`
    );
  }
}

export default defineModule({
  name: 'group-greeting',
  event: 'group',
  level: 3,
  category: 'group',
  description:
    'Debounced welcome and goodbye messages for group members with anti-spam batching',

  async execute(payload, ctx) {
    const groupJid = payload?.groupJid || payload?.chatJid;
    if (
      !groupJid ||
      typeof groupJid !== 'string' ||
      !groupJid.endsWith('@g.us')
    ) {
      return;
    }

    const action = payload?.action;
    if (action !== 'add' && action !== 'remove') {
      return;
    }

    const participants = payload?.participants;
    if (!Array.isArray(participants) || participants.length === 0) {
      return;
    }

    const client = ctx?.client;
    if (!client) return;

    // Filter out bot itself
    const botIds = getBotIdentifiers(client);
    const validParticipants = participants.filter(
      (p) => !isBotParticipant(p, botIds)
    );
    if (validParticipants.length === 0) {
      return;
    }

    // Check if group has the specific greeting enabled (welcome for 'add', goodbye for 'remove')
    const settings = await getGroupSettings(groupJid);
    const isWelcomeEnabled = Boolean(settings?.welcome);
    const isGoodbyeEnabled = Boolean(settings?.goodbye);

    if (action === 'add' && !isWelcomeEnabled) {
      return;
    }
    if (action === 'remove' && !isGoodbyeEnabled) {
      return;
    }

    let buffer = greetingBuffers.get(groupJid);
    if (!buffer) {
      buffer = {
        joins: new Map(),
        leaves: new Map(),
        timer: null,
        firstSeen: Date.now(),
        client,
      };
      greetingBuffers.set(groupJid, buffer);
    } else {
      buffer.client = client;
    }

    const targetMap = action === 'add' ? buffer.joins : buffer.leaves;

    for (const p of validParticipants) {
      const mentionJid =
        p.phoneJid || (p.jid?.endsWith('@s.whatsapp.net') ? p.jid : null) || p.jid;
      if (!mentionJid) continue;

      const userDigits = extractUserDigits(mentionJid);
      const tag = userDigits ? `@${userDigits}` : `@${mentionJid}`;

      targetMap.set(mentionJid, tag);
    }

    if (targetMap.size === 0) return;

    // Reset debounce timer
    clearTimeout(buffer.timer);

    const elapsed = Date.now() - buffer.firstSeen;
    if (elapsed >= MAX_WAIT_MS) {
      await flushBuffer(groupJid);
    } else {
      const remainingWait = Math.min(DEBOUNCE_DELAY_MS, MAX_WAIT_MS - elapsed);
      buffer.timer = setTimeout(() => {
        flushBuffer(groupJid);
      }, remainingWait);
    }
  },
});
