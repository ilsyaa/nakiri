import db from '@nakiri/core/services/database';
import { DateTime } from 'luxon';

export const NOTE_SCOPE_PERSONAL = 'personal';
export const NOTE_SCOPE_GROUP = 'group';

export const MAX_NOTE_NAME_LENGTH = 32;
export const MAX_NOTE_CONTENT_LENGTH = 4000;
export const MAX_PERSONAL_NOTES = 100;
export const MAX_GROUP_NOTES = 200;
export const MAX_NOTE_LIST = 50;
export const MAX_NOTE_SEARCH = 20;

const NOTE_SCOPES = new Set([NOTE_SCOPE_PERSONAL, NOTE_SCOPE_GROUP]);
const DEFAULT_TIMEZONE = 'Asia/Jakarta';

const RESERVED_NOTE_NAMES = new Set([
  'add',
  'del',
  'delete',
  'find',
  'get',
  'guide',
  'help',
  'list',
  'ls',
  'remove',
  'save',
  'search',
  'set',
  'show',
]);

/**
 * Normalize a raw phone/LID value into a full JID.
 *
 * @param {string | null | undefined} value
 * @param {string} domain
 * @returns {string | null}
 */
function toFullJid(value, domain) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  const [userPart, server] = raw.split('@');
  const user = userPart.split(':')[0];
  if (!user) return null;

  return `${user}@${server || domain}`;
}

/**
 * Resolve full JIDs for a note owner or author.
 *
 * @param {{ id?: string | null, pn?: string | null, lid?: string | null } | null | undefined} sender
 * @returns {{ jid: string | null, pn: string | null, lid: string | null, candidates: string[] }}
 */
export function resolveNoteSender(sender) {
  const pn =
    toFullJid(sender?.pn, 's.whatsapp.net') ||
    (sender?.id?.endsWith('@s.whatsapp.net')
      ? toFullJid(sender.id, 's.whatsapp.net')
      : null);
  const lid =
    toFullJid(sender?.lid, 'lid') ||
    (sender?.id?.endsWith('@lid') ? toFullJid(sender.id, 'lid') : null);
  const jid = pn || lid || toFullJid(sender?.id, 's.whatsapp.net');

  return {
    jid,
    pn,
    lid,
    candidates: Array.from(new Set([jid, pn, lid].filter(Boolean))),
  };
}

/**
 * Normalize a note name into lowercase hyphen/underscore form.
 *
 * @param {string | null | undefined} value
 * @returns {string}
 */
export function normalizeNoteName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '');
}

/**
 * Normalize note content without losing intentional line breaks.
 *
 * @param {string | null | undefined} value
 * @returns {string}
 */
function normalizeNoteContent(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .trim();
}

/**
 * @param {string} value
 * @returns {string}
 */
function toSqlDate(value) {
  return value.toUTC().toSQL({ includeOffset: false });
}

/**
 * @param {string | Date} value
 * @returns {DateTime}
 */
function parseDbDate(value) {
  if (value instanceof Date) {
    return DateTime.fromJSDate(value, { zone: 'utc' });
  }
  return DateTime.fromSQL(String(value), { zone: 'utc' });
}

/**
 * Format a note timestamp as a relative Indonesian time.
 *
 * @param {Record<string, any>} note
 * @param {string} [timezone]
 * @returns {string}
 */
export function formatNoteTime(note, timezone = DEFAULT_TIMEZONE) {
  const value = note?.updated_at;
  if (!value) return '-';

  const dt = parseDbDate(value).setZone(timezone);
  if (!dt.isValid) return '-';

  return dt.setLocale('id').toRelative() || '-';
}

/**
 * Shorten note content for list output.
 *
 * @param {string} content
 * @param {number} [maxLength=60]
 * @returns {string}
 */
export function formatNotePreview(content, maxLength = 60) {
  const text = String(content || '')
    .replace(/\s+/g, ' ')
    .trim();

  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

/**
 * @param {{ jid: string }} owner
 * @returns {string}
 */
function personalScopeKey(owner) {
  return `user:${owner.jid}`;
}

/**
 * @param {string} groupJid
 * @returns {string}
 */
function groupScopeKey(groupJid) {
  return `group:${groupJid}`;
}

/**
 * Add the personal ownership filter to a notes query.
 *
 * @param {import('knex').Knex.QueryBuilder} builder
 * @param {{ jid: string | null, pn: string | null, lid: string | null, candidates: string[] }} owner
 */
function scopeToOwner(builder, owner) {
  builder.where((inner) => {
    inner.where('scope_key', personalScopeKey(owner));

    if (owner.candidates.length > 0) {
      inner
        .orWhereIn('owner_pn', owner.candidates)
        .orWhereIn('owner_lid', owner.candidates);
    }
  });
}

/**
 * Build a query scoped to a personal owner or a group.
 *
 * @param {object} options
 * @param {string} options.sessionId
 * @param {string} options.scope
 * @param {string | null | undefined} options.groupJid
 * @param {{ jid: string | null, pn: string | null, lid: string | null, candidates: string[] }} options.owner
 * @returns {import('knex').Knex.QueryBuilder | null}
 */
function buildScopeQuery({ sessionId, scope, groupJid, owner }) {
  if (!NOTE_SCOPES.has(scope)) return null;

  const builder = db('notes').where({ session_id: sessionId, scope });

  if (scope === NOTE_SCOPE_GROUP) {
    if (!groupJid) return null;
    builder.where('scope_key', groupScopeKey(groupJid));
    return builder;
  }

  if (!owner?.jid) return null;
  scopeToOwner(builder, owner);
  return builder;
}

/**
 * Find one note in a scope.
 *
 * @param {object} options
 * @param {string} options.sessionId
 * @param {string} options.scope
 * @param {string | null | undefined} options.groupJid
 * @param {{ jid: string | null, pn: string | null, lid: string | null, candidates: string[] }} options.owner
 * @param {string} options.name
 * @returns {Promise<Record<string, any> | null>}
 */
async function findNote({ sessionId, scope, groupJid, owner, name }) {
  const builder = buildScopeQuery({ sessionId, scope, groupJid, owner });
  if (!builder || !name) return null;

  return builder.where('name', name).first();
}

/**
 * Count notes in a scope.
 *
 * @param {object} options
 * @param {string} options.sessionId
 * @param {string} options.scope
 * @param {string | null | undefined} options.groupJid
 * @param {{ jid: string | null, pn: string | null, lid: string | null, candidates: string[] }} options.owner
 * @returns {Promise<number>}
 */
async function countNotes({ sessionId, scope, groupJid, owner }) {
  const builder = buildScopeQuery({ sessionId, scope, groupJid, owner });
  if (!builder) return 0;

  const row = await builder.count({ count: '*' }).first();
  return Number(row?.count || 0);
}

/**
 * Save or update a note.
 *
 * @param {object} options
 * @param {string} options.sessionId
 * @param {'personal' | 'group'} options.scope
 * @param {string} [options.chatJid]
 * @param {any} options.sender
 * @param {string | null} [options.senderName]
 * @param {string} options.name
 * @param {string} options.content
 * @returns {Promise<{ ok: true, created: boolean, note: Record<string, any> } | { ok: false, error: string }>}
 */
export async function saveNote({
  sessionId,
  scope,
  chatJid,
  sender,
  senderName = null,
  name,
  content,
}) {
  if (!sessionId) return { ok: false, error: 'invalid_context' };
  if (!NOTE_SCOPES.has(scope)) return { ok: false, error: 'invalid_scope' };

  const normalizedName = normalizeNoteName(name);
  if (
    !normalizedName ||
    normalizedName.length > MAX_NOTE_NAME_LENGTH
  ) {
    return { ok: false, error: 'invalid_name' };
  }

  if (RESERVED_NOTE_NAMES.has(normalizedName)) {
    return { ok: false, error: 'reserved_name' };
  }

  const text = normalizeNoteContent(content);
  if (!text || text.length > MAX_NOTE_CONTENT_LENGTH) {
    return { ok: false, error: 'invalid_content' };
  }

  const owner = resolveNoteSender(sender);
  if (scope === NOTE_SCOPE_PERSONAL && !owner.jid) {
    return { ok: false, error: 'invalid_sender' };
  }
  if (scope === NOTE_SCOPE_GROUP && !chatJid) {
    return { ok: false, error: 'invalid_context' };
  }

  const now = toSqlDate(DateTime.utc());
  const existing = await findNote({
    sessionId,
    scope,
    groupJid: chatJid,
    owner,
    name: normalizedName,
  });

  if (existing) {
    const update = { content: text, updated_at: now };

    if (scope === NOTE_SCOPE_GROUP) {
      update.author_jid = owner.jid;
      update.author_pn = owner.pn;
      update.author_lid = owner.lid;
      update.author_name = senderName || existing.author_name || null;
    } else {
      update.owner_pn = owner.pn;
      update.owner_lid = owner.lid;
    }

    await db('notes').where({ id: existing.id }).update(update);
    return { ok: true, created: false, note: { ...existing, ...update } };
  }

  const limit =
    scope === NOTE_SCOPE_GROUP ? MAX_GROUP_NOTES : MAX_PERSONAL_NOTES;
  const total = await countNotes({
    sessionId,
    scope,
    groupJid: chatJid,
    owner,
  });

  if (total >= limit) {
    return { ok: false, error: 'limit' };
  }

  const row = {
    session_id: sessionId,
    scope,
    scope_key:
      scope === NOTE_SCOPE_GROUP
        ? groupScopeKey(chatJid)
        : personalScopeKey(owner),
    name: normalizedName,
    content: text,
    owner_jid: scope === NOTE_SCOPE_PERSONAL ? owner.jid : null,
    owner_pn: scope === NOTE_SCOPE_PERSONAL ? owner.pn : null,
    owner_lid: scope === NOTE_SCOPE_PERSONAL ? owner.lid : null,
    author_jid: scope === NOTE_SCOPE_GROUP ? owner.jid : null,
    author_pn: scope === NOTE_SCOPE_GROUP ? owner.pn : null,
    author_lid: scope === NOTE_SCOPE_GROUP ? owner.lid : null,
    author_name:
      scope === NOTE_SCOPE_GROUP ? senderName || null : null,
    created_at: now,
    updated_at: now,
  };

  await db('notes')
    .insert(row)
    .onConflict(['session_id', 'scope', 'scope_key', 'name'])
    .merge({
      content: text,
      updated_at: now,
      ...(scope === NOTE_SCOPE_GROUP
        ? {
            author_jid: owner.jid,
            author_pn: owner.pn,
            author_lid: owner.lid,
            author_name: senderName || null,
          }
        : {
            owner_pn: owner.pn,
            owner_lid: owner.lid,
          }),
    });

  const saved = await findNote({
    sessionId,
    scope,
    groupJid: chatJid,
    owner,
    name: normalizedName,
  });

  return { ok: true, created: true, note: saved || row };
}

/**
 * Read one personal or group note.
 *
 * @param {object} options
 * @param {string} options.sessionId
 * @param {'personal' | 'group'} options.scope
 * @param {string} [options.chatJid]
 * @param {any} options.sender
 * @param {string} options.name
 * @returns {Promise<Record<string, any> | null>}
 */
export async function getNote({ sessionId, scope, chatJid, sender, name }) {
  if (!sessionId) return null;

  const normalizedName = normalizeNoteName(name);
  if (!normalizedName) return null;

  return findNote({
    sessionId,
    scope,
    groupJid: chatJid,
    owner: resolveNoteSender(sender),
    name: normalizedName,
  });
}

/**
 * List notes in a scope, optionally filtered by a search query.
 *
 * @param {object} options
 * @param {string} options.sessionId
 * @param {'personal' | 'group'} options.scope
 * @param {string} [options.chatJid]
 * @param {any} options.sender
 * @param {string} [options.query]
 * @param {number} [options.limit]
 * @returns {Promise<Array<Record<string, any>>>}
 */
export async function listNotes({
  sessionId,
  scope,
  chatJid,
  sender,
  query = '',
  limit = MAX_NOTE_LIST,
}) {
  if (!sessionId) return [];

  const builder = buildScopeQuery({
    sessionId,
    scope,
    groupJid: chatJid,
    owner: resolveNoteSender(sender),
  });
  if (!builder) return [];

  const search = String(query || '').trim();
  if (search) {
    const pattern = `%${search}%`;
    builder.where((inner) => {
      inner.where('name', 'like', pattern).orWhere('content', 'like', pattern);
    });
  }

  const safeLimit = Math.min(
    Math.max(Number(limit) || MAX_NOTE_LIST, 1),
    MAX_NOTE_LIST
  );

  return builder.orderBy('name', 'asc').limit(safeLimit);
}

/**
 * Delete one note in a scope.
 *
 * @param {object} options
 * @param {string} options.sessionId
 * @param {'personal' | 'group'} options.scope
 * @param {string} [options.chatJid]
 * @param {any} options.sender
 * @param {string} options.name
 * @returns {Promise<boolean>}
 */
export async function deleteNote({
  sessionId,
  scope,
  chatJid,
  sender,
  name,
}) {
  const note = await getNote({ sessionId, scope, chatJid, sender, name });
  if (!note) return false;

  const deleted = await db('notes').where({ id: note.id }).del();
  return deleted > 0;
}

/**
 * Delete every group note for a group in a session.
 * Called when the bot leaves or is removed from the group.
 *
 * @param {{ sessionId: string, groupJid: string }} options
 * @returns {Promise<number>}
 */
export async function deleteGroupNotes({ sessionId, groupJid }) {
  if (!sessionId || !groupJid) return 0;

  return db('notes')
    .where({
      session_id: sessionId,
      scope: NOTE_SCOPE_GROUP,
      scope_key: groupScopeKey(groupJid),
    })
    .del();
}
