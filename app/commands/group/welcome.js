import { defineCommand } from '#app/services/bot/index.js';
import db from '@nakiri/core/services/database';

export default defineCommand({
  name: 'welcome',
  aliases: ['welcome'],
  category: 'group',
  description: 'Toggle welcome greeting message for new group members',
  middlewares: ['group', 'sender:admin,superAdmin,isOwner'],

  async execute(payload, ctx) {
    const { msg, tableGroup } = ctx;
    if (!msg) return;

    const prefix = msg.body?.prefix || '.';
    const cmd = msg.body?.command || `${prefix}welcome`;
    const args = msg.body?.args || [];
    const targetAction = args[0]?.toLowerCase();

    const currentStatus = Boolean(tableGroup?.settings?.welcome);

    if (targetAction !== 'on' && targetAction !== 'off') {
      const currentLabel = currentStatus ? 'Aktif' : 'Nonaktif';

      return msg.reply(
        [
          '｢ *pengaturan welcome* ｣',
          `Status aktif: *${currentLabel}*`,
          '',
          `• \`${cmd} on\` _(aktifkan pesan sambutan member baru)_`,
          `• \`${cmd} off\` _(nonaktifkan pesan sambutan member baru)_`,
        ].join('\n')
      );
    }

    const newStatus = targetAction === 'on';

    const updatedSettings = {
      ...(tableGroup?.settings || {}),
      welcome: newStatus,
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
    await msg.reply(`Pesan sambutan (welcome) berhasil *${statusLabel}*.`);
  },
});
