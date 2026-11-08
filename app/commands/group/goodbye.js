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

    if (targetAction !== 'on' && targetAction !== 'off') {
      const currentLabel = currentStatus ? 'Aktif' : 'Nonaktif';

      return msg.reply(
        [
          '｢ *pengaturan goodbye* ｣',
          `Status aktif: *${currentLabel}*`,
          '',
          `• \`${cmd} on\` _(aktifkan pesan perpisahan member keluar)_`,
          `• \`${cmd} off\` _(nonaktifkan pesan perpisahan member keluar)_`,
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
