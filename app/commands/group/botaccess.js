import { defineCommand } from '#app/services/bot/index.js';
import db from '@nakiri/core/services/database';

export default defineCommand({
  name: 'gmode',
  aliases: ['gmode'],
  category: 'group',
  description:
    'Configure bot usage permission in the group (everyone vs admin)',
  middlewares: ['group', 'sender:admin,superAdmin,isOwner'],

  async execute(payload, ctx) {
    const { msg, tableGroup } = ctx;
    if (!msg) return;

    const prefix = msg.body?.prefix || '.';
    const args = msg.body?.args || [];
    const targetMode = args[0]?.toLowerCase();

    const currentMode = tableGroup?.settings?.botAccess || 'everyone';

    if (!targetMode || (targetMode !== 'everyone' && targetMode !== 'admin')) {
      const currentLabel =
        currentMode === 'admin' ? 'Admin saja' : 'Semua member (Everyone)';

      return msg.reply(
        [
          '*PENGATURAN AKSES PENGGUNAAN BOT*',
          `Status saat ini: *${currentLabel}*`,
          '',
          '*Pilihan Pengaturan:*',
          `- \`${prefix}gmode everyone\` (bot dapat digunakan oleh semua member)`,
          `- \`${prefix}gmode admin\` (bot hanya dapat digunakan oleh admin grup)`,
        ].join('\n')
      );
    }

    const updatedSettings = {
      ...(tableGroup?.settings || {}),
      botAccess: targetMode,
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

    const newLabel =
      targetMode === 'admin' ? 'Hanya Admin' : 'Semua Member (Everyone)';

    await msg.reply(`Akses penggunaan bot berhasil diubah ke: *${newLabel}*`);
  },
});
