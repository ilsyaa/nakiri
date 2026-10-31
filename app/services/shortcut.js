import db from '@nakiri/core/services/database';
import cache from '@nakiri/core/services/cache';
import logger from '@nakiri/core/utils/logger';
import { defaultGroupSettings } from '#app/middlewares/group.js';

export const DEFAULT_SHORTCUTS = {
  '❌': 'kick',
  '⚠️': 'warn',
};

/**
 * Validate whether a string is a valid emoji character.
 * Supports pictographs, emoji components (skin tones), variation selectors, and ZWJ sequences.
 *
 * @param {string | null | undefined} str
 * @returns {boolean}
 */
export function isEmoji(str) {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  if (!trimmed) return false;
  return /^[\p{Extended_Pictographic}\p{Emoji_Component}\uFE0F\u200D]+$/u.test(
    trimmed
  );
}

/**
 * Fetch group settings from database or cache.
 *
 * @param {string} chatJid
 * @returns {Promise<Record<string, any>>}
 */
export async function getGroupSettings(chatJid) {
  if (!chatJid) return { ...defaultGroupSettings };

  return await cache.remember(`table_group:${chatJid}`, '15m', async () => {
    let group = await db('groups').where({ id: chatJid }).first();

    if (!group) {
      await db('groups')
        .insert({
          id: chatJid,
          settings: JSON.stringify(defaultGroupSettings),
        })
        .onConflict('id')
        .ignore();

      group = await db('groups').where({ id: chatJid }).first();
    }

    let parsedSettings = {};
    if (group?.settings) {
      try {
        parsedSettings =
          typeof group.settings === 'string'
            ? JSON.parse(group.settings)
            : group.settings;
      } catch {}
    }

    if (group) {
      group.settings = {
        ...defaultGroupSettings,
        ...parsedSettings,
      };
    }

    return group || null;
  }).then((res) => res?.settings || { ...defaultGroupSettings });
}

/**
 * Save updated group settings to database and invalidate caches.
 *
 * @param {string} chatJid
 * @param {Record<string, any>} newSettings
 * @returns {Promise<void>}
 */
export async function saveGroupSettings(chatJid, newSettings) {
  if (!chatJid) return;

  const existing = await db('groups').where({ id: chatJid }).first();
  if (existing) {
    await db('groups')
      .where({ id: chatJid })
      .update({
        settings: JSON.stringify(newSettings),
      });
  } else {
    await db('groups')
      .insert({
        id: chatJid,
        settings: JSON.stringify(newSettings),
      })
      .onConflict('id')
      .ignore();
  }

  cache.delete(`table_group:${chatJid}`);
  cache.delete(`shortcuts:${chatJid}`);
}

/**
 * Get all active emoji reaction shortcuts for a group.
 *
 * @param {string} chatJid
 * @returns {Promise<Record<string, string>>} Map of emoji -> commandName
 */
export async function getShortcuts(chatJid) {
  if (!chatJid) return { ...DEFAULT_SHORTCUTS };

  return await cache.remember(`shortcuts:${chatJid}`, '15m', async () => {
    const settings = await getGroupSettings(chatJid);
    if (
      settings &&
      typeof settings.emojiShortcuts === 'object' &&
      settings.emojiShortcuts !== null
    ) {
      return { ...settings.emojiShortcuts };
    }
    return { ...DEFAULT_SHORTCUTS };
  });
}

/**
 * Get the command mapped to a specific emoji reaction in a group.
 *
 * @param {string} chatJid
 * @param {string} emoji
 * @returns {Promise<string | null>}
 */
export async function getShortcutCommand(chatJid, emoji) {
  if (!chatJid || !emoji) return null;
  const shortcuts = await getShortcuts(chatJid);
  const normalizedEmoji = emoji.trim();
  return shortcuts[normalizedEmoji] || null;
}

/**
 * Associate an emoji reaction with a bot command for a group.
 *
 * @param {string} chatJid
 * @param {string} emoji
 * @param {string} commandName
 * @returns {Promise<Record<string, string>>}
 */
export async function setShortcut(chatJid, emoji, commandName) {
  if (!chatJid) throw new Error('Chat JID is required');
  if (!isEmoji(emoji)) throw new Error('Invalid emoji format');

  const cleanCmd = commandName.replace(/^[./!#$]/, '').trim().toLowerCase();
  if (!cleanCmd) throw new Error('Command name cannot be empty');

  const settings = await getGroupSettings(chatJid);
  const currentShortcuts =
    settings && typeof settings.emojiShortcuts === 'object' && settings.emojiShortcuts !== null
      ? { ...settings.emojiShortcuts }
      : { ...DEFAULT_SHORTCUTS };

  currentShortcuts[emoji.trim()] = cleanCmd;

  settings.emojiShortcuts = currentShortcuts;
  await saveGroupSettings(chatJid, settings);

  logger.info(
    '[SHORTCUT]',
    `Set shortcut in group ${chatJid}: ${emoji} -> ${cleanCmd}`
  );

  return currentShortcuts;
}

/**
 * Delete an emoji shortcut binding in a group.
 *
 * @param {string} chatJid
 * @param {string} emoji
 * @returns {Promise<Record<string, string>>}
 */
export async function deleteShortcut(chatJid, emoji) {
  if (!chatJid) throw new Error('Chat JID is required');

  const settings = await getGroupSettings(chatJid);
  const currentShortcuts =
    settings && typeof settings.emojiShortcuts === 'object' && settings.emojiShortcuts !== null
      ? { ...settings.emojiShortcuts }
      : { ...DEFAULT_SHORTCUTS };

  const targetEmoji = emoji.trim();
  delete currentShortcuts[targetEmoji];

  settings.emojiShortcuts = currentShortcuts;
  await saveGroupSettings(chatJid, settings);

  logger.info(
    '[SHORTCUT]',
    `Deleted shortcut in group ${chatJid}: ${targetEmoji}`
  );

  return currentShortcuts;
}

/**
 * Reset emoji shortcuts in a group back to defaults.
 *
 * @param {string} chatJid
 * @returns {Promise<Record<string, string>>}
 */
export async function resetShortcuts(chatJid) {
  if (!chatJid) throw new Error('Chat JID is required');

  const settings = await getGroupSettings(chatJid);
  settings.emojiShortcuts = { ...DEFAULT_SHORTCUTS };
  await saveGroupSettings(chatJid, settings);

  logger.info(
    '[SHORTCUT]',
    `Reset shortcuts to defaults in group ${chatJid}`
  );

  return { ...DEFAULT_SHORTCUTS };
}

/**
 * Find a participant inside group roster by JID, LID, or phone number.
 *
 * @param {any[]} participants
 * @param {string | null | undefined} target
 * @returns {any | null}
 */
export function findParticipant(participants, target) {
  if (!Array.isArray(participants) || !target) return null;
  const targetStr = String(target).trim();
  const digits = targetStr.replace(/[^0-9]/g, '');

  for (const p of participants) {
    if (!p) continue;
    if (p.jid === targetStr || p.lid === targetStr) return p;

    const pPhoneDigits = p.phoneNumber
      ? p.phoneNumber.replace(/[^0-9]/g, '')
      : '';
    const pJidDigits = p.jid ? p.jid.replace(/[^0-9]/g, '') : '';
    const pLidDigits = p.lid ? p.lid.replace(/[^0-9]/g, '') : '';

    if (digits) {
      if (pPhoneDigits && pPhoneDigits === digits) return p;
      if (pJidDigits && pJidDigits === digits) return p;
      if (pLidDigits && pLidDigits === digits) return p;
    }
  }

  return null;
}

export default {
  DEFAULT_SHORTCUTS,
  isEmoji,
  getGroupSettings,
  saveGroupSettings,
  getShortcuts,
  getShortcutCommand,
  setShortcut,
  deleteShortcut,
  resetShortcuts,
  findParticipant,
};
