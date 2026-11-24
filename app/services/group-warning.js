import db from '@nakiri/core/services/database';
import logger from '@nakiri/core/utils/logger';
import { DateTime } from 'luxon';
import { composeWarningMessage } from '#app/services/ai/group.js';
import { getContextInfo, toUserJid } from 'zapo-js';

/**
 * Match a group participant record against a target JID or raw number.
 *
 * @param {any} part
 * @param {string} target
 * @returns {boolean}
 */
export function isParticipantMatch(part, target) {
  if (!part || !target) return false;
  if (part.jid === target || part.lid === target) return true;

  const targetDigits = String(target).replace(/[^0-9]/g, '');
  if (!targetDigits) return false;

  const partPhoneDigits = part.phoneNumber
    ? String(part.phoneNumber).replace(/[^0-9]/g, '')
    : '';
  const partJidDigits = part.jid ? part.jid.replace(/[^0-9]/g, '') : '';
  const partLidDigits = part.lid ? part.lid.replace(/[^0-9]/g, '') : '';

  return (
    partPhoneDigits === targetDigits ||
    partJidDigits === targetDigits ||
    partLidDigits === targetDigits
  );
}

/**
 * Deduplicate and drop empty warning target candidates.
 *
 * @param {Array<string | null | undefined>} targets
 * @returns {string[]}
 */
function normalizeTargets(targets) {
  return Array.from(new Set((targets || []).filter(Boolean)));
}

/**
 * Convert a phone number or PN JID into a full `@s.whatsapp.net` JID.
 *
 * @param {string | null | undefined} value
 * @returns {string | null}
 */
function toPnJid(value) {
  if (!value) return null;
  const raw = String(value);
  if (raw.includes('@')) {
    return raw.endsWith('@s.whatsapp.net') ? raw : null;
  }
  return /^\d+$/.test(raw) ? `${raw}@s.whatsapp.net` : null;
}

/**
 * Resolve or create the database record for the warned member.
 *
 * @param {string} groupId
 * @param {string[]} candidates
 * @param {any} [participant]
 * @returns {Promise<Record<string, any> | null>}
 */
async function resolveGroupMember(groupId, candidates, participant = null) {
  const fullLid = candidates.find((c) => c?.endsWith('@lid')) || null;
  const fullPn = candidates.find((c) => c?.endsWith('@s.whatsapp.net')) || null;
  const rawTarget = candidates.find((c) => c && !c.includes('@')) || null;

  const userLid = participant?.lid || fullLid || null;
  const userPn =
    toPnJid(participant?.phoneNumber) ||
    toPnJid(participant?.jid) ||
    fullPn ||
    (!userLid ? toPnJid(rawTarget) : null);

  const queryCandidates = normalizeTargets([...candidates, userLid, userPn]);

  const matchQuery = () =>
    db('group_members')
      .where('group_id', groupId)
      .where((qb) => {
        for (const cand of queryCandidates) {
          qb.orWhere('user_lid', cand).orWhere('user_pn', cand);
        }
      });

  let member = await matchQuery().first();

  if (!member) {
    try {
      const [insertedId] = await db('group_members').insert({
        group_id: groupId,
        user_lid: userLid,
        user_pn: userPn,
      });
      member = await db('group_members').where({ id: insertedId }).first();
    } catch {
      member = await matchQuery().first();
    }
  } else {
    const updates = {};

    if (!member.user_pn && userPn) {
      updates.user_pn = userPn;
    }
    if (!member.user_lid && userLid) {
      updates.user_lid = userLid;
    }
    if (Object.keys(updates).length > 0) {
      await db('group_members').where({ id: member.id }).update(updates);
      Object.assign(member, updates);
    }
  }

  return member || null;
}

/**
 * Revoke the offending message (quoted or current).
 *
 * @param {any} client
 * @param {any} msg
 * @param {any} payload
 * @param {{ quoted?: boolean, candidates: string[], logTag: string }} options
 */
async function revokeMessage(client, msg, payload, options) {
  const { quoted = false, candidates, logTag } = options;
  if (!client?.message || typeof client.message.send !== 'function') return;

  try {
    if (quoted) {
      if (!msg.quoted) return;

      const raw = payload?.message || payload;
      const contextInfo = getContextInfo(raw);
      const participant =
        (contextInfo?.participant
          ? toUserJid(contextInfo.participant)
          : null) ||
        msg.quoted.sender?.id ||
        msg.quoted.sender?.pn ||
        msg.quoted.sender?.lid ||
        candidates[0];

      if (!msg.quoted.stanzaId) return;

      await client.message.send(msg.chat, {
        type: 'revoke',
        target: {
          remoteJid: msg.chat,
          id: msg.quoted.stanzaId,
          fromMe: Boolean(msg.quoted.flags?.fromMe),
          participant,
        },
      });
      return;
    }

    const rawKey = payload?.key;
    if (!rawKey?.id) return;

    await client.message.send(msg.chat, {
      type: 'revoke',
      target: {
        remoteJid: rawKey.remoteJid || msg.chat,
        id: rawKey.id,
        fromMe: false,
        participant: rawKey.participant || msg.sender?.id || candidates[0],
      },
    });
  } catch (err) {
    logger.error(logTag, `Failed to delete message: ${err.message}`);
  }
}

/**
 * Remove a participant, trying the primary identity then the fallback LID.
 *
 * @param {any} client
 * @param {string} groupJid
 * @param {string[]} jids
 * @param {string} logTag
 * @returns {Promise<string | null>} The JID that was removed, if any
 */
async function removeParticipant(client, groupJid, jids, logTag) {
  for (const jid of normalizeTargets(jids)) {
    try {
      const results = await client.group.removeParticipants(groupJid, [jid]);
      const res = results?.[0];
      if (!res || res.status === 'ok' || res.code === 200 || res.code === 409) {
        return jid;
      }
      logger.warn(
        logTag,
        `Failed to remove participant ${jid}: status=${res.status}, code=${res.code}`
      );
    } catch (err) {
      logger.error(
        logTag,
        `Exception while removing participant ${jid}: ${err.message}`
      );
    }
  }
  return null;
}

/**
 * Apply a warning to a group member: optionally delete the offending message,
 * increment the warning counter, and kick the member when maxWarn is reached.
 *
 * @param {object} options
 * @param {any} options.client
 * @param {any} options.msg - Parsed message
 * @param {any} [options.payload] - Native payload (used to revoke messages)
 * @param {any} options.tableGroup
 * @param {any} [options.member] - Preloaded member record (skips lookup/upsert)
 * @param {any} [options.participant] - Group metadata participant record
 * @param {Array<string | null | undefined>} [options.targets] - Target identity candidates
 * @param {string} [options.reason] - Optional violation reason appended to warnings
 * @param {'current' | 'quoted' | null} [options.deleteMessage] - Message to revoke
 * @param {'current' | 'quoted'} [options.replyTo='current'] - Message to reply to
 * @param {string} [options.logTag='[WARN]']
 * @returns {Promise<{ currentWarn: number, maxWarn: number, kicked: boolean } | null>}
 */
export async function applyGroupWarning({
  client,
  msg,
  payload,
  tableGroup,
  member = null,
  participant = null,
  targets = null,
  reason = null,
  deleteMessage = null,
  replyTo = 'current',
  logTag = '[WARN]',
}) {
  if (!msg || !tableGroup?.id) return null;

  const candidates = normalizeTargets(
    targets?.length > 0
      ? targets
      : [msg.sender?.pn, msg.sender?.lid, msg.sender?.id]
  );
  if (candidates.length === 0) return null;

  const targetMember =
    member ||
    (await resolveGroupMember(tableGroup.id, candidates, participant));
  if (!targetMember?.id) return null;

  if (deleteMessage) {
    await revokeMessage(client, msg, payload, {
      quoted: deleteMessage === 'quoted',
      candidates,
      logTag,
    });
  }

  const maxWarn = Number(tableGroup.settings?.maxWarn ?? 3);
  const currentWarn = Number(targetMember.warnings ?? 0) + 1;
  const reasonLine = reason ? `\n> ${reason}` : '';
  const reasonInline = reason ? ` - ${reason}` : '';

  const mentionJid =
    participant?.jid ||
    targetMember.user_pn ||
    targetMember.user_lid ||
    participant?.lid ||
    toPnJid(candidates[0]) ||
    candidates[0];
  const targetNum = String(mentionJid || '').split('@')[0].split(':')[0];
  const targetTag = targetNum ? `@${targetNum}` : null;

  const sendReply = (text) => {
    const options = mentionJid
      ? { mentions: [mentionJid], autoMention: false }
      : undefined;
    if (replyTo === 'quoted' && typeof msg.quoted?.reply === 'function') {
      return msg.quoted.reply(text, options);
    }
    return msg.reply(text, options);
  };

  const useAi = Boolean(tableGroup.settings?.warnAi);
  const formatReply = async ({ kicked = false, kickFailed = false, fallbackText }) => {
    if (!useAi) return fallbackText;
    return composeWarningMessage({
      currentWarn,
      maxWarn,
      kicked,
      kickFailed,
      reason,
      targetTag,
      fallbackText,
    });
  };

  if (currentWarn >= maxWarn) {
    const kickJids = [
      participant?.jid,
      targetMember.user_pn,
      candidates[0],
      participant?.lid,
      targetMember.user_lid,
    ];

    const kickedJid = await removeParticipant(
      client,
      msg.chat,
      kickJids,
      logTag
    );

    if (kickedJid) {
      await db('group_members').where({ id: targetMember.id }).delete();
      logger.info(
        logTag,
        `Member ${kickedJid} removed from group ${msg.chat} after reaching max warnings.`
      );
      const text = await formatReply({
        kicked: true,
        fallbackText: `Dikeluarkan karena telah mencapai batas peringatan (${currentWarn}/${maxWarn})${reason ? '' : '.'}${reasonLine}`,
      });
      await sendReply(text);
      return { currentWarn, maxWarn, kicked: true };
    }

    const now = DateTime.utc().toSQL({ includeOffset: false });
    await db('group_members')
      .where({ id: targetMember.id })
      .update({ warnings: currentWarn, last_warned_at: now });
    targetMember.last_warned_at = now;

    const text = await formatReply({
      kickFailed: true,
      fallbackText: `Telah mencapai batas peringatan (${currentWarn}/${maxWarn})${reasonInline}, tetapi gagal mengeluarkan member dari grup.`,
    });
    await sendReply(text);
    return { currentWarn, maxWarn, kicked: false };
  }

  const now = DateTime.utc().toSQL({ includeOffset: false });
  await db('group_members')
    .where({ id: targetMember.id })
    .update({ warnings: currentWarn, last_warned_at: now });
  targetMember.last_warned_at = now;

  const text = await formatReply({
    fallbackText: `Mendapatkan peringatan ke-${currentWarn}/${maxWarn}${reasonLine}`,
  });
  await sendReply(text);
  return { currentWarn, maxWarn, kicked: false };
}
