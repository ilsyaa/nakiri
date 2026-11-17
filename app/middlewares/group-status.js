import { applyGroupWarning } from '#app/services/group-warning.js';

/**
 * Warns members who mention the group status (story) in a message.
 * Deletes the offending message, increments the warning counter, and kicks
 * the member once maxWarn is reached.
 *
 * @type {import('@nakiri/core/services/modules').EventMiddleware<'message'>}
 */
export default async function groupStatusMiddleware(payload, ctx) {
  const { client, msg, tableGroup, tableGroupMember } = ctx;

  if (!msg?.flags?.isGroup || !tableGroup?.settings) return;

  if (msg.body.mtype === 'groupStatusMentionMessage') {
    if (msg.flags.fromMe) return;

    const permissions = msg.permissions;
    if (
      permissions?.sender?.isOwner ||
      permissions?.sender?.admin ||
      permissions?.sender?.superAdmin
    ) {
      return;
    }

    if (!permissions?.bot?.admin && !permissions?.bot?.superAdmin) return;

    await applyGroupWarning({
      client,
      msg,
      payload,
      tableGroup,
      member: tableGroupMember,
      targets: [
        tableGroupMember?.user_pn,
        tableGroupMember?.user_lid,
        msg.sender?.pn,
        msg.sender?.lid,
        msg.sender?.id,
      ],
      reason: 'dilarang mention status group',
      deleteMessage: 'current',
      replyTo: 'current',
      logTag: '[MODERATION]',
    });

    return ctx.stop();
  }
}
