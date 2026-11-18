import cache from '@nakiri/core/services/cache';
import chatBuffer from '#app/services/chat-buffer.js';
import { getMenuByLabel } from '#app/services/bot/index.js';
import { DateTime } from 'luxon';
import {
  NAKIRI,
  NAKIRI_LEAK_SIGNATURES,
  buildChatSystemPrompt,
} from './persona.js';

// ============================================================
// NAKIRI AI CHAT - RUNTIME CONFIGURATION
// ============================================================
export const AI_CONFIG = {
  // Maximum dialog turns remembered in one chat session
  MAX_MEMORY_TURNS: 8,

  // Conversation memory TTL when there is no new interaction (20 minutes)
  MEMORY_TTL: '20m',

  // Number of recent group messages peeked on the first call
  AMBIENT_PEEK_LIMIT: 5,

  // Response creativity (0.0 = rigid/factual, 0.7 = relaxed/expressive)
  TEMPERATURE: 0.7,

  // Maximum response tokens so chats stay short on WhatsApp
  MAX_TOKENS: 450,

  // Random delay before read receipt (ms)
  READ_DELAY_MIN_MS: 400,
  READ_DELAY_MAX_MS: 1600,

  // Random delay before typing indicator (ms)
  TYPING_DELAY_MIN_MS: 300,
  TYPING_DELAY_MAX_MS: 1200,

  // Local timezone for real-time time awareness
  TIMEZONE: 'Asia/Jakarta',

  // Internal token when the AI decides not to reply
  NO_REPLY_TOKEN: '[NO_REPLY]',
};

/**
 * Generate the chat system prompt with real-time temporal context.
 *
 * @returns {string}
 */
export function getSystemPrompt() {
  const now = DateTime.now().setZone(AI_CONFIG.TIMEZONE);
  const fullDate = now.setLocale('id').toFormat('cccc, dd MMMM yyyy');
  const fullTime = now.toFormat('HH:mm');
  const timeContext =
    now.hour < 5
      ? 'dini hari (waktu kalong/insomnia)'
      : now.hour < 11
        ? 'pagi hari'
        : now.hour < 15
          ? 'siang hari'
          : now.hour < 18
            ? 'sore hari'
            : 'malam hari';

  return buildChatSystemPrompt({ fullDate, fullTime, timeContext });
}

/**
 * Filter output response to prevent accidental system prompt leak.
 *
 * @param {string} text
 * @returns {string}
 */
export function sanitizeAiResponse(text) {
  if (!text) return '';

  const lower = text.toLowerCase();
  const hasLeak = NAKIRI_LEAK_SIGNATURES.some((signature) =>
    lower.includes(signature)
  );

  if (hasLeak) {
    const fallbacks = [
      'apaan dah gajelas lu',
      'kepo amat lu nanya gituan',
      'males ah, apaan sih',
      'ogah jawab wkwk',
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  return text;
}

const dialogCache = cache.namespace('nakiri_ai_dialog');
const commandCatalogCache = cache.namespace('ai_command_catalog');

/**
 * Get stored conversation history for a chat
 * @param {string} chatId
 * @returns {Promise<Array<{ role: 'system' | 'user' | 'assistant', content: string }>>}
 */
export async function getChatHistory(chatId) {
  if (!chatId) return [];
  const history = await dialogCache.get(chatId);
  return Array.isArray(history) ? history : [];
}

/**
 * Append a turn to chat history
 * @param {string} chatId
 * @param {'user' | 'assistant'} role
 * @param {string} content
 */
export async function appendChatHistory(chatId, role, content) {
  if (!chatId || !content) return;

  const history = await getChatHistory(chatId);
  history.push({ role, content });

  // Keep within MAX_MEMORY_TURNS
  const trimmed = history.slice(-AI_CONFIG.MAX_MEMORY_TURNS);

  dialogCache.set(chatId, trimmed, AI_CONFIG.MEMORY_TTL);
}

/**
 * Clear chat history for a chat
 * @param {string} chatId
 */
export async function clearChatHistory(chatId) {
  if (!chatId) return;
  dialogCache.delete(chatId);
}

/**
 * Get ambient recent group messages from chatBuffer if available
 * @param {string} groupId
 * @param {number} [limit]
 * @returns {string}
 */
export function getAmbientGroupContext(
  groupId,
  limit = AI_CONFIG.AMBIENT_PEEK_LIMIT
) {
  if (!groupId) return '';

  const queue = chatBuffer.buffers.get(groupId);
  if (!queue || queue.length === 0) return '';

  const recent = queue.slice(-limit).map((item) => item.text);
  if (recent.length === 0) return '';

  return recent.join('\n');
}

/**
 * Build a compact command catalog from the bot menu registry.
 * Cached per prefix set to avoid rebuilding on every AI request.
 *
 * @param {string[]} [prefixes]
 * @returns {Promise<string>}
 */
export async function buildCommandCatalog(prefixes = []) {
  const cleanPrefixes = (Array.isArray(prefixes) ? prefixes : [])
    .filter((prefix) => typeof prefix === 'string' && prefix.trim())
    .map((prefix) => prefix.trim());
  const displayPrefixes = cleanPrefixes.length > 0 ? cleanPrefixes : ['.'];
  const primaryPrefix = displayPrefixes[0];

  return commandCatalogCache.remember(
    displayPrefixes.join('|'),
    '10m',
    async () => {
      const groups = await getMenuByLabel();
      if (groups.size === 0) return '';

      const lines = [
        `[DAFTAR FITUR BOT ${NAKIRI.name.toUpperCase()}]`,
        `Prefix aktif: ${displayPrefixes.map((prefix) => `\`${prefix}\``).join(', ')}`,
        'Kalau ditanya menu atau kemampuan bot, sebutkan fitur yang relevan dari daftar ini dengan gaya santai.',
      ];

      for (const groupName of [...groups.keys()].sort()) {
        const items = groups.get(groupName) || [];
        if (items.length === 0) continue;

        const commands = items.map((item) => {
          const cmd = item.commands[0];
          const command = item.withoutPrefix ? cmd : `${primaryPrefix}${cmd}`;
          const description = (item.description || '')
            .replace(/\s+/g, ' ')
            .trim();
          return description
            ? `\`${command}\` (${description})`
            : `\`${command}\``;
        });

        lines.push(`- ${groupName}: ${commands.join(', ')}`);
      }

      return lines.join('\n');
    }
  );
}

/**
 * Build messages payload ready for OpenAI completion
 * @param {object} param0
 * @param {string} param0.chatId
 * @param {string} param0.senderName
 * @param {string} param0.userText
 * @param {boolean} [param0.isGroup]
 * @param {string[]} [param0.prefixes] - Configured bot prefixes for menu context
 * @param {string} [param0.mediaContext] - Media hints for skills that need attachments
 * @param {'admin' | 'member' | ''} [param0.groupRole] - The bot's real role in the group
 * @returns {Promise<Array<{ role: 'system' | 'user' | 'assistant', content: string }>>}
 */
export async function buildChatPayload({
  chatId,
  senderName,
  userText,
  isGroup = false,
  prefixes = [],
  mediaContext = '',
  groupRole = '',
}) {
  const history = await getChatHistory(chatId);

  /** @type {Array<{ role: 'system' | 'user' | 'assistant', content: string }>} */
  const messages = [{ role: 'system', content: getSystemPrompt() }];

  const commandCatalog = await buildCommandCatalog(prefixes);
  if (commandCatalog) {
    messages.push({ role: 'system', content: commandCatalog });
  }

  if (groupRole) {
    messages.push({
      role: 'system',
      content:
        groupRole === 'admin'
          ? '[PERAN GRUP]\nKamu admin di grup ini.'
          : '[PERAN GRUP]\nKamu bukan admin di grup ini.',
    });
  }

  if (mediaContext) {
    messages.push({
      role: 'system',
      content: `[KONTEKS MEDIA]\n${mediaContext}\nGunakan konteks ini kalau user meminta skill yang membutuhkan media.`,
    });
  }

  // If this is a group and history is empty, peek recent ambient chats
  if (isGroup && history.length === 0) {
    const ambientChats = getAmbientGroupContext(chatId);
    if (ambientChats) {
      messages.push({
        role: 'system',
        content: `[Konteks Situasi Obrolan Grup Saat Ini]:\n${ambientChats}\n(Gunakan konteks di atas hanya sebagai latar belakang apa yang baru saja dibahas di grup).`,
      });
    }
  }

  // Append prior conversation turns
  for (const turn of history) {
    messages.push(turn);
  }

  // Format current user message with speaker tag in groups
  const formattedUserMessage = isGroup
    ? `[${senderName || 'Member'}]: ${userText}`
    : userText;

  messages.push({
    role: 'user',
    content: formattedUserMessage,
  });

  return messages;
}
