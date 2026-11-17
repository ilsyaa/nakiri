import db from '@nakiri/core/services/database';
import { DateTime } from 'luxon';
import { defineSkill } from '#app/services/ai/skill.js';
import { extractMentionsFromText } from '#app/services/bot/index.js';
import { normalizeIdentity } from '#app/utils/target.js';

/**
 * Format a database timestamp for a member summary.
 *
 * @param {string | Date | null | undefined} value
 * @returns {string}
 */
function relativeTime(value) {
  if (!value) return 'never';
  const dt =
    value instanceof Date
      ? DateTime.fromJSDate(value, { zone: 'utc' })
      : DateTime.fromSQL(String(value), { zone: 'utc' });
  if (!dt.isValid) return 'never';
  return dt.setLocale('id').toRelative() || dt.toFormat('dd LLL yyyy');
}

/**
 * Find a group member record by resolved identities.
 *
 * @param {string} groupId
 * @param {any} target
 * @returns {Promise<Record<string, any> | null>}
 */
async function findMember(groupId, target) {
  if (!groupId || !target) return null;

  const candidates = new Set();
  for (const value of [target.pn, target.lid, ...(target.jids || [])]) {
    if (!value) continue;
    candidates.add(value);
    if (String(value).includes('@')) {
      candidates.add(String(value).split('@')[0]);
    } else {
      candidates.add(`${value}@s.whatsapp.net`);
      candidates.add(`${value}@lid`);
    }
  }

  if (candidates.size === 0) return null;

  return db('group_members')
    .where('group_id', groupId)
    .where((builder) => {
      builder
        .whereIn('user_pn', [...candidates])
        .orWhereIn('user_lid', [...candidates]);
    })
    .first();
}

export default defineSkill({
  name: 'get_member_info',
  description:
    'Read a group member record: warnings, score, last warned, and last activity. Use when the user asks about their own record or, for admins, another replied/mentioned member.',
  parameters: {
    type: 'object',
    properties: {
      target: {
        type: 'string',
        enum: ['self', 'replied', 'mentioned'],
        description:
          'Whose record to read. Defaults to self. Use replied for the quoted message sender, mentioned for the first tagged member.',
      },
    },
  },
  async execute(args, context) {
    const { msg, ctx } = context || {};
    if (!msg?.flags?.isGroup) {
      return 'This is not a group chat.';
    }

    const tableGroup = ctx?.tableGroup;
    const groupId = tableGroup?.id || msg.chat;
    const senderIsAdmin = Boolean(
      msg.permissions?.sender?.admin ||
      msg.permissions?.sender?.superAdmin ||
      msg.permissions?.sender?.isOwner
    );
    const mode = args?.target || 'self';

    if (mode !== 'self' && !senderIsAdmin) {
      return 'Only group admins can read another member record.';
    }

    let member = null;
    let targetLabel = 'you';

    if (mode === 'self') {
      member = ctx?.tableGroupMember || null;
      if (!member) {
        member = await findMember(groupId, {
          pn: msg.sender?.pn,
          lid: msg.sender?.lid,
          jids: [msg.sender?.id].filter(Boolean),
        });
      }
    } else {
      let target = null;

      if (mode === 'replied') {
        const quotedSender = msg.quoted?.sender;
        if (!quotedSender) {
          return 'No quoted message was found.';
        }
        target = {
          pn: quotedSender.pn || null,
          lid: quotedSender.lid || null,
          jids: [quotedSender.id, quotedSender.pn, quotedSender.lid].filter(
            Boolean
          ),
        };
      } else {
        const mention =
          msg.body?.mentionedJid?.[0] ||
          extractMentionsFromText(msg.body?.rawText || '')[0];
        if (!mention) {
          return 'No mentioned member was found.';
        }
        const identity = normalizeIdentity(mention);
        target = {
          pn: identity && !identity.isLid ? identity.id : null,
          lid: identity?.isLid ? identity.id : null,
          jids: [mention],
        };
      }

      member = await findMember(groupId, target);
      targetLabel =
        member?.pushname ||
        target.pn?.split('@')[0] ||
        target.lid?.split('@')[0] ||
        'that member';
    }

    if (!member) {
      return `No stored record was found for ${targetLabel}.`;
    }

    const maxWarn = Number(tableGroup?.settings?.maxWarn ?? 3);
    const name = member.pushname || targetLabel;
    return [
      `Member: ${name}`,
      `Warnings: ${Number(member.warnings || 0)}/${maxWarn}`,
      `Score: ${Number(member.score || 0)}`,
      `Last warned: ${relativeTime(member.last_warned_at)}`,
      `Last active: ${relativeTime(member.last_interacted_at)}`,
    ].join('\n');
  },
});
