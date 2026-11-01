/**
 * Scoped event middlewares configuration.
 *
 * Scoped middlewares execute in declaration order when a native WhatsApp event occurs.
 *
 * @type {import('@nakiri/core/services/modules').EventMiddlewaresConfig}
 */
export const eventMiddlewares = {
  message: [
    () => import('#app/middlewares/bot-table.js'),
    () => import('#app/middlewares/bot-ignore.js'),
    () => import('#app/middlewares/bot-mode.js'),
    () => import('#app/middlewares/bot-shortcut.js'),
    () => import('#app/middlewares/group-table.js'),
    () => import('#app/middlewares/group-score.js'),
    () => import('#app/middlewares/group-mode.js'),
    () => import('#app/middlewares/group-blockwords.js'),
  ],
};

/**
 * Custom command middleware aliases for command definitions.
 *
 * @type {import('#app/services/bot/types.js').MiddlewareAliasesConfig}
 */
export const middlewareAliases = {
  sender: () =>
    import('#app/middlewares/bot-guards.js').then((m) => m.senderGuard),
  bot: () => import('#app/middlewares/bot-guards.js').then((m) => m.botGuard),
  group: () =>
    import('#app/middlewares/bot-guards.js').then((m) => m.groupOnlyGuard),
  private: () =>
    import('#app/middlewares/bot-guards.js').then((m) => m.privateOnlyGuard),
};

export default {
  eventMiddlewares,
  middlewareAliases,
};
