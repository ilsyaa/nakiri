import { defineCommand } from '#app/services/bot/index.js';
import db from '@nakiri/core/services/database';

export default defineCommand({
  name: 'goodbye',
  aliases: ['goodbye'],
  category: 'group',
  description: 'Toggle goodbye farewell message for departing group members',
  middlewares: ['group', 'sender:admin,superAdmin,isOwner'],

  async execute(payload, ctx) {
    const { msg, tableGroup } = ctx;
    if (!msg) return;

    const prefix = msg.body?.prefix || '.';
    const cmd = msg.body?.command || `${prefix}goodbye`;
    const args = msg.body?.args || [];
    const targetAction = args[0]?.toLowerCase();

    const currentStatus = Boolean(tableGroup?.settings?.goodbye);
    const currentAiStatus = Boolean(tableGroup?.settings?.goodbyeAi);

    if (targetAction === 'ai') {
      const aiAction = args[1]?.toLowerCase();
      if (aiAction !== 'on' && aiAction !== 'off') {
        const aiLabel = currentAiStatus ? 'Aktif' : 'Nonaktif';
        return msg.reply(
          [
            '｢ *pengaturan goodbye ai* ｣',
            `Status AI: *${aiLabel}*`,
            '',
            `• \`${cmd} ai on\` _(gunakan persona AI untuk perpisahan)_`,
            `• \`${cmd} ai off\` _(gunakan template teks standar)_`,
          ].join('\n')
        );
      }

      const newAiStatus = aiAction === 'on';
      const updatedSettings = {
        ...(tableGroup?.settings || {}),
        goodbyeAi: newAiStatus,
      };

      await db('groups')
        .where({ id: msg.chat })
        .update({
          settings: JSON.stringify(updatedSettings),
        });

      tableGroup?.clearCache?.();
      if (tableGroup) {
        tableGroup.settings = updatedSettings;
      }

      const statusLabel = newAiStatus ? 'diaktifkan' : 'dinonaktifkan';
      return msg.reply(`Mode AI untuk goodbye berhasil *${statusLabel}*.`);
    }

    if (targetAction !== 'on' && targetAction !== 'off') {
      const currentLabel = currentStatus ? 'Aktif' : 'Nonaktif';
      const aiLabel = currentAiStatus ? 'Aktif' : 'Nonaktif';

      return msg.reply(
        [
          '｢ *pengaturan goodbye* ｣',
          `Status aktif: *${currentLabel}*`,
          `Status AI: *${aiLabel}*`,
          '',
          `• \`${cmd} on\` _(aktifkan pesan perpisahan member keluar)_`,
          `• \`${cmd} off\` _(nonaktifkan pesan perpisahan member keluar)_`,
          `• \`${cmd} ai on|off\` _(aktifkan/nonaktifkan gaya AI)_`,
        ].join('\n')
      );
    }

    const newStatus = targetAction === 'on';

    const updatedSettings = {
      ...(tableGroup?.settings || {}),
      goodbye: newStatus,
    };

    await db('groups')
      .where({ id: msg.chat })
      .update({
        settings: JSON.stringify(updatedSettings),
      });

    tableGroup?.clearCache?.();

    if (tableGroup) {
      tableGroup.settings = updatedSettings;
    }

    const statusLabel = newStatus ? 'diaktifkan' : 'dinonaktifkan';
    await msg.reply(`Pesan perpisahan (goodbye) berhasil *${statusLabel}*.`);
  },
});
