import { defineCommand, formatMenuText } from '#app/services/bot/index.js';

export default defineCommand({
  name: 'menu',
  aliases: ['menu', 'help'],
  category: 'utility',
  description: 'Display bot menu and available commands',

  async execute(payload, ctx) {
    const msg = ctx.msg;
    if (!msg) return;

    try {
      const prefix = msg.body?.prefix || '.';
      const userName = msg.sender?.name || 'User';
      const groupFilter = msg.body?.args?.[0] || '';

      const text = await formatMenuText({
        prefix,
        userName,
        groupFilter,
      });

      await msg.reply(text);
    } catch (err) {
      console.error('[MENU] Failed to generate or send menu:', err);
    }
  },
});
