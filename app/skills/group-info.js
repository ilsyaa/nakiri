import { defineSkill } from '#app/services/ai/skill.js';
import {
  formatGroupAuthoritySummary,
  resolveGroupAuthority,
} from '#app/services/ai/group-authority.js';
import { getGroupMetadata } from '#app/services/bot/index.js';

/**
 * Format a group participant for a compact admin list.
 *
 * @param {any} participant
 * @returns {string}
 */
function participantLabel(participant) {
  const name = (participant?.displayName || participant?.username || '').trim();
  if (name) return name;

  const raw = participant?.phoneNumber || participant?.jid || participant?.lid;
  if (!raw) return 'unknown';
  return `@${String(raw).split('@')[0]}`;
}

export default defineSkill({
  name: 'get_group_info',
  description:
    'Get read-only information about the current WhatsApp group: subject, member count, admins, description, bot access, and max warnings. Use when the user asks about the group itself.',
  parameters: {
    type: 'object',
    properties: {},
  },
  async execute(args, context) {
    const { client, msg, ctx } = context || {};
    if (!msg || !msg.flags?.isGroup) {
      return 'This is not a group chat.';
    }

    const metadata = await getGroupMetadata(client, msg.chat).catch(() => null);
    const participants = metadata?.participants || [];
    const admins = participants.filter(
      (participant) => participant.isAdmin || participant.isSuperAdmin
    );
    const authority = resolveGroupAuthority({
      msg,
      tableGroup: ctx?.tableGroup,
      metadata,
    });

    const lines = [
      `Group: ${metadata?.subject || 'unknown'}`,
      `Members: ${participants.length}`,
      `Admins: ${
        admins.length > 0
          ? admins.slice(0, 10).map(participantLabel).join(', ')
          : 'none'
      }`,
    ];

    const description = String(metadata?.desc || '').trim();
    if (description) {
      lines.push(`Description: ${description.slice(0, 200)}`);
    }

    if (authority) {
      lines.push('', formatGroupAuthoritySummary(authority));
    }

    return lines.join('\n');
  },
});
