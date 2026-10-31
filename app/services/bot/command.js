/**
 * Default guard rejection messages (concise, to-the-point)
 */
export const DEFAULT_GUARD_MESSAGES = {
  ownerOnly: 'Only Owner!',
  adminOnly: 'Only Admin!',
  superAdminOnly: 'Only Super Admin!',
  botAdminOnly: 'Bot is not Admin!',
  groupOnly: 'Only in Group!',
  privateOnly: 'Only in Private Chat!',
  quotedOnly: 'Reply a message!',
  mediaOnly: 'Media required!',
};

/**
 * Define a bot command definition with autocomplete and type checking
 * @param {import('./types.js').CommandDefinition} def
 * @returns {import('./types.js').CommandDefinition}
 */
export function defineCommand(def) {
  return def;
}

/**
 * Normalize command candidates into an array of lowercase strings
 * @param {string | string[] | Record<string, any>} options
 * @returns {string[]}
 */
function normalizeCommands(options) {
  if (!options) return [];
  if (typeof options === 'string') {
    return [options.trim().toLowerCase()].filter(Boolean);
  }
  if (Array.isArray(options)) {
    return options
      .map((c) => (typeof c === 'string' ? c.trim().toLowerCase() : ''))
      .filter(Boolean);
  }
  if (typeof options === 'object') {
    const raw = options.command ?? options.name ?? [];
    return normalizeCommands(raw);
  }
  return [];
}

/**
 * Check if an incoming parsed message matches a command specification
 *
 * @param {any} msg - ParsedMessage object from parseMessage()
 * @param {string | string[] | { command?: string | string[], prefix?: boolean | 'optional' }} options - Command name(s) or options
 * @param {boolean | 'optional'} [prefixMode=true] - Prefix mode if options is string/array: true (requires prefix), false (no-prefix), 'optional' (either)
 * @returns {boolean}
 */
export function isCommand(msg, options, prefixMode = true) {
  if (!msg?.body) return false;

  const commands = normalizeCommands(options);
  if (commands.length === 0) return false;

  let prefixRule = prefixMode;
  if (
    typeof options === 'object' &&
    !Array.isArray(options) &&
    options !== null
  ) {
    if (options.prefix !== undefined) {
      prefixRule = options.prefix;
    }
  }

  const incomingCmd = msg.body.commandWithoutPrefix?.toLowerCase() || '';
  if (!incomingCmd || !commands.includes(incomingCmd)) {
    return false;
  }

  const hasPrefix = Boolean(msg.body.prefix);

  if (prefixRule === true && !hasPrefix) {
    return false;
  }

  if (prefixRule === false && hasPrefix) {
    return false;
  }

  // prefixRule === 'optional' accepts both with and without prefix
  return true;
}

/**
 * Validate a command against message content, prefix rule, and permission guards
 *
 * @param {any} msg - ParsedMessage object from parseMessage()
 * @param {object} options
 * @param {string | string[]} [options.command] - Single command name or array of aliases
 * @param {boolean | 'optional'} [options.prefix=true] - Prefix rule: true (must have prefix), false (no-prefix), 'optional' (both allowed)
 * @param {boolean} [options.ownerOnly] - Requires sender to be bot owner
 * @param {boolean} [options.adminOnly] - Requires sender to be group admin
 * @param {boolean} [options.superAdminOnly] - Requires sender to be group superadmin/creator
 * @param {boolean} [options.botAdminOnly] - Requires bot to be group admin
 * @param {boolean} [options.groupOnly] - Command only allowed in groups
 * @param {boolean} [options.privateOnly] - Command only allowed in private 1:1 chat
 * @param {boolean} [options.quotedOnly] - Command requires a quoted message
 * @param {boolean | string[]} [options.mediaOnly] - Requires media in message or quoted message
 * @param {boolean} [options.autoReply=true] - Auto-reply error message if a guard fails after matching command
 * @param {Record<string, string>} [options.messages] - Custom guard rejection messages
 * @returns {Promise<{ isValid: boolean, matched: boolean, reason?: string, command?: string, prefix?: string, args?: string[], argsText?: string }>}
 */
export async function validateCommand(msg, options = {}) {
  const matched = isCommand(msg, options);
  if (!matched) {
    return {
      isValid: false,
      matched: false,
    };
  }

  const sendAutoReply = options.autoReply !== false;
  const customMessages = options.messages || {};

  /**
   * Helper to reject with standard or custom error message
   * @param {string} reason
   */
  async function rejectGuard(reason) {
    if (sendAutoReply && typeof msg?.reply === 'function') {
      const text = customMessages[reason] || DEFAULT_GUARD_MESSAGES[reason];
      if (text) {
        try {
          await msg.reply(text);
        } catch {}
      }
    }
    return {
      isValid: false,
      matched: true,
      reason,
      command: msg.body.commandWithoutPrefix,
      prefix: msg.body.prefix,
      args: msg.body.args,
      argsText: msg.body.argsText,
    };
  }

  // Guard: groupOnly
  if (options.groupOnly && !msg.flags?.isGroup) {
    return rejectGuard('groupOnly');
  }

  // Guard: privateOnly
  if (options.privateOnly && msg.flags?.isGroup) {
    return rejectGuard('privateOnly');
  }

  // Guard: ownerOnly
  if (options.ownerOnly && !msg.permissions?.sender?.isOwner) {
    return rejectGuard('ownerOnly');
  }

  // Guard: adminOnly
  if (options.adminOnly && !msg.permissions?.sender?.admin) {
    return rejectGuard('adminOnly');
  }

  // Guard: superAdminOnly
  if (options.superAdminOnly && !msg.permissions?.sender?.superAdmin) {
    return rejectGuard('superAdminOnly');
  }

  // Guard: botAdminOnly
  if (options.botAdminOnly && !msg.permissions?.bot?.admin) {
    return rejectGuard('botAdminOnly');
  }

  // Guard: quotedOnly
  if (options.quotedOnly && !msg.quoted) {
    return rejectGuard('quotedOnly');
  }

  // Guard: mediaOnly
  if (options.mediaOnly) {
    const hasMedia = Boolean(msg.flags?.isMedia || msg.quoted?.flags?.isMedia);

    if (!hasMedia) {
      return rejectGuard('mediaOnly');
    }

    if (Array.isArray(options.mediaOnly) && options.mediaOnly.length > 0) {
      const matchesMediaKind = options.mediaOnly.some((kind) => {
        const flagKey = `is${kind.charAt(0).toUpperCase()}${kind.slice(1)}`;
        return Boolean(msg.flags?.[flagKey] || msg.quoted?.flags?.[flagKey]);
      });
      if (!matchesMediaKind) {
        return rejectGuard('mediaOnly');
      }
    }
  }

  return {
    isValid: true,
    matched: true,
    command: msg.body.commandWithoutPrefix,
    prefix: msg.body.prefix,
    args: msg.body.args,
    argsText: msg.body.argsText,
  };
}

export default {
  defineCommand,
  isCommand,
  validateCommand,
  DEFAULT_GUARD_MESSAGES,
};
