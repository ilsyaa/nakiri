import { defineCommand, getGroupMetadata } from '#app/services/bot/index.js';
import db from '@nakiri/core/services/database';
import {
  applyGroupWarning,
  isParticipantMatch,
} from '#app/services/group-warning.js';
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
    const args = msg.body?.args || [];

    if (!msg.quoted && args[0]?.toLowerCase() === 'ai') {
      const aiAction = args[1]?.toLowerCase();
      const currentAiStatus = Boolean(tableGroup?.settings?.warnAi);

      if (aiAction !== 'on' && aiAction !== 'off') {
        const aiLabel = currentAiStatus ? 'Aktif' : 'Nonaktif';
        return msg.reply(
          [
            '｢ *pengaturan warn ai* ｣',
            `Status AI: *${aiLabel}*`,
            '',
            `• \`${cmd} ai on\` _(gunakan persona AI untuk pesan warn)_`,
            `• \`${cmd} ai off\` _(gunakan template teks standar)_`,
          ].join('\n')
        );
      }

      const newAiStatus = aiAction === 'on';
      const updatedSettings = {
        ...(tableGroup?.settings || {}),
        warnAi: newAiStatus,
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
      return msg.reply(`Mode AI untuk warn berhasil *${statusLabel}*.`);
    }

    const targetIdentities = resolveTarget(msg, '', { allowSelf: false });
    const targetChat =
      targetIdentities.pn || targetIdentities.lid || targetIdentities.raw;

    if (!targetChat || !tableGroup?.id) {
      const aiLabel = Boolean(tableGroup?.settings?.warnAi)
        ? 'Aktif'
        : 'Nonaktif';
      return msg.reply(
        [
          '｢ *panduan warn* ｣',
          `Status AI: *${aiLabel}*`,
          '',
          `• Reply chat member: \`${cmd} [alasan]\``,
          `• Tag member: \`${cmd} @member [alasan]\``,
          `• Mode AI: \`${cmd} ai on|off\``,
        ].join('\n')
      );
    }

    // Resolve group participants (cached metadata, live query as fallback)
    let participants = [];
    try {
      const metadata = await getGroupMetadata(client, msg.chat);
      participants = metadata?.participants || [];
    } catch {}
    if (participants.length === 0) {
      try {
        const metadata = await client.group?.queryGroupMetadata(msg.chat);
        // @ts-ignore
        participants = metadata?.participants || [];
      } catch {}
    }

    const candidateTargets = [
      targetChat,
      ...(targetIdentities?.jids || []),
    ].filter(Boolean);

    const targetParticipant = participants?.find((part) =>
      candidateTargets.some((cand) => isParticipantMatch(part, cand))
    );

    // Protection: do not warn bot, self, or admins
    const botIds = new Set(
      [msg.bot?.id, msg.bot?.pn, msg.bot?.lid].filter(Boolean)
    );
    const senderIds = new Set(
      [msg.sender?.id, msg.sender?.pn, msg.sender?.lid].filter(Boolean)
    );

    if (candidateTargets.some((cand) => botIds.has(cand))) return;
    if (candidateTargets.some((cand) => senderIds.has(cand))) return;
    if (
      targetParticipant &&
      (botIds.has(targetParticipant.jid) ||
        (targetParticipant.lid && botIds.has(targetParticipant.lid)))
    ) {
      return;
    }
    if (
      targetParticipant &&
      (senderIds.has(targetParticipant.jid) ||
        (targetParticipant.lid && senderIds.has(targetParticipant.lid)))
    ) {
      return;
    }

    if (targetParticipant?.isAdmin || targetParticipant?.isSuperAdmin) {
      return msg.reply('Tidak dapat memberi peringatan kepada sesama admin.');
    }

    let reason = (msg.body?.argsText || '').trim();
    if (!msg.quoted && msg.body?.mentionedJid?.[0]) {
      const mentionId = String(msg.body.mentionedJid[0]).split('@')[0];
      if (mentionId) {
        reason = reason.replace(new RegExp(`@${mentionId}\\b`, 'g'), '');
      }
    }
    reason = reason.replace(/\s+/g, ' ').trim() || null;

    const result = await applyGroupWarning({
      client,
      msg,
      payload,
      tableGroup,
      participant: targetParticipant,
      targets: candidateTargets,
      reason,
      deleteMessage: 'quoted',
      replyTo: 'quoted',
      logTag: '[WARN]',
    });

    return result;
  },
});
