import cache from '@nakiri/core/services/cache';
import db from '@nakiri/core/services/database';
import { normalizeIdentity } from '#app/utils/target.js';

const defaultGroupSettings = {
  botAccess: 'everyone',
  maxWarn: 3,
  blockedWords: [],
};

const toFullJid = (val, type) => {
  if (!val) return null;
  const norm = normalizeIdentity(val);
  const id = norm?.id || String(val).replace(/[^0-9]/g, '');
  if (!id) return null;

  return type === 'lid' ? `${id}@lid` : `${id}@s.whatsapp.net`;
};

async function getTableGroup(groupId) {
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
 * @param {{ lid?: string | null, pn?: string | null, name?: string | null }} [identities]
 * @returns {Promise<Record<string, any> | null>}
 */
async function getTableGroupMember(
  groupId,
  { lid = null, pn = null, name = null } = {}
) {
  const fullLid = toFullJid(lid, 'lid');
  const fullPn = toFullJid(pn, 'pn');

  if (!groupId || (!fullLid && !fullPn)) return null;

  const rawLid = fullLid ? fullLid.replace(/@.*$/, '') : null;
  const rawPn = fullPn ? fullPn.replace(/@.*$/, '') : null;

  const matchQuery = () =>
    db('group_members')
      .where('group_id', groupId)
      .where((qb) => {
        const candidates = [];
        if (fullLid) candidates.push(fullLid);
        if (rawLid) candidates.push(rawLid);
        if (fullPn) candidates.push(fullPn);
        if (rawPn) candidates.push(rawPn);

        qb.whereIn('user_lid', candidates).orWhereIn('user_pn', candidates);
      });

  let member = await matchQuery().first();

  if (!member) {
    try {
      const [id] = await db('group_members').insert({
        group_id: groupId,
        user_lid: fullLid || null,
        user_pn: fullPn || null,
        pushname: name || null,
      });
      member = await db('group_members').where({ id }).first();
    } catch {
      member = await matchQuery().first();
    }
  }

  if (member) {
    const updates = {};

    if (member.user_lid && !member.user_lid.includes('@')) {
      member.user_lid = updates.user_lid = `${member.user_lid}@lid`;
    }
    if (member.user_pn && !member.user_pn.includes('@')) {
      member.user_pn = updates.user_pn = `${member.user_pn}@s.whatsapp.net`;
    }

    if (!member.user_lid && fullLid) {
      member.user_lid = updates.user_lid = fullLid;
    }
    if (!member.user_pn && fullPn) {
      member.user_pn = updates.user_pn = fullPn;
    }
    if (name && member.pushname !== name) {
      member.pushname = updates.pushname = name;
    }

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
      value: () => cache.delete(`table_group:${msg.chat}`),
      enumerable: false,
      configurable: true,
    });
  }
  ctx.tableGroup = tableGroup;

  // 2. Resolve group member record (injected into ctx.tableGroupMember)
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
