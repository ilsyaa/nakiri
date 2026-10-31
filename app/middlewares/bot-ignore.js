import { parseMessage } from '#app/services/bot/message.js';

/**
 * Filter unwanted messages (broadcasts, newsletters, system stubs)
 * and parse native payload into ctx.msg.
 *
 * @type {import('@nakiri/core/services/modules').EventMiddleware<'message'>}
 */
export default async function ignoreMiddleware(payload, ctx) {
  const key = payload?.key;
  const remoteJid = key?.remoteJid;

  if (!payload || !key || !remoteJid) {
    return ctx.stop();
  }

  if (key.isBroadcast || key.isNewsletter) {
    return ctx.stop();
  }

  if (remoteJid === '0@s.whatsapp.net') {
    return ctx.stop();
  }

  if (!payload.message) {
    return ctx.stop();
  }

  if (
    payload.message?.senderKeyDistributionMessage &&
    Object.keys(payload.message).length === 1
  ) {
    return ctx.stop();
  }

  const parsed = await parseMessage(payload, ctx.client, ctx.tableBot);
  if (!parsed) {
    return ctx.stop();
  }

  ctx.msg = parsed;
}
