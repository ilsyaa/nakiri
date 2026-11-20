import cache from '@nakiri/core/services/cache';
import chatBuffer from '#app/services/chat-buffer.js';
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

  // Hard cap for a single stored turn and the whole chat memory
  MAX_MEMORY_MESSAGE_CHARS: 1600,
  MAX_MEMORY_CHARS: 6000,

  // Conversation memory TTL when there is no new interaction (20 minutes)
  MEMORY_TTL: '20m',

  // Number of recent group messages peeked on the first call
  AMBIENT_PEEK_LIMIT: 5,

  // Keep ambient group context small so it cannot inflate the prompt
  MAX_AMBIENT_MESSAGE_CHARS: 200,
  MAX_AMBIENT_CONTEXT_CHARS: 800,

  // Reject oversized user messages before they reach the model
  MAX_USER_CHARS: 1500,

  // Tool calling budget per AI request
  MAX_TOOL_ROUNDS: 3,
  MAX_TOOL_CALLS: 4,
  MAX_TOOL_RESULT_CHARS: 2000,

  // Per-user and per-chat AI request rate limits
  RATE_LIMIT_WINDOW_SECONDS: 60,
  RATE_LIMIT_MAX_REQUESTS: 5,
  CHAT_RATE_LIMIT_MAX_REQUESTS: 15,

  // Response creativity (0.0 = rigid/factual, 0.7 = relaxed/expressive)
  TEMPERATURE: 0.7,

  // Maximum response tokens so chats stay short on WhatsApp
  MAX_TOKENS: 300,

  // Random typing duration before sending a ready reply (ms)
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
 * @param {string[]} [personaModes]
 * @returns {string}
 */
export function getSystemPrompt(personaModes = []) {
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

  return buildChatSystemPrompt({
    fullDate,
    fullTime,
    timeContext,
    personaModes,
  });
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

/**
 * Truncate text to a hard character limit.
 *
 * @param {string} value
 * @param {number} maxChars
 * @returns {string}
 */
function truncateText(value, maxChars) {
  const text = String(value || '');
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 3)).trimEnd()}...`;
}

/**
 * Keep only the newest turns that fit the turn and character budgets.
 *
 * @param {Array<{ role: 'system' | 'user' | 'assistant', content: string }>} history
 * @returns {Array<{ role: 'system' | 'user' | 'assistant', content: string }>}
 */
function trimHistory(history) {
  /** @type {Array<{ role: 'system' | 'user' | 'assistant', content: string }>} */
  const trimmed = [];
  let totalChars = 0;

  for (let index = history.length - 1; index >= 0; index--) {
    const turn = history[index];
    if (!turn || typeof turn.content !== 'string') continue;

    const content = truncateText(
      turn.content,
      AI_CONFIG.MAX_MEMORY_MESSAGE_CHARS
    );
    const nextTotal = totalChars + content.length;
    const isFull =
      trimmed.length >= AI_CONFIG.MAX_MEMORY_TURNS ||
      (trimmed.length > 0 && nextTotal > AI_CONFIG.MAX_MEMORY_CHARS);

    if (isFull) break;

    trimmed.unshift({ role: turn.role, content });
    totalChars = nextTotal;
  }

  while (trimmed.length > 0 && trimmed[0].role === 'assistant') {
    trimmed.shift();
  }

  return trimmed;
}

/**
 * Get stored conversation history for a chat
 * @param {string} chatId
 * @returns {Promise<Array<{ role: 'system' | 'user' | 'assistant', content: string }>>}
 */
export async function getChatHistory(chatId) {
  if (!chatId) return [];
  const history = await dialogCache.get(chatId);
  return Array.isArray(history) ? trimHistory(history) : [];
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
  history.push({
    role,
    content: truncateText(content, AI_CONFIG.MAX_MEMORY_MESSAGE_CHARS),
  });

  dialogCache.set(chatId, trimHistory(history), AI_CONFIG.MEMORY_TTL);
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

  const recent = queue
    .slice(-limit)
    .map((item) => truncateText(item.text, AI_CONFIG.MAX_AMBIENT_MESSAGE_CHARS))
    .filter(Boolean);
  if (recent.length === 0) return '';

  return truncateText(recent.join('\n'), AI_CONFIG.MAX_AMBIENT_CONTEXT_CHARS);
}

/**
 * Build a short command reference without dumping the whole menu.
 * Command questions point to the menu; skill questions are answered by the model.
 *
 * @param {string[]} [prefixes]
 * @returns {Promise<string>}
 */
export async function buildCommandCatalog(prefixes = []) {
  const cleanPrefixes = (Array.isArray(prefixes) ? prefixes : [])
    .filter((prefix) => typeof prefix === 'string' && prefix.trim())
    .map((prefix) => prefix.trim());
  const displayPrefixes = cleanPrefixes.length > 0 ? cleanPrefixes : ['.'];
  const menuCommand = `${displayPrefixes[0]}menu`;

  return [
    `[REFERENSI COMMAND ${NAKIRI.name.toUpperCase()}]`,
    `Prefix aktif: ${displayPrefixes.map((prefix) => `\`${prefix}\``).join(', ')}`,
    `Kalau user tanya command, menu, atau cara pakai fitur bot, arahkan ke \`${menuCommand}\`. Jangan menyebut command satu per satu.`,
    'Kalau user tanya kemampuan, jawab dari skill dengan bahasa sendiri secara singkat.',
  ].join('\n');
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
 * @param {boolean} [param0.directAddress] - The message mentioned or replied to the bot
 * @param {string[]} [param0.personaModes] - Active persona modes for this sender
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
  directAddress = false,
  personaModes = [],
}) {
  const history = await getChatHistory(chatId);

  /** @type {Array<{ role: 'system' | 'user' | 'assistant', content: string }>} */
  const messages = [
    { role: 'system', content: getSystemPrompt(personaModes) },
  ];

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

  if (directAddress) {
    messages.push({
      role: 'system',
      content:
        '[PESAN LANGSUNG]\nPesan terakhir di-mention atau di-reply langsung ke kamu. Anggap user sedang bicara ke kamu, lalu balas pesan itu. Jangan keluarkan [NO_REPLY] kecuali isinya cuma penutup atau acknowledgment.',
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
  const safeUserText = truncateText(userText, AI_CONFIG.MAX_USER_CHARS);
  const formattedUserMessage = isGroup
    ? `[${senderName || 'Member'}]: ${safeUserText}`
    : safeUserText;

  messages.push({
    role: 'user',
    content: formattedUserMessage,
  });

  return messages;
}
