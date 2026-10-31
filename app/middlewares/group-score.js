import cache from '@nakiri/core/services/cache';
import db from '@nakiri/core/services/database';
import { nowUtc, parseUtc, DateTime } from '#app/services/time.js';

/**
 * Debounced group member interaction scoring middleware.
 * Increments member score at most once every 10 minutes.
 *
 * @type {import('@nakiri/core/services/modules').EventMiddleware<'message'>}
 */
export default async function groupScoreMiddleware(payload, ctx) {
  const msg = ctx.msg;
  const group = ctx.tableGroup;
  const member = ctx.tableGroupMember;

  if (!msg?.flags?.isGroup || msg.flags.fromMe || !group?.id || !member?.id) {
    return;
  }

  const cooldownKey = `score_cooldown:${group.id}:${member.id}`;
  if (cache.has(cooldownKey)) return;

  if (member.last_interacted_at) {
    const last = parseUtc(member.last_interacted_at);
    if (last && last.isValid) {
      const diffMinutes = DateTime.utc().diff(last, 'minutes').minutes;
      if (diffMinutes < 10) {
        const remainingMs = Math.max(
          0,
          Math.floor((10 - diffMinutes) * 60 * 1000)
        );
        cache.set(cooldownKey, true, remainingMs);
        return;
      }
    }
  }

  cache.set(cooldownKey, true, '10m');
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

