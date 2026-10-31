/**
 * Group bot access mode guard middleware.
 * Enforces group botAccess policy ('everyone' vs 'admin').
 *
 * @type {import('@nakiri/core/services/modules').EventMiddleware<'message'>}
 */
export default async function groupModeMiddleware(payload, ctx) {
  const msg = ctx.msg;
  const group = ctx.tableGroup;

  if (!msg?.flags?.isGroup || !group?.settings) return;

  const botAccess = group.settings.botAccess || 'everyone';
  if (botAccess === 'admin') {
    const hasAdminAccess = Boolean(
      msg.permissions?.sender?.admin ||
      msg.permissions?.sender?.superAdmin ||
      msg.permissions?.sender?.isOwner
    );

    if (!hasAdminAccess) {
      return ctx.stop();
    }
  }
}

