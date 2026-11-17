/**
 * Group bot access mode guard middleware.
 * Enforces group botAccess policy ('everyone' vs 'admin').
 *
 * @type {import('@nakiri/core/services/modules').EventMiddleware<'message'>}
 */
export default async function groupStatusMiddleware(payload, ctx) {
  const msg = ctx.msg;
  const group = ctx.tableGroup;

  if (!msg?.flags?.isGroup || !group?.settings) return;

  if (msg.body.mtype === 'groupStatusMentionMessage') {
  }
}
