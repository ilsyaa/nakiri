import { defineCommand } from '#app/services/bot/index.js';
import db from '@nakiri/core/services/database';
import { shuffleArray, delay } from '@nakiri/core/utils/common';

export default defineCommand({
  name: 'randkick',
  aliases: ['randkick'],
  category: 'group',
  description: 'Randomly kick group members within a specified score range',
  middlewares: ['group', 'sender:admin,superAdmin', 'bot:admin'],

  async execute(payload, ctx) {
    const { client, msg, tableGroup } = ctx;
    if (!msg) return;

    const prefix = msg.body?.prefix || '.';
    const args = msg.body?.args || [];
    if (args.length === 0) {
      return msg.reply(
        [
          '*Panduan Format Perintah:*',
          `- *${prefix}randkick <skor> [jumlah]*`,
          `  Contoh: \`${prefix}randkick 0 5\` (kick 5 member acak dengan skor 0)`,
          `- *${prefix}randkick <min-max> [jumlah]*`,
          `  Contoh: \`${prefix}randkick 0-1 3\` (kick 3 member acak dengan skor 0 sampai 1)`,
        ].join('\n')
      );
    }

    // 2. Parse score range and count
    let minScore;
    let maxScore;
    const rangeArg = args[0];

    if (rangeArg.includes('-')) {
      const parts = rangeArg.split('-');
      minScore = parseInt(parts[0], 10);
      maxScore = parseInt(parts[1], 10);
    } else {
      minScore = parseInt(rangeArg, 10);
      maxScore = minScore;
    }

    let count = 1;
    if (args[1]) {
      count = parseInt(args[1], 10);
    }

    if (isNaN(minScore) || isNaN(maxScore) || isNaN(count)) {
      return msg.reply(
        `Format angka tidak valid. Contoh: \`${prefix}randkick 0 5\` atau \`${prefix}randkick 0-1 3\``
      );
    }

    if (minScore > maxScore) {
      [minScore, maxScore] = [maxScore, minScore];
    }

    if (count <= 0) {
      return msg.reply('Jumlah member yang ingin di-kick minimal 1.');
    }

    if (count > 50) {
      return msg.reply('Maksimal kick sekaligus adalah 50 member.');
    }

    // 3. Fetch live group roster and database records
    const metadata = await client.group.queryGroupMetadata(msg.chat);

    const participants = metadata?.participants || [];
    if (participants.length === 0) {
      return msg.reply('Gagal mengambil daftar peserta grup.');
    }

    const groupId = tableGroup?.id || msg.chat;
    const dbMembers = await db('group_members').where({ group_id: groupId });

    const memberMap = new Map();
    for (const row of dbMembers) {
      if (row.user_lid) memberMap.set(row.user_lid, row);
      if (row.user_pn) memberMap.set(row.user_pn, row);
    }

    // 4. Filter kickable candidates based on score range
    const botIdentifiers = new Set(
      [msg.bot?.id, msg.bot?.pn, msg.bot?.lid].filter(Boolean)
    );
    const senderIdentifiers = new Set(
      [msg.sender?.id, msg.sender?.pn, msg.sender?.lid].filter(Boolean)
    );

    const candidates = [];
    for (const p of participants) {
      // Protect admins, superadmins, bot itself, and sender
      if (p.isAdmin || p.isSuperAdmin) continue;
      if (botIdentifiers.has(p.jid) || (p.lid && botIdentifiers.has(p.lid)))
        continue;
      if (
        senderIdentifiers.has(p.jid) ||
        (p.lid && senderIdentifiers.has(p.lid))
      )
        continue;

      // Resolve score from DB (or default to 0 if never interacted)
      const dbRow =
        memberMap.get(p.jid) || (p.lid ? memberMap.get(p.lid) : null);
      const score = Number(dbRow?.score ?? 0);

      if (score >= minScore && score <= maxScore) {
        candidates.push({
          participant: p,
          score,
          dbRow,
        });
      }
    }

    if (candidates.length === 0) {
      const rangeLabel =
        minScore === maxScore ? `${minScore}` : `${minScore} - ${maxScore}`;
      return msg.reply(
        `Tidak ditemukan member biasa dengan skor ${rangeLabel}.`
      );
    }

    // 5. Select random members up to the requested count
    const selected = shuffleArray(candidates).slice(0, count);

    // 6. Execute group removal one by one with safe delay to prevent account ban
    const kicked = [];
    const dbIdsToDelete = [];

    for (let i = 0; i < selected.length; i++) {
      const target = selected[i];
      const jid = target.participant.jid;

      try {
        const results = await client.group.removeParticipants(msg.chat, [jid]);
        const res = results?.[0];
        if (!res || res.status === 'ok') {
          kicked.push(target);
          if (target.dbRow?.id) {
            dbIdsToDelete.push(target.dbRow.id);
          }
        }
      } catch {}

      if (i < selected.length - 1) {
        await delay(1200);
      }
    }

    if (kicked.length === 0) {
      return msg.reply('Gagal mengeluarkan member.');
    }

    // Clean up kicked members from database
    if (dbIdsToDelete.length > 0) {
      try {
        await db('group_members').whereIn('id', dbIdsToDelete).delete();
      } catch {}
    }

    // 7. Send result summary with mentions
    const mentions = [];
    const listLines = kicked.map((s, idx) => {
      const p = s.participant;
      const phone =
        p.phoneNumber ||
        (p.jid?.endsWith('@s.whatsapp.net') ? p.jid : null) ||
        s.dbRow?.user_pn;

      let nameDisplay;
      if (phone) {
        const cleanPhone = phone.split('@')[0];
        nameDisplay = `@${cleanPhone}`;
        mentions.push(phone);
      } else {
        nameDisplay =
          s.dbRow?.pushname || p.displayName || p.jid?.split('@')[0];
      }

      return `${idx + 1}. ${nameDisplay} (Skor: ${s.score})`;
    });

    const rangeText =
      minScore === maxScore ? `${minScore}` : `${minScore} - ${maxScore}`;
    const groupTitle = metadata.subject || 'Grup';

    const text = [
      `*RANDOM KICK SELESAI*`,
      `*Grup:* ${groupTitle}`,
      `*Kriteria Skor:* ${rangeText}`,
      `*Dikeluarkan:* ${kicked.length} member`,
      '',
      listLines.join('\n'),
    ].join('\n');

    await msg.reply(text, {
      mentions: mentions.length > 0 ? [...new Set(mentions)] : undefined,
    });
  },
});
