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
    const currentAiStatus = Boolean(tableGroup?.settings?.welcomeAi);

    if (targetAction === 'ai') {
      const aiAction = args[1]?.toLowerCase();
      if (aiAction !== 'on' && aiAction !== 'off') {
        const aiLabel = currentAiStatus ? 'Aktif' : 'Nonaktif';
        return msg.reply(
          [
            '｢ *pengaturan welcome ai* ｣',
            `Status AI: *${aiLabel}*`,
            '',
            `• \`${cmd} ai on\` _(gunakan persona AI untuk sambutan)_`,
            `• \`${cmd} ai off\` _(gunakan template teks standar)_`,
          ].join('\n')
        );
      }

      const newAiStatus = aiAction === 'on';
      const updatedSettings = {
        ...(tableGroup?.settings || {}),
        welcomeAi: newAiStatus,
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
      return msg.reply(`Mode AI untuk welcome berhasil *${statusLabel}*.`);
    }

    if (targetAction !== 'on' && targetAction !== 'off') {
      const currentLabel = currentStatus ? 'Aktif' : 'Nonaktif';
      const aiLabel = currentAiStatus ? 'Aktif' : 'Nonaktif';

      return msg.reply(
        [
          '｢ *pengaturan welcome* ｣',
          `Status aktif: *${currentLabel}*`,
          `Status AI: *${aiLabel}*`,
          '',
          `• \`${cmd} on\` _(aktifkan pesan sambutan member baru)_`,
          `• \`${cmd} off\` _(nonaktifkan pesan sambutan member baru)_`,
          `• \`${cmd} ai on|off\` _(aktifkan/nonaktifkan gaya AI)_`,
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
