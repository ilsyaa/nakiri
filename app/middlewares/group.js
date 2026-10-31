import cache from '@nakiri/core/services/cache';
import db from '@nakiri/core/services/database';
import { nowUtc, parseUtc, DateTime } from '#app/services/time.js';

export const defaultGroupSettings = {
  botAccess: 'everyone',
  maxWarn: 3,
  blockedWords: [],
};

/**
 * Group metadata loader, member scoring, and group botAccess guard.
 *
 * @type {import('@nakiri/core/services/modules').EventMiddleware<'message'>}
 */
export default async function groupMiddleware(payload, ctx) {
  const msg = ctx.msg;
  if (!msg?.flags?.isGroup) return;

  // 1. Resolve or create group settings in cache / database
  const tableGroup = await cache.remember(
    `table_group:${msg.chat}`,
    '15m',
    async () => {
      let group = await db('groups').where({ id: msg.chat }).first();

      if (!group) {
        await db('groups')
          .insert({
            id: msg.chat,
            settings: JSON.stringify(defaultGroupSettings),
          })
          .onConflict('id')
          .ignore();

        group = await db('groups').where({ id: msg.chat }).first();
      }

      let parsedSettings = {};
      if (group?.settings) {
        try {
          parsedSettings =
            typeof group.settings === 'string'
              ? JSON.parse(group.settings)
              : group.settings;
        } catch {}
      }

      if (group) {
        group.settings = {
          ...defaultGroupSettings,
          ...parsedSettings,
        };
      }

      return group || null;
    }
  );

  ctx.tableGroup = tableGroup;

  // 2. Resolve or create group member record
  const { lid, pn, name } = msg.sender || {};
  if (tableGroup?.id && (lid || pn)) {
    let member = await db('group_members')
      .where('group_id', tableGroup.id)
      .where((qb) => {
        if (lid && pn) qb.where('user_lid', lid).orWhere('user_pn', pn);
        else if (lid) qb.where('user_lid', lid);
        else if (pn) qb.where('user_pn', pn);
      })
      .first();

    if (!member) {
      try {
        const [insertedId] = await db('group_members').insert({
          group_id: tableGroup.id,
          user_lid: lid || null,
          user_pn: pn || null,
          pushname: name || null,
        });

        member = await db('group_members').where({ id: insertedId }).first();
      } catch {
        member = await db('group_members')
          .where('group_id', tableGroup.id)
          .where((qb) => {
            if (lid && pn) qb.where('user_lid', lid).orWhere('user_pn', pn);
            else if (lid) qb.where('user_lid', lid);
            else if (pn) qb.where('user_pn', pn);
          })
          .first();
      }
    }

    if (member) {
      const updates = {};
      if (!member.user_lid && lid) {
        updates.user_lid = lid;
        member.user_lid = lid;
      }
      if (!member.user_pn && pn) {
        updates.user_pn = pn;
        member.user_pn = pn;
      }
      if (name && member.pushname !== name) {
        updates.pushname = name;
        member.pushname = name;
      }

      if (Object.keys(updates).length > 0) {
        await db('group_members').where({ id: member.id }).update(updates);
      }
    }

    ctx.tableGroupMember = member;

    // 3. Debounced interaction score counter
    if (!msg.flags.fromMe && member?.id) {
      const scoreCooldownKey = `score_cooldown:${tableGroup.id}:${member.id}`;
      if (!cache.has(scoreCooldownKey)) {
        let shouldScore = true;

        if (member.last_interacted_at) {
          const last = parseUtc(member.last_interacted_at);
          if (last && last.isValid) {
            const diffMinutes = DateTime.utc().diff(last, 'minutes').minutes;
            if (diffMinutes < 10) {
              const remainingMs = Math.max(
                0,
                Math.floor((10 - diffMinutes) * 60 * 1000)
              );
              cache.set(scoreCooldownKey, true, remainingMs);
              shouldScore = false;
            }
          }
        }

        if (shouldScore) {
          cache.set(scoreCooldownKey, true, '10m');
          const now = nowUtc();
          await db('group_members')
            .where({ id: member.id })
            .update({
              score: db.raw('COALESCE(score, 0) + 1'),
              last_interacted_at: now,
            });

          member.score = Number(member.score ?? 0) + 1;
          member.last_interacted_at = now;
        }
      }
    }
  }

  // 4. Guard against non-admin commands if botAccess is restricted to 'admin'
  const botAccess = tableGroup?.settings?.botAccess || 'everyone';
  if (botAccess === 'admin') {
    const hasAdminAccess = Boolean(
      msg.permissions?.sender?.admin ||
      msg.permissions?.sender?.superAdmin ||
      msg.permissions?.sender?.isOwner
    );

    if (!hasAdminAccess) {
      return ctx.stop();
    }
  }
}
