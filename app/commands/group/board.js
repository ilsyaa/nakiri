import { defineCommand } from '#app/services/bot/index.js';
import db from '@nakiri/core/services/database';
import { parseUtc } from '#app/services/time.js';

export default defineCommand({
  name: 'board',
  aliases: ['board'],
  category: 'group',
  description: 'Display top 10 active group members leaderboard',
  middlewares: ['group'],

  async execute(payload, ctx) {
    const { msg, tableGroup } = ctx;
    if (!msg) return;

    const groupId = tableGroup?.id || msg.chat;
    if (!groupId) return;

    const withMention =
      Array.isArray(msg.body?.args) &&
      msg.body.args.some((arg) => {
        const lower = arg.toLowerCase();
        return lower === '-m' || lower === '--mention';
      });

    const topMembers = await db('group_members')
      .where('group_id', groupId)
      .orderBy('score', 'desc')
      .orderBy('last_interacted_at', 'desc')
      .limit(10);

    if (!topMembers || topMembers.length === 0) {
      await msg.reply('Belum ada data interaksi member di grup ini.');
      return;
    }

    const mentions = [];
    const items = topMembers.map((member, index) => {
      const rank = index + 1;

      let displayName;
      if (withMention && member.user_pn) {
        const phone = member.user_pn.split('@')[0];
        displayName = `@${phone}`;
        mentions.push(member.user_pn);
      } else {
        displayName =
          member.pushname ||
          (member.user_pn ? member.user_pn.split('@')[0] : 'Member');
      }

      let lastSeenText = '-';
      if (member.last_interacted_at) {
        const last = parseUtc(member.last_interacted_at);
        if (last && last.isValid) {
          const relative = last.toRelative({ locale: 'en' });
          lastSeenText = `${relative}`;
        }
      }

      return `${rank}. *${displayName}*\n   • *Score:* ${member.score ?? 0}\n   • *Last Interaction:* ${lastSeenText}`;
    });

    const text = [`*TOP 10*`, '', items.join('\n\n')].join('\n');

    await msg.reply(text, {
      mentions: mentions.length > 0 ? [...new Set(mentions)] : undefined,
    });
  },
});
