import { unwrapMessage, getContextInfo } from 'zapo-js';

/**
 * Extract plain text from Zapo message payload or Proto.IMessage object
 * @param {any} messagePayload - Message event payload or Proto.IMessage object
 * @returns {string}
 */
export function extractText(messagePayload) {
  if (!messagePayload) return '';

  let rawMessage = messagePayload?.message || messagePayload;
  if (!rawMessage) return '';

  // Unwrap ephemeral / viewOnce wrappers if present
  try {
    rawMessage = unwrapMessage(rawMessage) || rawMessage;
  } catch {
    // Fallback if unwrap fails
  }

  const text =
    rawMessage.conversation ||
    rawMessage.extendedTextMessage?.text ||
    rawMessage.imageMessage?.caption ||
    rawMessage.videoMessage?.caption ||
    rawMessage.documentMessage?.caption ||
    rawMessage.documentWithCaptionMessage?.message?.documentMessage?.caption ||
    rawMessage.buttonsResponseMessage?.selectedDisplayText ||
    rawMessage.buttonsResponseMessage?.selectedButtonId ||
    rawMessage.templateButtonReplyMessage?.selectedDisplayText ||
    rawMessage.templateButtonReplyMessage?.selectedId ||
    rawMessage.listResponseMessage?.singleSelectReply?.selectedRowId ||
    rawMessage.pollCreationMessage?.name ||
    rawMessage.reactionMessage?.text ||
    '';

  return String(text).trim();
}

/**
 * Extract quoted message details from payload contextInfo
 * @param {any} messagePayload
 * @returns {{ stanzaId: string, participant: string, quotedMessage: any, text: string } | null}
 */
export function getQuoted(messagePayload) {
  if (!messagePayload) return null;
  const rawMessage = messagePayload?.message || messagePayload;
  const ctx = getContextInfo(rawMessage);
  if (!ctx || !ctx.quotedMessage) return null;

  return {
    stanzaId: ctx.stanzaId || '',
    participant: ctx.participant || '',
    quotedMessage: ctx.quotedMessage,
    text: extractText(ctx.quotedMessage),
  };
}

/**
 * Extract mentioned JIDs from message payload
 * @param {any} messagePayload
 * @returns {string[]}
 */
export function extractMentions(messagePayload) {
  if (!messagePayload) return [];
  const rawMessage = messagePayload?.message || messagePayload;
  const ctx = getContextInfo(rawMessage);
  return Array.isArray(ctx?.mentionedJid) ? [...ctx.mentionedJid] : [];
}

/**
 * Extract media content descriptor from message payload if present
 * @param {any} messagePayload
 * @returns {{ type: 'image' | 'video' | 'audio' | 'sticker' | 'document', media: any, ptt?: boolean } | null}
 */
export function extractMedia(messagePayload) {
  if (!messagePayload) return null;
  let raw = messagePayload?.message || messagePayload;
  try {
    raw = unwrapMessage(raw) || raw;
  } catch {}

  if (raw.imageMessage) return { type: 'image', media: raw.imageMessage };
  if (raw.videoMessage) return { type: 'video', media: raw.videoMessage };
  if (raw.audioMessage)
    return {
      type: 'audio',
      media: raw.audioMessage,
      ptt: Boolean(raw.audioMessage.ptt),
    };
  if (raw.stickerMessage) return { type: 'sticker', media: raw.stickerMessage };
  if (raw.documentMessage)
    return { type: 'document', media: raw.documentMessage };
  if (raw.documentWithCaptionMessage?.message?.documentMessage) {
    return {
      type: 'document',
      media: raw.documentWithCaptionMessage.message.documentMessage,
    };
  }

  return null;
}

export default {
  extractText,
  getQuoted,
  extractMentions,
  extractMedia,
};
