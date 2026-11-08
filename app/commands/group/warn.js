import { defineCommand } from '#app/services/bot/index.js';
import db from '@nakiri/core/services/database';
import logger from '@nakiri/core/utils/logger';
import { DateTime } from 'luxon';
import { isLidJid, getContextInfo, toUserJid } from 'zapo-js';
import { resolveTarget } from '#app/utils/target.js';
function isParticipantMatch(part, target) {
  if (!part || !target) return false;
  if (part.jid === target || part.lid === target) return true;

  const targetDigits = String(target).replace(/[^0-9]/g, '');
  if (!targetDigits) return false;

  const partPhoneDigits = part.phoneNumber
    ? String(part.phoneNumber).replace(/[^0-9]/g, '')
    : '';
  const partJidDigits = part.jid ? String(part.jid).replace(/[^0-9]/g, '') : '';
  const partLidDigits = part.lid ? String(part.lid).replace(/[^0-9]/g, '') : '';

  if (partPhoneDigits && partPhoneDigits === targetDigits) return true;
  if (partJidDigits && partJidDigits === targetDigits) return true;
  if (partLidDigits && partLidDigits === targetDigits) return true;

  if (partPhoneDigits && `${partPhoneDigits}@s.whatsapp.net` === target) {
    return true;
  }

  return false;
}

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

    // Resolve group participants (live query with fallback to msg.group)
    let participants = msg.group?.participants;
    if (!participants || participants.length === 0) {
      try {
        const metadata = await client.group?.queryGroupMetadata(msg.chat);
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

    // Resolve or create record for the target member being warned
    let targetMember = await db('group_members')
      .where('group_id', tableGroup.id)
      .where((qb) => {
        for (const cand of candidateTargets) {
          qb.orWhere('user_lid', cand).orWhere('user_pn', cand);
        }
      })
      .first();

    if (!targetMember) {
      const userLid =
        targetParticipant?.lid || (isLidJid(targetChat) ? targetChat : null);
      const userPn =
        targetParticipant?.phoneNumber ||
        (targetParticipant?.jid?.endsWith('@s.whatsapp.net')
          ? targetParticipant.jid
          : null) ||
        (isLidJid(targetChat) ? null : targetChat);

      try {
        const [insertedId] = await db('group_members').insert({
          group_id: tableGroup.id,
          user_lid: userLid,
          user_pn: userPn,
        });

        targetMember = await db('group_members')
          .where({ id: insertedId })
          .first();
      } catch {
        targetMember = await db('group_members')
          .where('group_id', tableGroup.id)
          .where((qb) => {
            for (const cand of candidateTargets) {
              qb.orWhere('user_lid', cand).orWhere('user_pn', cand);
            }
          })
          .first();
      }
    } else {
      const updates = {};
      if (!targetMember.user_pn) {
        const pn =
          targetParticipant?.phoneNumber ||
          (targetParticipant?.jid?.endsWith('@s.whatsapp.net')
            ? targetParticipant.jid
            : null) ||
          (!isLidJid(targetChat) ? targetChat : null);
        if (pn) updates.user_pn = pn;
      }
      if (!targetMember.user_lid) {
        const lid =
          targetParticipant?.lid || (isLidJid(targetChat) ? targetChat : null);
        if (lid) updates.user_lid = lid;
      }
      if (Object.keys(updates).length > 0) {
        await db('group_members')
          .where({ id: targetMember.id })
          .update(updates);
        Object.assign(targetMember, updates);
      }
    }

    const maxWarn = Number(tableGroup?.settings?.maxWarn ?? 3);
    const currentWarn = Number(targetMember?.warnings ?? 0) + 1;

    const sendReply = async (text) => {
      if (typeof msg.quoted?.reply === 'function') {
        return msg.quoted.reply(text);
      }
      return msg.reply(text, { mentions: [targetChat] });
    };

    // delete message
    if (msg.quoted) {
      try {
        const raw = payload?.message || payload;
        const contextInfo = getContextInfo(raw);
        const participant =
          (contextInfo?.participant
            ? toUserJid(contextInfo.participant)
            : null) ||
          msg.quoted.sender?.id ||
          msg.quoted.sender?.pn ||
          msg.quoted.sender?.lid ||
          targetChat;

        if (
          client?.message &&
          typeof client.message.send === 'function' &&
          msg.quoted.stanzaId
        ) {
          await client.message.send(msg.chat, {
            type: 'revoke',
            target: {
              remoteJid: msg.chat,
              id: msg.quoted.stanzaId,
              fromMe: Boolean(msg.quoted.flags?.fromMe),
              participant,
            },
          });
        }
      } catch (err) {
        logger.error(
          '[WARN]',
          `Failed to delete quoted message: ${err.message}`
        );
      }
    }
    if (currentWarn >= maxWarn) {
      const kickJid =
        targetParticipant?.jid ||
        targetMember?.user_pn ||
        targetChat;

      let kickSuccess = false;
      try {
        const results = await client.group.removeParticipants(msg.chat, [
          kickJid,
        ]);
        const res = results?.[0];
        if (
          !res ||
          res.status === 'ok' ||
          res.code === 200 ||
          res.code === 409
        ) {
          kickSuccess = true;
        } else if (
          targetParticipant?.lid &&
          targetParticipant.lid !== kickJid
        ) {
          const fallbackResults = await client.group.removeParticipants(
            msg.chat,
            [targetParticipant.lid]
          );
          const fallbackRes = fallbackResults?.[0];
          if (
            !fallbackRes ||
            fallbackRes.status === 'ok' ||
            fallbackRes.code === 200 ||
            fallbackRes.code === 409
          ) {
            kickSuccess = true;
          } else {
            logger.warn(
              '[WARN]',
              `Failed to remove participant ${kickJid} (fallback ${targetParticipant.lid}): status=${fallbackRes.status}, code=${fallbackRes.code}`
            );
          }
        } else {
          logger.warn(
            '[WARN]',
            `Failed to remove participant ${kickJid}: status=${res.status}, code=${res.code}`
          );
        }
      } catch (err) {
        logger.error(
          '[WARN]',
          `Exception while removing participant ${kickJid}: ${err.message}`
        );
      }

      if (kickSuccess) {
        await db('group_members').where({ id: targetMember.id }).delete();
        logger.info(
          '[WARN]',
          `Member ${kickJid} removed from group ${msg.chat} after reaching max warnings.`
        );
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

        await sendReply(
          `Telah mencapai batas peringatan (${currentWarn}/${maxWarn}), tetapi gagal mengeluarkan member dari grup.`
        );
      }
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
