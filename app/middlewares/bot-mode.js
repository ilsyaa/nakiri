/**
 * Bot operating mode guard middleware.
 * If bot is set to self mode, only messages from owners are processed.
 *
 * @type {import('@nakiri/core/services/modules').EventMiddleware<'message'>}
 */
export default async function botModeMiddleware(payload, ctx) {
  const isSelfMode = Boolean(ctx.tableBot?.self);

  if (isSelfMode) {
    const isOwner = Boolean(ctx.msg?.permissions?.sender?.isOwner);
    if (!isOwner) {
      return ctx.stop();
    }
  }
}

