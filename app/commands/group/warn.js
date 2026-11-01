import { defineCommand } from '#app/services/bot/index.js';
import db from '@nakiri/core/services/database';
import { DateTime } from 'luxon';
import { isLidJid } from 'zapo-js';
import { resolveTarget } from '#app/utils/target.js';

export default defineCommand({
  name: 'warn',
  aliases: ['warn'],
  category: 'group',
  description: 'Warn group members',
  middlewares: ['group', 'sender:admin,superAdmin', 'bot:admin'],

  async execute(payload, ctx) {
    const { client, msg, tableGroup } = ctx;
    if (!msg || msg.flags.fromMe) return;

    const p = msg.body?.prefix || '.';
    const cmd = msg.body?.command || `${p}warn`;

    const targetIdentities = resolveTarget(msg, '', { allowSelf: false });
    const targetChat =
      targetIdentities.pn || targetIdentities.lid || targetIdentities.raw;

    if (!targetChat || !tableGroup?.id) {
      return msg.reply(
        [
          '｢ *panduan warn* ｣',
          `• Reply chat member: \`${cmd}\``,
          `• Tag member: \`${cmd} @member\``,
        ].join('\n')
      );
    }

    // Protection: do not warn bot, self, or admins
    if (targetChat === msg.bot?.pn || targetChat === msg.bot?.lid) return;
    if (targetChat === msg.sender?.pn || targetChat === msg.sender?.lid) return;

    const targetParticipant = msg.group?.participants?.find(
      (p) => p.jid === targetChat || p.lid === targetChat
    );
    if (targetParticipant?.isAdmin || targetParticipant?.isSuperAdmin) {
      return msg.reply('Tidak dapat memberi peringatan kepada sesama admin.');
    }

    // Resolve or create record for the target member being warned
    let targetMember = await db('group_members')
      .where('group_id', tableGroup.id)
      .where((qb) => {
        qb.where('user_lid', targetChat).orWhere('user_pn', targetChat);
      })
      .first();

    if (!targetMember) {
      try {
        const [insertedId] = await db('group_members').insert({
          group_id: tableGroup.id,
          user_lid: isLidJid(targetChat) ? targetChat : null,
          user_pn: isLidJid(targetChat) ? null : targetChat,
        });

        targetMember = await db('group_members')
          .where({ id: insertedId })
          .first();
      } catch {
        targetMember = await db('group_members')
          .where('group_id', tableGroup.id)
          .where((qb) => {
            qb.where('user_lid', targetChat).orWhere('user_pn', targetChat);
          })
          .first();
      }
    } else if (!targetMember.user_pn && !isLidJid(targetChat)) {
      await db('group_members')
        .where({ id: targetMember.id })
        .update({ user_pn: targetChat });
      targetMember.user_pn = targetChat;
    }

    const maxWarn = Number(tableGroup?.settings?.maxWarn ?? 3);
    const currentWarn = Number(targetMember?.warnings ?? 0) + 1;

    const sendReply = async (text) => {
      if (msg.quoted) {
        return msg.quoted.reply(text);
      }
      return msg.reply(text, { mentions: [targetChat] });
    };

    if (currentWarn >= maxWarn) {
      await db('group_members').where({ id: targetMember.id }).delete();

      try {
        await client.group.removeParticipants(msg.chat, [targetChat]);
      } catch {}

      await sendReply(
        `Dikeluarkan karena telah mencapai batas peringatan (${currentWarn}/${maxWarn}).`
      );
    } else {
      const now = DateTime.utc().toSQL({ includeOffset: false });
      await db('group_members').where({ id: targetMember.id }).update({
        warnings: currentWarn,
        last_warned_at: now,
      });
      targetMember.last_warned_at = now;

      await sendReply(`Mendapatkan peringatan ke-${currentWarn}/${maxWarn}`);
    }
  },
});
