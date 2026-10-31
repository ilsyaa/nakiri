import { defineCommand, getGroupMetadata } from '#app/services/bot/index.js';
import db from '@nakiri/core/services/database';
import { delay } from '@nakiri/core/utils/common';
import logger from '@nakiri/core/utils/logger';

/**
 * Check if a group participant matches an actor or target identifier
 * @param {any} part
 * @param {string} target
 * @returns {boolean}
 */
function isParticipantMatch(part, target) {
  if (!part || !target) return false;
  if (part.jid === target || part.lid === target) return true;

  const targetDigits = target.replace(/[^0-9]/g, '');
  const partPhoneDigits = part.phoneNumber
    ? part.phoneNumber.replace(/[^0-9]/g, '')
    : '';
  const partJidDigits = part.jid ? part.jid.replace(/[^0-9]/g, '') : '';
  const partLidDigits = part.lid ? part.lid.replace(/[^0-9]/g, '') : '';

  if (partPhoneDigits && partPhoneDigits === targetDigits) return true;
  if (partJidDigits && partJidDigits === targetDigits) return true;
  if (partLidDigits && partLidDigits === targetDigits) return true;

  if (partPhoneDigits && `${partPhoneDigits}@s.whatsapp.net` === target) {
    return true;
  }

  return false;
}

export default defineCommand({
  name: 'kick',
  commands: ['kick'],
  category: 'group',
  description: 'Kick group member by tag or reply',
  middlewares: ['group', 'sender:admin,superAdmin', 'bot:admin'],

  async execute(payload, ctx) {
    const { client, msg } = ctx;
    if (!msg) return;

    // 1. Resolve targets from quote or mentions
    const targetJids = [];
    if (msg.quoted?.sender) {
      if (msg.quoted.sender.id) targetJids.push(msg.quoted.sender.id);
      if (msg.quoted.sender.pn && !targetJids.includes(msg.quoted.sender.pn)) {
        targetJids.push(msg.quoted.sender.pn);
      }
      if (
        msg.quoted.sender.lid &&
        !targetJids.includes(msg.quoted.sender.lid)
      ) {
        targetJids.push(msg.quoted.sender.lid);
      }
    }
    if (
      Array.isArray(msg.body?.mentionedJid) &&
      msg.body.mentionedJid.length > 0
    ) {
      for (const jid of msg.body.mentionedJid) {
        if (!targetJids.includes(jid)) {
          targetJids.push(jid);
        }
      }
    }

    if (targetJids.length === 0) {
      const prefix = msg.body?.prefix || '.';
      return msg.reply(
        [
          '*Panduan Format Perintah:*',
          `- Reply pesan member: \`${prefix}kick\``,
          `- Tag member: \`${prefix}kick @member\``,
        ].join('\n')
      );
    }

    // 2. Fetch live group roster
    const metadata = await client.group.queryGroupMetadata(msg.chat);
    const participants = metadata?.participants || [];
    if (participants.length === 0) {
      return msg.reply('Gagal mengambil daftar peserta grup.');
    }

    // 3. Filter valid targets (protect bot, sender, and fellow admins)
    const botIds = new Set(
      [msg.bot?.id, msg.bot?.pn, msg.bot?.lid].filter(Boolean)
    );
    const senderIds = new Set(
      [msg.sender?.id, msg.sender?.pn, msg.sender?.lid].filter(Boolean)
    );

    const validParticipantsToKick = [];

    for (const target of targetJids) {
      const p = participants.find((part) => isParticipantMatch(part, target));

      if (!p) continue;
      if (botIds.has(p.jid) || (p.lid && botIds.has(p.lid))) continue;
      if (senderIds.has(p.jid) || (p.lid && senderIds.has(p.lid))) continue;
      if (p.isAdmin || p.isSuperAdmin) continue;

      let existing = validParticipantsToKick.find(
        (v) => v.participant.jid === p.jid
      );
      if (!existing) {
        existing = { participant: p, targetJids: new Set() };
        validParticipantsToKick.push(existing);
      }
      existing.targetJids.add(target);
    }

    if (validParticipantsToKick.length === 0) {
      return msg.reply(
        'Tidak dapat mengeluarkan target (target adalah admin, bot, atau tidak ditemukan).'
      );
    }

    // 4. Sequential removal with delay to prevent account ban
    const kicked = [];

    for (let i = 0; i < validParticipantsToKick.length; i++) {
      const item = validParticipantsToKick[i];
      const p = item.participant;

      try {
        const results = await client.group.removeParticipants(msg.chat, [
          p.jid,
        ]);
        const res = results?.[0];
        if (
          !res ||
          res.status === 'ok' ||
          res.code === 200 ||
          res.code === 409
        ) {
          kicked.push(item);
        } else {
          logger.warn(
            '[KICK]',
            `Failed to remove participant ${p.jid}: status=${res.status}, code=${res.code}`
          );
        }
      } catch (err) {
        logger.error(
          '[KICK]',
          `Exception while removing participant ${p.jid}: ${err.message}`
        );
      }

      if (i < validParticipantsToKick.length - 1) {
        await delay(1200);
      }
    }

    if (kicked.length === 0) {
      return msg.reply('Gagal mengeluarkan member.');
    }

    // 5. Clean up kicked members from database
    try {
      const dbMembers = await db('group_members')
        .where('group_id', msg.chat)
        .select('id', 'user_lid', 'user_pn');

      const kickedIdentifiers = new Set();
      for (const item of kicked) {
        const p = item.participant;
        if (p.jid) {
          kickedIdentifiers.add(p.jid);
          kickedIdentifiers.add(p.jid.replace(/@.*$/, ''));
        }
        if (p.lid) {
          kickedIdentifiers.add(p.lid);
          kickedIdentifiers.add(p.lid.replace(/@.*$/, ''));
        }
        if (p.phoneNumber) {
          const digits = p.phoneNumber.replace(/[^0-9]/g, '');
          kickedIdentifiers.add(p.phoneNumber);
          if (digits) {
            kickedIdentifiers.add(digits);
            kickedIdentifiers.add(`${digits}@s.whatsapp.net`);
          }
        }
        for (const t of item.targetJids) {
          kickedIdentifiers.add(t);
          const tDigits = t.replace(/[^0-9]/g, '');
          if (tDigits) {
            kickedIdentifiers.add(tDigits);
            kickedIdentifiers.add(`${tDigits}@s.whatsapp.net`);
          }
        }
      }

      const memberIdsToDelete = new Set();
      for (const row of dbMembers) {
        const rowPnDigits = row.user_pn
          ? row.user_pn.replace(/[^0-9]/g, '')
          : null;
        const rowLidDigits = row.user_lid
          ? row.user_lid.replace(/[^0-9]/g, '')
          : null;

        if (
          (row.user_lid && kickedIdentifiers.has(row.user_lid)) ||
          (row.user_pn && kickedIdentifiers.has(row.user_pn)) ||
          (rowPnDigits && kickedIdentifiers.has(rowPnDigits)) ||
          (rowLidDigits && kickedIdentifiers.has(rowLidDigits))
        ) {
          memberIdsToDelete.add(row.id);
        }
      }

      if (memberIdsToDelete.size > 0) {
        await db('group_members')
          .where('group_id', msg.chat)
          .whereIn('id', [...memberIdsToDelete])
          .delete();
      }

      const directJids = [...kickedIdentifiers].filter((id) =>
        id.includes('@')
      );
      if (directJids.length > 0) {
        await db('group_members')
          .where('group_id', msg.chat)
          .where((qb) => {
            qb.whereIn('user_lid', directJids).orWhereIn('user_pn', directJids);
          })
          .delete();
      }

      logger.info(
        '[KICK]',
        `Deleted group_members rows for ${kicked.length} participant(s) in group ${msg.chat}`
      );
    } catch (err) {
      logger.error(
        '[KICK]',
        `Failed to clean up kicked members from database: ${err.message}`
      );
    }

    // Invalidate cached group metadata
    try {
      await getGroupMetadata(client, msg.chat, true);
    } catch {}

    // 6. Send reply with mentions
    const mentions = [];
    const listLines = kicked.map((item, idx) => {
      const p = item.participant;
      const phoneDigits = p.phoneNumber
        ? p.phoneNumber.replace(/[^0-9]/g, '')
        : p.jid?.endsWith('@s.whatsapp.net')
          ? p.jid.replace(/[^0-9]/g, '')
          : null;

      let nameDisplay;
      if (phoneDigits) {
        const phoneJid = `${phoneDigits}@s.whatsapp.net`;
        nameDisplay = `@${phoneDigits}`;
        mentions.push(phoneJid);
      } else {
        nameDisplay = p.displayName || p.username || p.jid?.split('@')[0];
      }

      return `${idx + 1}. ${nameDisplay}`;
    });

    const replyText =
      kicked.length === 1 && msg.quoted
        ? `Berhasil mengeluarkan ${listLines[0]?.replace(/^1\.\s*/, '')}.`
        : [
            `*KICK SELESAI*`,
            `*Dikeluarkan:* ${kicked.length} member`,
            '',
            listLines.join('\n'),
          ].join('\n');

    if (msg.quoted && kicked.length === 1) {
      await msg.quoted.reply(replyText, {
        mentions: mentions.length > 0 ? [...new Set(mentions)] : undefined,
      });
    } else {
      await msg.reply(replyText, {
        mentions: mentions.length > 0 ? [...new Set(mentions)] : undefined,
      });
    }
  },
});
