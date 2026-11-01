import chatBuffer from '#app/services/chat-buffer.js';

/**
 * Opt-in group message buffer middleware for AI summary.
 * Captures all text messages if the group has enabled aiSummary.
 *
 * @type {import('@nakiri/core/services/modules').EventMiddleware<'message'>}
 */
export default async function groupRecorderMiddleware(payload, ctx) {
  const { msg, tableGroup } = ctx;

  // 1. Only active in group chats
  if (!msg?.flags?.isGroup || !tableGroup) return;

  // 2. Check if aiSummary feature is enabled in group settings
  const isSummaryEnabled = Boolean(tableGroup.settings?.aiSummary);
  if (!isSummaryEnabled) return;

  // 3. Ignore messages from the bot itself or stub/broadcast
  if (msg.flags.fromMe || msg.flags.isBroadcast) return;

  // 4. Only record text messages (flags.isText or has rawText)
  if (!msg.flags?.isText) return;

  const rawText = (msg.body?.rawText || '').trim();
  if (!rawText) return;

  // 5. Push to RAM chat buffer
  const senderName =
    ctx.tableGroupMember?.pushname ||
    msg.sender?.name ||
    msg.sender?.pn ||
    msg.sender?.id ||
    'Member';

  const rawSeconds = payload.timestampSeconds;
  const timestamp = rawSeconds ? rawSeconds * 1000 : Date.now();

  chatBuffer.bufferMessage(msg.chat, {
    senderName,
    text: rawText,
    timestamp,
  });
}
