/**
 * Resolve the session id for a note skill call.
 *
 * @param {any} ctx
 * @returns {string | null}
 */
export function getNoteSkillSession(ctx) {
  return ctx?.sessionId || process.env.SESSION_ID || null;
}

/**
 * @param {any} msg
 * @returns {boolean}
 */
export function isGroupAdmin(msg) {
  return Boolean(
    msg?.permissions?.sender?.admin ||
      msg?.permissions?.sender?.superAdmin ||
      msg?.permissions?.sender?.isOwner
  );
}

/**
 * Validate a scope for read, list, or delete operations.
 *
 * @param {string} scope
 * @param {any} msg
 * @returns {{ scope: 'personal' | 'group', error?: never } | { scope?: never, error: string }}
 */
export function validateNoteReadScope(scope, msg) {
  const normalized = String(scope || '').toLowerCase();

  if (normalized !== 'personal' && normalized !== 'group') {
    return { error: 'Scope must be "personal" or "group".' };
  }

  if (normalized === 'personal' && msg?.flags?.isGroup) {
    return { error: 'Personal notes are only available in a private chat.' };
  }

  if (normalized === 'group' && !msg?.flags?.isGroup) {
    return { error: 'Group notes are only available in their group.' };
  }

  return { scope: normalized };
}

/**
 * Extract plain text from a replied message.
 *
 * @param {any} msg
 * @returns {string}
 */
export function quotedNoteText(msg) {
  return String(msg?.quoted?.body?.rawText || '').trim();
}
