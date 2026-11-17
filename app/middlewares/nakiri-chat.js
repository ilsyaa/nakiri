import logger from '@nakiri/core/utils/logger';
import { delay } from '@nakiri/core/utils/common';
import { createChatCompletion } from '#app/services/ai/client.js';
import {
  AI_CONFIG,
  buildChatPayload,
  appendChatHistory,
  sanitizeAiResponse,
} from '#app/services/ai/persona.js';
import { getSkillDefinitions, executeSkill } from '#app/skills/index.js';

/**
 * Generate a random integer between min and max inclusive
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const randomDelay = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Natural Nakiri AI chat middleware.
 * Triggers only when:
 * 1. Bot is explicitly mentioned (@Nakiri)
 * 2. Message quotes / replies to a message sent by the bot
 * 3. Text mentions the name "nakiri"
 * 4. Private chat and the message is not a command
 *
 * @type {import('@nakiri/core/services/modules').EventMiddleware<'message'>}
 */
export default async function botAiChatMiddleware(payload, ctx) {
  const { client, msg } = ctx;
  if (!msg || msg.flags?.fromMe || msg.flags?.isBroadcast) return;

  // Ignore if an active command is triggered (with or without prefix)
  if (ctx.command) return;

  // Ignore commands with prefix so we don't interfere with standard bot commands
  if (msg.body?.prefix) return;

  // 1. Silent ignore for stickers (do not respond even if replying to bot)
  if (msg.flags?.isSticker || msg.flags?.isStickerAnimated) return;

  const isGroup = Boolean(msg.flags?.isGroup);

  // Check trigger condition
  const botIdentifiers = new Set(
    [msg.bot?.id, msg.bot?.pn, msg.bot?.lid].filter(Boolean)
  );
  const mentionedJids = msg.body?.mentionedJid || [];
  const isBotMentioned = mentionedJids.some((jid) => botIdentifiers.has(jid));
  const isReplyToBot = Boolean(msg.quoted?.flags?.fromMe);
  const rawText = (msg.body?.rawText || '').trim();
  const isNameCalled = rawText
    ? AI_CONFIG.NAME_TRIGGER_REGEX.test(rawText)
    : false;

  // Private chats reply automatically to any non-command message.
  // Group chats still require an explicit mention, reply, or name call.
  if (isGroup && !isBotMentioned && !isReplyToBot && !isNameCalled) {
    return;
  }

  // 2. Reject media/files: describe media type and let AI generate natural excuse
  const isMediaMsg = Boolean(
    msg.flags?.isMedia ||
    msg.flags?.isImage ||
    msg.flags?.isVideo ||
    msg.flags?.isAudio ||
    msg.flags?.isDocument
  );

  let cleanedText = rawText;
  for (const botJid of botIdentifiers) {
    const num = botJid.split('@')[0];
    cleanedText = cleanedText.replace(new RegExp(`@${num}`, 'gi'), '').trim();
  }

  // If user sent a media file without text or with caption
  if (isMediaMsg) {
    const mediaType = msg.flags?.isImage
      ? 'foto/gambar'
      : msg.flags?.isVideo
        ? 'video'
        : msg.flags?.isAudio
          ? 'voice note/audio'
          : msg.flags?.isDocument
            ? 'dokumen/file'
            : 'media/file';

    const captionContext = cleanedText
      ? ` dengan caption "${cleanedText}"`
      : '';
    cleanedText = `[mengirim ${mediaType}${captionContext}]`;
  }

  if (!cleanedText) return;

  const senderName =
    ctx.tableGroupMember?.pushname ||
    msg.sender?.name ||
    msg.sender?.pn ||
    msg.sender?.id ||
    'Member';

  // Variable to track typing interval so we can clear it once AI response is ready
  let typingInterval = null;

  try {
    // -------------------------------------------------------------
    // Natural Human Simulation: Random Read Receipt (Centang Biru)
    // -------------------------------------------------------------
    const readWait = randomDelay(
      AI_CONFIG.READ_DELAY_MIN_MS,
      AI_CONFIG.READ_DELAY_MAX_MS
    );

    (async () => {
      try {
        await delay(readWait);
        if (payload?.key?.id) {
          await client.message.sendReceipt(payload);
        }
      } catch {}
    })();

    // -------------------------------------------------------------
    // Natural Human Simulation: Random Typing (Chatstate Composing)
    // -------------------------------------------------------------
    const typingWait = randomDelay(
      AI_CONFIG.TYPING_DELAY_MIN_MS,
      AI_CONFIG.TYPING_DELAY_MAX_MS
    );

    const startTypingPromise = (async () => {
      try {
        await delay(typingWait);
        await client.presence.sendChatstate(msg.chat, { state: 'composing' });

        // Keep sending composing every 4.5 seconds if AI takes longer
        typingInterval = setInterval(() => {
          client.presence
            .sendChatstate(msg.chat, { state: 'composing' })
            .catch(() => {});
        }, 4500);
      } catch {}
    })();

    const mediaHints = [];
    if (msg.quoted?.flags?.isImage) {
      mediaHints.push('Pesan yang dibalas berisi gambar.');
    }
    if (msg.quoted?.flags?.isVideo) {
      mediaHints.push('Pesan yang dibalas berisi video.');
    }
    if (msg.flags?.isImage) {
      mediaHints.push('Pesan ini berisi gambar.');
    }
    if (msg.flags?.isVideo) {
      mediaHints.push('Pesan ini berisi video.');
    }

    const messagesPayload = await buildChatPayload({
      chatId: msg.chat,
      senderName,
      userText: cleanedText,
      isGroup,
      prefixes: ctx.tableBot?.prefixes,
      mediaContext: mediaHints.join(' '),
    });

    const skillContext = { client, msg, payload, ctx };

    // Request AI completion
    const replyContent = await createChatCompletion(messagesPayload, {
      temperature: AI_CONFIG.TEMPERATURE,
      maxTokens: AI_CONFIG.MAX_TOKENS,
      tools: getSkillDefinitions(),
      executeTool: (name, rawArgs) => executeSkill(name, rawArgs, skillContext),
    });

    // Wait until initial typing starts before clearing
    await startTypingPromise;

    // -------------------------------------------------------------
    // Turn off typing indicator once AI responds
    // -------------------------------------------------------------
    if (typingInterval) {
      clearInterval(typingInterval);
      typingInterval = null;
    }
    try {
      await client.presence.sendChatstate(msg.chat, { state: 'paused' });
    } catch {}

    if (replyContent) {
      const finalReply = sanitizeAiResponse(replyContent);

      // Save interaction to memory
      const userEntry = isGroup
        ? `[${senderName}]: ${cleanedText}`
        : cleanedText;

      await appendChatHistory(msg.chat, 'user', userEntry);
      await appendChatHistory(msg.chat, 'assistant', finalReply);

      // Reply back to WhatsApp
      await msg.reply(finalReply);

      // Stop event propagation so commands/further handlers do not trigger
      if (typeof ctx.stop === 'function') {
        ctx.stop();
      }
    }
  } catch (err) {
    // Clean up typing on error
    if (typingInterval) {
      clearInterval(typingInterval);
      typingInterval = null;
    }
    try {
      await client.presence.sendChatstate(msg.chat, { state: 'paused' });
    } catch {}

    logger.error('[AI_CHAT]', `Nakiri AI chat error: ${err.message}`);
  }
}
