import { defineCommand } from '#app/services/bot/index.js';
import db from '@nakiri/core/services/database';

export default defineCommand({
  name: 'mode',
  aliases: ['mode'],
  category: 'owner',
  description: 'Manage bot operational mode (public, self)',
  middlewares: ['sender:isOwner'],

  async execute(payload, ctx) {
    const { msg, tableBot } = ctx;
    if (!msg) return;

    const [subcommandRaw] = msg.body?.args || [];
    const subcommand = (subcommandRaw || '').toLowerCase();
    const p = msg.body?.prefix || '.';
    const cmd = msg.body?.command || `${p}mode`;

    const isSelf = Boolean(tableBot?.self);
    const currentMode = isSelf ? 'self' : 'public';

    // Guide / Status display
    if (!subcommand) {
      return msg.reply(
        [
          '｢ *bot mode* ｣',
          `Status aktif: *${currentMode}*`,
          '',
          `• \`${cmd} public\``,
          `• \`${cmd} self\``,
          '',
          '_Mode self membuat bot hanya merespons pesan dari owner._',
        ].join('\n')
      );
    }

    if (subcommand === 'public') {
      if (!isSelf) {
        return msg.reply('Bot sudah dalam mode *public*.');
      }

      await db('bots').update({ self: false });
      tableBot?.clearCache?.();

      return msg.reply(
        [
          '*Mode bot berhasil diubah ke public*',
          'Bot sekarang merespons perintah dari seluruh pengguna.',
        ].join('\n')
      );
    }

    if (subcommand === 'self') {
      if (isSelf) {
        return msg.reply('Bot sudah dalam mode *self*.');
      }

      await db('bots').update({ self: true });
      tableBot?.clearCache?.();

      return msg.reply(
        [
          '*Mode bot berhasil diubah ke self*',
          'Bot saat ini hanya akan merespons perintah dari owner.',
        ].join('\n')
      );
    }

    // Invalid argument
    return msg.reply(
      [
        `Argumen tidak valid: \`${subcommandRaw}\``,
        `Gunakan \`${cmd} public\` atau \`${cmd} self\`.`,
      ].join('\n')
    );
  },
});
