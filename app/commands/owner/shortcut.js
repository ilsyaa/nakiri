import { defineCommand, getCommand } from '#app/services/bot/index.js';
import {
  getShortcuts,
  setShortcut,
  deleteShortcut,
  resetShortcuts,
  isEmoji,
} from '#app/services/shortcut.js';

export default defineCommand({
  name: 'shortcut',
  aliases: ['reactcmd', 'emojicmd', 'sc'],
  category: 'owner',
  description: 'Manage global emoji reaction command shortcuts for the bot',
  middlewares: ['sender:isOwner'],

  async execute(payload, ctx) {
    const { msg } = ctx;
    if (!msg) return;

    const prefix = msg.body?.prefix || '.';
    const args = Array.isArray(msg.body?.args) ? [...msg.body.args] : [];
    const action = args[0]?.toLowerCase();

    // 1. Set global shortcut: .shortcut -set <emoji> <command>
    if (action === '-set' || action === 'set') {
      const emojiInput = args[1];
      const cmdInput = args[2];

      if (!emojiInput || !cmdInput) {
        return msg.reply(
          [
            '*Format Perintah Kurang Lengkap!*',
            `Penggunaan: \`${prefix}shortcut -set <emoji> <command>\``,
            `Contoh: \`${prefix}shortcut -set ❌ kick\``,
          ].join('\n')
        );
      }

      if (!isEmoji(emojiInput)) {
        return msg.reply(
          `Input '${emojiInput}' bukan merupakan emoji yang valid.`
        );
      }

      const cleanCmd = cmdInput.replace(/^[./!#$]/, '').trim().toLowerCase();
      if (
        cleanCmd === 'shortcut' ||
        cleanCmd === 'reactcmd' ||
        cleanCmd === 'sc'
      ) {
        return msg.reply(
          'Tidak dapat mendaftarkan perintah shortcut sebagai pemicu reaksi.'
        );
      }

      const cmdDef = await getCommand(cleanCmd);
      if (!cmdDef) {
        return msg.reply(
          `Perintah '${cleanCmd}' tidak ditemukan di daftar perintah bot.`
        );
      }

      await setShortcut(emojiInput, cleanCmd);
      return msg.reply(
        `Berhasil mengatur shortcut global: ${emojiInput} ➔ \`${cleanCmd}\``
      );
    }

    // 2. Delete global shortcut: .shortcut -del <emoji>
    if (action === '-del' || action === 'del' || action === '-delete') {
      const emojiInput = args[1];

      if (!emojiInput) {
        return msg.reply(
          [
            '*Format Perintah Kurang Lengkap!*',
            `Penggunaan: \`${prefix}shortcut -del <emoji>\``,
            `Contoh: \`${prefix}shortcut -del ⚠️\``,
          ].join('\n')
        );
      }

      await deleteShortcut(emojiInput);
      return msg.reply(
        `Berhasil menghapus shortcut global untuk emoji ${emojiInput}.`
      );
    }

    // 3. Reset global shortcuts: .shortcut -reset
    if (action === '-reset' || action === 'reset') {
      await resetShortcuts();
      return msg.reply(
        'Berhasil mereset shortcut emoji global ke pengaturan default (❌ ➔ kick, ⚠️ ➔ warn).'
      );
    }

    // 4. Default / List global shortcuts: .shortcut or .shortcut -list
    const activeShortcuts = await getShortcuts();
    const entries = Object.entries(activeShortcuts);

    const listLines =
      entries.length > 0
        ? entries.map(([emoji, cmd]) => `* ${emoji} ➔ \`${cmd}\``).join('\n')
        : '*(Belum ada shortcut emoji global yang aktif)*';

    const text = [
      '｢ GLOBAL EMOJI SHORTCUTS ｣',
      listLines,
      '',
      'Penggunaan (Owner):',
      `* \`${prefix}shortcut -set <emoji> <command>\``,
      `* \`${prefix}shortcut -del <emoji>\``,
      `* \`${prefix}shortcut -reset\``,
    ].join('\n');

    return msg.reply(text);
  },
});
