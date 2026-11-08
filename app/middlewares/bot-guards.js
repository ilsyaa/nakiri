/**
 * Standard command middleware guards for Nakiri bot.
 */

/**
 * Parameterized sender permission guard.
 *
 * Example usage in command definitions:
 * - `middlewares: ['sender:isOwner']`
 * - `middlewares: ['sender:admin,superAdmin']`
 * - `middlewares: ['sender:admin,superAdmin,isOwner']`
 *
 * @type {import('#app/services/bot/types.js').CommandMiddlewareHandler}
 */
export async function senderGuard(payload, ctx, args = []) {
  const senderPerms = ctx.msg?.permissions?.sender;
  if (!senderPerms) return false;

  const requiredRoles = args.length > 0 ? args : ['admin'];

  const hasAccess = requiredRoles.some((role) => {
    switch (role.toLowerCase()) {
      case 'isowner':
      case 'owner':
        return Boolean(senderPerms.isOwner);
      case 'admin':
        return Boolean(senderPerms.admin || senderPerms.superAdmin);
      case 'superadmin':
        return Boolean(senderPerms.superAdmin);
      default:
        return Boolean(/** @type {Record<string, any>} */ (senderPerms)[role]);
    }
  });

  if (!hasAccess) {
    const isOnlyOwner =
      requiredRoles.length === 1 &&
      (requiredRoles[0].toLowerCase() === 'isowner' ||
        requiredRoles[0].toLowerCase() === 'owner');

    const rejection = isOnlyOwner ? 'Only Owner!' : 'Only Admin!';
    if (typeof ctx.msg?.reply === 'function') {
      try {
        // await ctx.msg.reply(rejection);
      } catch {}
    }
    return false;
  }

  return true;
}

/**
 * Parameterized bot permission guard.
 *
 * Example usage in command definitions:
 * - `middlewares: ['bot:admin']`
 *
 * @type {import('#app/services/bot/types.js').CommandMiddlewareHandler}
 */
export async function botGuard(payload, ctx, args = []) {
  const botPerms = ctx.msg?.permissions?.bot;
  if (!botPerms) return false;

  const requiredRoles = args.length > 0 ? args : ['admin'];

  const hasAccess = requiredRoles.some((role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return Boolean(botPerms.admin || botPerms.superAdmin);
      case 'superadmin':
        return Boolean(botPerms.superAdmin);
      default:
        return Boolean(/** @type {Record<string, any>} */ (botPerms)[role]);
    }
  });

  if (!hasAccess) {
    if (typeof ctx.msg?.reply === 'function') {
      try {
        await ctx.msg.reply('Bot is not Admin!');
      } catch {}
    }
    return false;
  }

  return true;
}

/**
 * Group-only guard middleware.
 * Rejects commands executed outside group chats.
 *
 * Example usage in command definitions:
 * - `middlewares: ['group']`
 *
 * @type {import('#app/services/bot/types.js').CommandMiddlewareHandler}
 */
export async function groupOnlyGuard(payload, ctx) {
  if (!ctx.msg?.flags?.isGroup) {
    if (typeof ctx.msg?.reply === 'function') {
      try {
        await ctx.msg.reply('Only in Group!');
      } catch {}
    }
    return false;
  }

  return true;
}

/**
 * Private-chat-only guard middleware.
 * Rejects commands executed inside group chats.
 *
 * Example usage in command definitions:
 * - `middlewares: ['private']`
 *
 * @type {import('#app/services/bot/types.js').CommandMiddlewareHandler}
 */
export async function privateOnlyGuard(payload, ctx) {
  if (ctx.msg?.flags?.isGroup) {
    if (typeof ctx.msg?.reply === 'function') {
      try {
        await ctx.msg.reply('Only in Private Chat!');
      } catch {}
    }
    return false;
  }

  return true;
}

export default {
  sender: senderGuard,
  bot: botGuard,
  group: groupOnlyGuard,
  private: privateOnlyGuard,
};
