import { unwrapMessage, isLidJid, toUserJid } from 'zapo-js';

const toHex = (buf) => {
  if (!buf) return '';
  if (typeof buf === 'string') return buf;
  if (Buffer.isBuffer(buf)) return buf.toString('hex');
  if (buf instanceof Uint8Array) return Buffer.from(buf).toString('hex');
  return '';
};

/**
 * Dynamic shortcuts middleware (Sticker and Reaction/Emoji triggers).
 * Rewrites ctx.msg.body when a matching sticker hash or emoji trigger is detected.
 *
 * @type {import('@nakiri/core/services/modules').EventMiddleware<'message'>}
 */
export default async function botShortcutMiddleware(payload, ctx) {
  const msg = ctx.msg;
  const shortcuts = ctx.tableBot?.shortcuts;

  if (!msg || !shortcuts || typeof shortcuts !== 'object') {
    return;
  }

  const stickers = shortcuts.stickers || {};
  const emojis = shortcuts.emojis || {};

  /** @type {any} */
  let raw = payload?.message || payload;
  try {
    raw = unwrapMessage(raw) || raw;
  } catch {}

  // 1. Sticker Shortcut
  if (msg.flags?.isSticker && raw?.stickerMessage?.fileSha256) {
    const hash = toHex(raw.stickerMessage.fileSha256);
    const targetCmd = stickers[hash];

    if (targetCmd && typeof targetCmd === 'string') {
      const parts = targetCmd.trim().split(/\s+/);
      const command = parts[0];
      const extraArgs = parts.slice(1);

      msg.body.command = command;
      msg.body.commandWithoutPrefix = command;
      msg.body.prefix = '.';
      msg.body.args = extraArgs;
      msg.body.argsText = extraArgs.join(' ');
      return;
    }
  }

  // 2. Reaction Message Shortcut
  const reaction = raw?.reactionMessage;
  if (reaction?.text) {
    const emojiText = reaction.text.trim();
    const targetCmd = emojis[emojiText];

    if (targetCmd && typeof targetCmd === 'string') {
      const parts = targetCmd.trim().split(/\s+/);
      const command = parts[0];
      const extraArgs = parts.slice(1);

      // Inject reaction target as quoted message if target key is available
      const targetKey = reaction.key;
      if (targetKey && targetKey.id) {
        const participant =
          targetKey.participant || targetKey.remoteJid || null;
        let lid = null;
        let pn = null;

        if (participant) {
          if (isLidJid(participant)) {
            lid = participant;
          } else {
            pn = toUserJid(participant);
          }
        }

        msg.quoted = /** @type {any} */ ({
          stanzaId: targetKey.id,
          chat: targetKey.remoteJid,
          sender: {
            id: pn || lid || participant,
            lid,
            pn,
          },
          flags: {
            fromMe: Boolean(targetKey.fromMe),
          },
          body: {
            rawText: '',
          },
        });
      }

      msg.body.command = command;
      msg.body.commandWithoutPrefix = command;
      msg.body.prefix = '.';
      msg.body.args = extraArgs;
      msg.body.argsText = extraArgs.join(' ');
      return;
    }
  }

  // 3. Single Emoji/Text Shortcut
  const rawText = (msg.body?.rawText || '').trim();
  if (rawText && emojis[rawText] && typeof emojis[rawText] === 'string') {
    const targetCmd = emojis[rawText];
    const parts = targetCmd.trim().split(/\s+/);
    const command = parts[0];
    const extraArgs = parts.slice(1);

    msg.body.command = command;
    msg.body.commandWithoutPrefix = command;
    msg.body.prefix = '.';
    msg.body.args = extraArgs;
    msg.body.argsText = extraArgs.join(' ');
  }
}
