import { defineCommand } from '#app/services/bot/index.js';
import db from '@nakiri/core/services/database';
import { unwrapMessage, getContextInfo } from 'zapo-js';

const toHex = (buf) => {
  if (!buf) return '';
  if (typeof buf === 'string') return buf;
  if (Buffer.isBuffer(buf)) return buf.toString('hex');
  if (buf instanceof Uint8Array) return Buffer.from(buf).toString('hex');
  return '';
};

const cleanCommand = (cmd) => {
  if (!cmd) return '';
  let str = cmd.trim();
  if (str.startsWith('.') || str.startsWith('!') || str.startsWith('#')) {
    str = str.slice(1);
  }
  return str.trim();
};

export default defineCommand({
  name: 'shortcut',
  aliases: ['shortcut'],
  category: 'owner',
  description: 'Manage dynamic command shortcuts (sticker and emoji triggers)',
  middlewares: ['sender:isOwner'],

  async execute(payload, ctx) {
    const { msg, tableBot } = ctx;
    if (!msg) return;

    const [subcommandRaw, ...rest] = msg.body?.args || [];
    const subcommand = (subcommandRaw || '').toLowerCase();
    const p = msg.body?.prefix || '.';

    const rawShortcuts = tableBot?.shortcuts;
    const currentShortcuts =
      rawShortcuts && typeof rawShortcuts === 'object'
        ? {
            stickers: { ...(rawShortcuts.stickers || {}) },
            emojis: { ...(rawShortcuts.emojis || {}) },
          }
        : { stickers: {}, emojis: {} };

    const saveShortcuts = async (updated) => {
      await db('bots').update({ shortcuts: JSON.stringify(updated) });
      tableBot?.clearCache?.();
      return updated;
    };

    // Guide display
    const sendGuide = () =>
      msg.reply(
        [
          '｢ *shortcut management* ｣',
          `• \`${p}shortcut list\``,
          `• \`${p}shortcut set <command>\` _(reply stiker)_`,
          `• \`${p}shortcut add <emoji> <command>\``,
          `• \`${p}shortcut del <emoji/nomor>\``,
          `• \`${p}shortcut reset\``,
          '',
          '_Shortcut mengubah stiker atau reaksi emoji menjadi pemicu perintah._',
        ].join('\n')
      );

    if (!subcommand) {
      return sendGuide();
    }

    // 1. LIST
    if (subcommand === 'list') {
      const stickerEntries = Object.entries(currentShortcuts.stickers);
      const emojiEntries = Object.entries(currentShortcuts.emojis);

      if (stickerEntries.length === 0 && emojiEntries.length === 0) {
        return msg.reply('Belum ada shortcut yang terdaftar.');
      }

      const stickerLines =
        stickerEntries.length > 0
          ? stickerEntries
              .map(
                ([hash, cmd], i) =>
                  `• [${i + 1}] \`${hash.slice(0, 8)}...\` -> \`${cmd}\``
              )
              .join('\n')
          : '• _Tidak ada_';

      const emojiLines =
        emojiEntries.length > 0
          ? emojiEntries
              .map(([emoji, cmd], i) => `• [${i + 1}] ${emoji} -> \`${cmd}\``)
              .join('\n')
          : '• _Tidak ada_';

      return msg.reply(
        [
          '｢ *daftar bot shortcut* ｣',
          '',
          '*Sticker Shortcuts:*',
          stickerLines,
          '',
          '*Emoji / Reaction Shortcuts:*',
          emojiLines,
        ].join('\n')
      );
    }

    // 2. SET / ADD (Bisa untuk stiker via reply ATAU emoji langsung)
    if (subcommand === 'set' || subcommand === 'add') {
      // Periksa apakah pesan me-reply stiker
      let rawQuoted = null;
      try {
        const rawMsg = unwrapMessage(payload?.message || payload);
        const contextInfo = getContextInfo(rawMsg);
        rawQuoted = contextInfo?.quotedMessage;
        if (rawQuoted) {
          rawQuoted = unwrapMessage(rawQuoted) || rawQuoted;
        }
      } catch {}

      const sha256Buf = rawQuoted?.stickerMessage?.fileSha256;

      // Kasus A: Reply stiker
      if (sha256Buf) {
        const targetCmd = cleanCommand(rest.join(' '));
        if (!targetCmd) {
          return msg.reply(
            `Tentukan perintah target.\nContoh: \`${p}shortcut set menu\` _(sambil reply stiker)_`
          );
        }

        const hash = toHex(sha256Buf);
        currentShortcuts.stickers[hash] = targetCmd;
        await saveShortcuts(currentShortcuts);

        return msg.reply(
          [
            '*Shortcut stiker berhasil disimpan:*',
            `• Hash: \`${hash.slice(0, 12)}...\``,
            `• Perintah: \`${targetCmd}\``,
          ].join('\n')
        );
      }

      // Kasus B: Set emoji langsung (.shortcut set ❌ kick)
      const [trigger, ...cmdParts] = rest;
      const targetCmd = cleanCommand(cmdParts.join(' '));

      if (!trigger || !targetCmd) {
        return msg.reply(
          [
            'Cara penggunaan:',
            `• Reply stiker: \`${p}shortcut set <command>\``,
            `• Pasang emoji: \`${p}shortcut set <emoji> <command>\``,
            `Contoh: \`${p}shortcut set ❌ kick\``,
          ].join('\n')
        );
      }

      currentShortcuts.emojis[trigger] = targetCmd;
      await saveShortcuts(currentShortcuts);

      return msg.reply(
        [
          '*Shortcut emoji berhasil disimpan:*',
          `• Emoji / Reaksi: ${trigger}`,
          `• Perintah: \`${targetCmd}\``,
        ].join('\n')
      );
    }

    // 3. DEL / REMOVE
    if (
      subcommand === 'del' ||
      subcommand === 'delete' ||
      subcommand === 'remove'
    ) {
      const target = rest[0]?.trim();
      if (!target) {
        return msg.reply(
          `Tentukan emoji atau nomor index stiker yang ingin dihapus.\nContoh: \`${p}shortcut del ❌\` atau \`${p}shortcut del 1\``
        );
      }

      let removed = false;
      let label = target;

      // Cek di daftar emoji terlebih dahulu
      if (currentShortcuts.emojis[target]) {
        delete currentShortcuts.emojis[target];
        removed = true;
      } else {
        // Cek jika input nomor index stiker
        const index = parseInt(target, 10);
        const stickerEntries = Object.entries(currentShortcuts.stickers);
        if (
          !isNaN(index) &&
          index >= 1 &&
          index <= stickerEntries.length &&
          String(index) === target
        ) {
          const [hash] = stickerEntries[index - 1];
          delete currentShortcuts.stickers[hash];
          removed = true;
          label = `Stiker #${index} (${hash.slice(0, 8)}...)`;
        } else if (currentShortcuts.stickers[target]) {
          delete currentShortcuts.stickers[target];
          removed = true;
          label = `Stiker (${target.slice(0, 8)}...)`;
        }
      }

      if (!removed) {
        return msg.reply(`Shortcut \`${target}\` tidak ditemukan.`);
      }

      await saveShortcuts(currentShortcuts);
      return msg.reply(
        [
          `*Shortcut berhasil dihapus:* ${label}`,
          '',
          `Sisa: ${Object.keys(currentShortcuts.stickers).length} stiker, ${Object.keys(currentShortcuts.emojis).length} emoji.`,
        ].join('\n')
      );
    }

    // 4. RESET
    if (subcommand === 'reset') {
      await saveShortcuts({ stickers: {}, emojis: {} });
      return msg.reply(
        [
          '*Seluruh shortcut berhasil di-reset*',
          'Daftar shortcut sekarang kosong.',
        ].join('\n')
      );
    }

    return sendGuide();
  },
});
