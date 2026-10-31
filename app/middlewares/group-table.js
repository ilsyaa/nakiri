import cache from '@nakiri/core/services/cache';
import db from '@nakiri/core/services/database';

export const defaultGroupSettings = {
  botAccess: 'everyone',
  maxWarn: 3,
  blockedWords: [],
};

/**
 * Clear the cached group record for a specific group JID.
 *
 * @param {string} groupId
 */
export function clearTableGroupCache(groupId) {
  if (groupId) {
    cache.delete(`table_group:${groupId}`);
  }
}

/**
 * Fetch group record from cache/database, creating with defaults if absent.
 *
 * @param {string} groupId
 * @returns {Promise<Record<string, any> | null>}
 */
export async function getTableGroup(groupId) {
  if (!groupId) return null;

  return cache.remember(`table_group:${groupId}`, '15m', async () => {
    let group = await db('groups').where({ id: groupId }).first();

    if (!group) {
      await db('groups')
        .insert({
          id: groupId,
          settings: JSON.stringify(defaultGroupSettings),
        })
        .onConflict('id')
        .ignore();

      group = await db('groups').where({ id: groupId }).first();
    }

    if (!group) return null;

    let settings = defaultGroupSettings;
    if (group.settings) {
      try {
        const parsed =
          typeof group.settings === 'string'
            ? JSON.parse(group.settings)
            : group.settings;
        settings = { ...defaultGroupSettings, ...parsed };
      } catch {}
    }

    group.settings = settings;
    return group;
  });
}

/**
 * Resolve or upsert a group member record by LID or phone number.
 *
 * @param {string} groupId
 * @param {{ lid?: string | null, pn?: string | null, name?: string | null }} sender
 * @returns {Promise<Record<string, any> | null>}
 */
export async function getTableGroupMember(
  groupId,
  { lid, pn, name = null } = {}
) {
  if (!groupId || (!lid && !pn)) return null;

  const matchQuery = () =>
    db('group_members')
      .where('group_id', groupId)
      .where((qb) => {
        if (lid && pn) qb.where('user_lid', lid).orWhere('user_pn', pn);
        else if (lid) qb.where('user_lid', lid);
        else if (pn) qb.where('user_pn', pn);
      });

  let member = await matchQuery().first();

  if (!member) {
    try {
      const [id] = await db('group_members').insert({
        group_id: groupId,
        user_lid: lid || null,
        user_pn: pn || null,
        pushname: name || null,
      });
      member = await db('group_members').where({ id }).first();
    } catch {
      member = await matchQuery().first();
    }
  }

  if (member) {
    const updates = {};
    if (!member.user_lid && lid) member.user_lid = updates.user_lid = lid;
    if (!member.user_pn && pn) member.user_pn = updates.user_pn = pn;
    if (name && member.pushname !== name)
      member.pushname = updates.pushname = name;

    if (Object.keys(updates).length > 0) {
      await db('group_members').where({ id: member.id }).update(updates);
    }
  }

  return member || null;
}

/**
 * Group and member metadata loader middleware.
 *
 * @type {import('@nakiri/core/services/modules').EventMiddleware<'message'>}
 */
export default async function groupMiddleware(payload, ctx) {
  const msg = ctx.msg;
  if (!msg?.flags?.isGroup) return;

  // 1. Resolve group record
  const tableGroup = await getTableGroup(msg.chat);
  if (tableGroup) {
    Object.defineProperty(tableGroup, 'clearCache', {
      value: () => clearTableGroupCache(msg.chat),
      enumerable: false,
      configurable: true,
    });
  }
  ctx.tableGroup = tableGroup;

  // 2. Resolve group member record
  const { lid, pn, name } = msg.sender || {};
  const member = await getTableGroupMember(tableGroup?.id, { lid, pn, name });

  if (member) {
    Object.defineProperty(member, 'clearCache', {
      value: () => cache.delete(`score_cooldown:${tableGroup.id}:${member.id}`),
      enumerable: false,
      configurable: true,
    });
  }
  ctx.tableGroupMember = member;
}
