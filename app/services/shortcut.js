import db from '@nakiri/core/services/database';
import cache from '@nakiri/core/services/cache';
import logger from '@nakiri/core/utils/logger';
import { clearBotSettingsCache } from '#app/services/bot/index.js';

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
 * Get all active global emoji reaction shortcuts.
 *
 * @returns {Promise<Record<string, string>>} Map of emoji -> commandName
 */
export async function getShortcuts() {
  return await cache.remember('global_shortcuts', '15m', async () => {
    try {
      const bot = await db('bots').first();
      let shortcuts = {};
      if (bot?.shortcuts) {
        try {
          shortcuts =
            typeof bot.shortcuts === 'string'
              ? JSON.parse(bot.shortcuts)
              : bot.shortcuts;
        } catch {}
      }

      if (
        shortcuts &&
        typeof shortcuts === 'object' &&
        Object.keys(shortcuts).length > 0
      ) {
        return { ...shortcuts };
      }
      return { ...DEFAULT_SHORTCUTS };
    } catch (err) {
      logger.error(
        '[SHORTCUT]',
        `Failed to load global shortcuts from database: ${err.message}`
      );
      return { ...DEFAULT_SHORTCUTS };
    }
  });
}

/**
 * Get the command mapped to a specific emoji reaction globally.
 *
 * @param {string} emoji
 * @returns {Promise<string | null>}
 */
export async function getShortcutCommand(emoji) {
  if (!emoji) return null;
  const shortcuts = await getShortcuts();
  const normalizedEmoji = emoji.trim();
  return shortcuts[normalizedEmoji] || null;
}

/**
 * Save global emoji shortcuts to the database and invalidate caches.
 *
 * @param {Record<string, string>} shortcuts
 * @returns {Promise<void>}
 */
export async function saveShortcuts(shortcuts) {
  const row = await db('bots').first();
  const serialized = JSON.stringify(shortcuts);

  if (row) {
    await db('bots').where({ id: row.id }).update({ shortcuts: serialized });
  } else {
    await db('bots').insert({ shortcuts: serialized });
  }

  cache.delete('global_shortcuts');
  clearBotSettingsCache();
}

/**
 * Associate an emoji reaction with a bot command globally.
 *
 * @param {string} emoji
 * @param {string} commandName
 * @returns {Promise<Record<string, string>>}
 */
export async function setShortcut(emoji, commandName) {
  if (!isEmoji(emoji)) throw new Error('Invalid emoji format');

  const cleanCmd = commandName.replace(/^[./!#$]/, '').trim().toLowerCase();
  if (!cleanCmd) throw new Error('Command name cannot be empty');

  const currentShortcuts = { ...(await getShortcuts()) };
  currentShortcuts[emoji.trim()] = cleanCmd;

  await saveShortcuts(currentShortcuts);

  logger.info('[SHORTCUT]', `Global shortcut set: ${emoji} -> ${cleanCmd}`);
  return currentShortcuts;
}

/**
 * Delete a global emoji shortcut binding.
 *
 * @param {string} emoji
 * @returns {Promise<Record<string, string>>}
 */
export async function deleteShortcut(emoji) {
  const currentShortcuts = { ...(await getShortcuts()) };
  const targetEmoji = emoji.trim();
  delete currentShortcuts[targetEmoji];

  await saveShortcuts(currentShortcuts);

  logger.info('[SHORTCUT]', `Global shortcut deleted: ${targetEmoji}`);
  return currentShortcuts;
}

/**
 * Reset global emoji shortcuts back to defaults.
 *
 * @returns {Promise<Record<string, string>>}
 */
export async function resetShortcuts() {
  await saveShortcuts({ ...DEFAULT_SHORTCUTS });

  logger.info('[SHORTCUT]', 'Global shortcuts reset to defaults');
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
  getShortcuts,
  getShortcutCommand,
  saveShortcuts,
  setShortcut,
  deleteShortcut,
  resetShortcuts,
  findParticipant,
};
