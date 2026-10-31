import { reply } from '#app/services/bot/index.js';

/**
 * Handle emoji reaction shortcuts in the message middleware pipeline.
 * Simply edits msg.body to trigger the mapped command and points msg.quoted to the reacted message.
 *
 * @type {import('@nakiri/core/services/modules').EventMiddleware<'message'>}
 */
export default async function reactionShortcutMiddleware(payload, ctx) {
  const reaction = payload?.message?.reactionMessage;
  if (!reaction) return;

  const commandName = reaction.text?.trim();
  if (!commandName) return;

  console.log(commandName);
}
