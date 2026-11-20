import cache from '@nakiri/core/services/cache';
import { RateLimiter } from '@nakiri/core/utils/rate-limiter';
import logger from '@nakiri/core/utils/logger';
import { delay } from '@nakiri/core/utils/common';
import { createChatCompletion } from '#app/services/ai/client.js';
import {
  AI_CONFIG,
  buildChatPayload,
  appendChatHistory,
  sanitizeAiResponse,
} from '#app/services/ai/chat.js';
import { getSkillDefinitions, executeSkill } from '#app/skills/index.js';
import { extractMentionsFromText } from '#app/services/bot/index.js';
import { resolvePersonaModesWithClient } from '#app/services/ai/persona-mode.js';

/**
 * Generate a random integer between min and max inclusive
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const randomDelay = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Check whether the AI explicitly decided not to reply.
 *
 * @param {string} text
 * @returns {boolean}
 */
const isNoReply = (text) =>
  String(text || '')
    .trim()
    .toUpperCase() === AI_CONFIG.NO_REPLY_TOKEN;

const aiRateLimiter = new RateLimiter(cache);
const activeAiRequests = new Set();

/**
 * Natural Nakiri AI chat middleware.
 * Triggers only when:
 * 1. Bot is explicitly mentioned (@Nakiri)
 * 2. Message quotes / replies to a message sent by the bot
 * 3. Private chat and the message is not a command
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
  const mentionedJids =
    Array.isArray(msg.body?.mentionedJid) && msg.body.mentionedJid.length > 0
      ? msg.body.mentionedJid
      : extractMentionsFromText(msg.body?.rawText || '');
  const isBotMentioned = mentionedJids.some((jid) => botIdentifiers.has(jid));
  const isReplyToBot = Boolean(msg.quoted?.flags?.fromMe);
  const rawText = (msg.body?.rawText || '').trim();

  // Private chats reply automatically to any non-command message.
  // Group chats require an explicit mention or a reply to the bot.
  if (isGroup && !isBotMentioned && !isReplyToBot) {
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

  if (cleanedText.length > AI_CONFIG.MAX_USER_CHARS) {
    await msg.reply('pesannya kepanjangan, ringkas aja');
    return;
  }

  const senderName =
    ctx.tableGroupMember?.pushname ||
    msg.sender?.name ||
    msg.sender?.pn ||
    msg.sender?.id ||
    'Member';

  const rateIdentity =
    msg.sender?.id || msg.sender?.pn || msg.sender?.lid || msg.chat;
  const lockKey = `user:${rateIdentity}`;
  if (activeAiRequests.has(lockKey)) return;

  activeAiRequests.add(lockKey);

  try {
    const userHits = await aiRateLimiter.hit(
      `user:${rateIdentity}`,
      AI_CONFIG.RATE_LIMIT_WINDOW_SECONDS
    );
    const chatHits = await aiRateLimiter.hit(
      `chat:${msg.chat}`,
      AI_CONFIG.RATE_LIMIT_WINDOW_SECONDS
    );

    if (
      userHits > AI_CONFIG.RATE_LIMIT_MAX_REQUESTS ||
      chatHits > AI_CONFIG.CHAT_RATE_LIMIT_MAX_REQUESTS
    ) {
      logger.debug(
        '[AI_CHAT]',
        `Rate limit reached for ${rateIdentity} in ${msg.chat}`
      );
      return;
    }

    // Mark the message as read before the AI request. The read receipt is the
    // visible acknowledgment while waiting; typing only starts when a reply
    // is actually ready to send.
    try {
      if (payload?.key?.id) {
        await client.message.sendReceipt(payload);
      }
    } catch {}

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

    const groupRole = isGroup
      ? msg.permissions?.bot?.admin || msg.permissions?.bot?.superAdmin
        ? 'admin'
        : 'member'
      : '';

    const personaModes = await resolvePersonaModesWithClient({
      sender: msg.sender,
      tableBot: ctx.tableBot,
      client,
    });

    if (personaModes.length > 0) {
      logger.debug(
        '[AI_CHAT]',
        `Persona mode active: ${personaModes.join('+')} in ${msg.chat}`
      );
    }

    const messagesPayload = await buildChatPayload({
      chatId: msg.chat,
      senderName,
      userText: cleanedText,
      isGroup,
      prefixes: ctx.tableBot?.prefixes,
      mediaContext: mediaHints.join(' '),
      groupRole,
      directAddress: isGroup,
      personaModes,
    });

    const skillContext = { client, msg, payload, ctx };
    const completionOptions = {
      temperature: AI_CONFIG.TEMPERATURE,
      maxTokens: AI_CONFIG.MAX_TOKENS,
      maxToolRounds: AI_CONFIG.MAX_TOOL_ROUNDS,
      maxToolCalls: AI_CONFIG.MAX_TOOL_CALLS,
      maxToolResultChars: AI_CONFIG.MAX_TOOL_RESULT_CHARS,
      emptyAsNoReply: true,
      tools: getSkillDefinitions(),
      executeTool: (name, rawArgs) => executeSkill(name, rawArgs, skillContext),
    };

    // Group chat only reaches this point through a direct mention or reply.
    // Retry once when the provider returns an empty response. An explicit
    // [NO_REPLY] is respected so closing messages stay silent without typing.
    let replyContent = await createChatCompletion(
      messagesPayload,
      completionOptions
    );

    if (isGroup && !replyContent) {
      logger.debug(
        '[AI_CHAT]',
        `Empty response for direct group message in ${msg.chat}; retrying once`
      );

      replyContent = await createChatCompletion(
        [
          ...messagesPayload,
          {
            role: 'system',
            content:
              '[PESAN LANGSUNG]\nUser menyapa atau membalas kamu langsung di grup ini. Balas pesan terakhir dengan singkat. Jangan keluarkan [NO_REPLY] kecuali pesannya cuma penutup.',
          },
        ],
        completionOptions
      );
    }

    if (!replyContent) {
      logger.warn('[AI_CHAT]', `Empty AI response in ${msg.chat}`);
    } else if (isNoReply(replyContent)) {
      logger.debug('[AI_CHAT]', `AI chose no reply in ${msg.chat}`);
    }

    if (replyContent) {
      const finalReply = sanitizeAiResponse(replyContent);

      if (isNoReply(finalReply)) {
        logger.debug(
          '[AI_CHAT]',
          `AI chose no reply after sanitize in ${msg.chat}`
        );
        if (typeof ctx.stop === 'function') {
          ctx.stop();
        }
        return;
      }

      // Show typing only after a reply exists, then send it.
      const typingWait = randomDelay(
        AI_CONFIG.TYPING_DELAY_MIN_MS,
        AI_CONFIG.TYPING_DELAY_MAX_MS
      );
      try {
        await client.presence.sendChatstate(msg.chat, { state: 'composing' });
        await delay(typingWait);
      } catch {}
      try {
        await client.presence.sendChatstate(msg.chat, { state: 'paused' });
      } catch {}

      // Save interaction to memory
      const userEntry = isGroup
        ? `[${senderName}]: ${cleanedText}`
        : cleanedText;

      await appendChatHistory(msg.chat, 'user', userEntry);
      await appendChatHistory(msg.chat, 'assistant', finalReply);

      // Reply back to WhatsApp. Fall back to a plain send when quoting the
      // group message fails, so a direct mention never ends silently.
      try {
        await msg.reply(finalReply);
      } catch (sendErr) {
        logger.warn(
          '[AI_CHAT]',
          `Quoted reply failed in ${msg.chat}; sending without quote: ${sendErr.message}`
        );
        await msg.send(finalReply);
      }

      // Stop event propagation so commands/further handlers do not trigger
      if (typeof ctx.stop === 'function') {
        ctx.stop();
      }
    }
  } catch (err) {
    try {
      await client.presence.sendChatstate(msg.chat, { state: 'paused' });
    } catch {}

    logger.error('[AI_CHAT]', `Nakiri AI chat error: ${err.message}`);
  } finally {
    activeAiRequests.delete(lockKey);
  }
}
