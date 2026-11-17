/**
 * Resolve the bot's actual authority and the group's enforced policy.
 *
 * @param {object} options
 * @param {any} options.msg
 * @param {any} [options.tableGroup]
 * @param {any} [options.metadata]
 * @returns {{
 *   groupName: string,
 *   botIsAdmin: boolean,
 *   botRole: 'admin' | 'member',
 *   maxWarn: number,
 *   botAccess: string,
 *   blockedWords: number,
 *   welcome: boolean,
 *   goodbye: boolean,
 *   description: string,
 *   descriptionIsLinkOnly: boolean,
 *   hasWrittenRules: boolean
 * } | null}
 */
export function resolveGroupAuthority({ msg, tableGroup, metadata }) {
  if (!msg?.flags?.isGroup) return null;

  const settings = tableGroup?.settings || {};
  const description = String(metadata?.desc || '').trim();
  const descriptionIsLinkOnly =
    Boolean(description) && /^https?:\/\/\S+$/i.test(description);
  const botIsAdmin = Boolean(
    msg.permissions?.bot?.admin || msg.permissions?.bot?.superAdmin
  );

  return {
    groupName: metadata?.subject || 'unknown',
    botIsAdmin,
    botRole: botIsAdmin ? 'admin' : 'member',
    maxWarn: Number(settings.maxWarn ?? 3),
    botAccess: settings.botAccess === 'admin' ? 'admin only' : 'everyone',
    blockedWords: Array.isArray(settings.blockedWords)
      ? settings.blockedWords.length
      : 0,
    welcome: Boolean(settings.welcome),
    goodbye: Boolean(settings.goodbye),
    description,
    descriptionIsLinkOnly,
    hasWrittenRules: Boolean(description) && !descriptionIsLinkOnly,
  };
}

/**
 * Build a compact tool-friendly authority summary.
 *
 * @param {NonNullable<ReturnType<typeof resolveGroupAuthority>>} authority
 * @returns {string}
 */
export function formatGroupAuthoritySummary(authority) {
  const rules = authority.hasWrittenRules
    ? authority.description.slice(0, 200)
    : authority.descriptionIsLinkOnly
      ? 'none; description is only a link'
      : 'none';

  return [
    `admin: ${authority.botIsAdmin}`,
    `maxWarn: ${authority.maxWarn}`,
    `botAccess: ${authority.botAccess}`,
    `filterPatterns: ${authority.blockedWords}`,
    `welcome: ${authority.welcome}`,
    `goodbye: ${authority.goodbye}`,
    `writtenRules: ${rules}`,
  ].join('\n');
}

export default {
  resolveGroupAuthority,
  formatGroupAuthoritySummary,
};
