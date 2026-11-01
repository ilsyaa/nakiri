import { defineCommand } from '#app/services/bot/index.js';
import db from '@nakiri/core/services/database';
import { resolveTarget } from '#app/utils/target.js';
import { DateTime } from 'luxon';

/**
 * Konfigurasi field yang diizinkan untuk diedit oleh admin grup.
 * Tambahkan nama kolom baru di sini jika tabel group_members memiliki kolom baru.
 *
 * @type {Record<string, { type: 'number' | 'string', column?: string }>}
 */
const ALLOWED_EDIT_FIELDS = {
  score: { type: 'number', column: 'score' },
  warnings: { type: 'number', column: 'warnings' },
  name: { type: 'string', column: 'pushname' },
  pushname: { type: 'string', column: 'pushname' },
};

const formatRelativeDate = (val) => {
  if (!val) return '-';
  try {
    const dt =
      typeof val === 'string'
        ? DateTime.fromSQL(val, { zone: 'utc' })
        : DateTime.fromJSDate(new Date(val), { zone: 'utc' });

    if (!dt.isValid) return '-';
    return (
      dt.toRelative({ locale: 'id' }) || dt.toRelative({ locale: 'en' }) || '-'
    );
  } catch {
    return '-';
  }
};

/**
 * Query data member langsung dari database berdasarkan target
 */
async function findGroupMember(groupId, { lid, pn }) {
  if (!groupId || (!lid && !pn)) return null;

  return db('group_members')
    .where('group_id', groupId)
    .where((qb) => {
      const candidates = [];
      if (lid) candidates.push(lid, `${lid}@lid`);
      if (pn) candidates.push(pn, `${pn}@s.whatsapp.net`);
      qb.whereIn('user_lid', candidates).orWhereIn('user_pn', candidates);
    })
    .first();
}

export default defineCommand({
  name: 'member',
  aliases: ['member'],
  category: 'group',
  description:
    'Show group member database information and edit values (for admins)',
  middlewares: ['group'],

  async execute(payload, ctx) {
    const { msg, tableGroup, tableGroupMember } = ctx;
    if (!msg || !tableGroup) return;

    const p = msg.body?.prefix || '.';
    const cmd = msg.body?.command || `${p}member`;
    const args = msg.body?.args || [];
    const subcommand = (args[0] || '').toLowerCase();

    const isAdmin = Boolean(
      msg.permissions?.sender?.admin ||
      msg.permissions?.sender?.superAdmin ||
      msg.permissions?.sender?.isOwner
    );

    // ==========================================
    // 1. SUBCOMMAND: SET (Admin / Owner only)
    // ==========================================
    if (subcommand === 'set') {
      if (!isAdmin) {
        return msg.reply('Only Admin!');
      }

      // Syntax formats:
      // A. Reply chat: .user set score 100
      // B. Mention: .user set @target score 100
      // C. Tag di akhir: .user set score 100 @target
      let targetInput = '';
      let field = '';
      let value = '';

      const isFirstArgField =
        (args[1] || '').toLowerCase() in ALLOWED_EDIT_FIELDS;

      if (isFirstArgField) {
        // Pola: .user set <field> <value> [target]
        field = (args[1] || '').toLowerCase();
        value = args[2] || '';
        targetInput = args.slice(3).join(' ').trim();
      } else {
        // Pola: .user set <target> <field> <value>
        targetInput = args[1] || '';
        field = (args[2] || '').toLowerCase();
        value = args.slice(3).join(' ').trim();
      }

      // Jika me-reply pesan atau mengetik .user set <field> <value> tanpa target lain, fallback ke diri sendiri
      const targetIdentities = resolveTarget(msg, targetInput, {
        allowSelf: true,
      });

      if (!targetIdentities.lid && !targetIdentities.pn) {
        return msg.reply(
          [
            '｢ *panduan set member* ｣',
            `• Reply chat: \`${cmd} set <field> <nilai>\``,
            `• Sebut target: \`${cmd} set @member <field> <nilai>\``,
            `Contoh: \`${cmd} set score 100\``,
          ].join('\n')
        );
      }

      const isSelf =
        !msg.quoted && !msg.body?.mentionedJid?.[0] && !targetInput;

      const member = isSelf
        ? tableGroupMember
        : await findGroupMember(tableGroup.id, targetIdentities);

      if (!member) {
        return msg.reply(
          'Member belum pernah berinteraksi di grup ini (tidak ada di database).'
        );
      }

      const fieldConfig = ALLOWED_EDIT_FIELDS[field];
      if (!fieldConfig) {
        const availableFields = Array.from(
          new Set(Object.keys(ALLOWED_EDIT_FIELDS))
        )
          .map((f) => `\`${f}\``)
          .join(', ');
        return msg.reply(
          [
            `Field \`${field}\` tidak valid.`,
            `Kolom yang diizinkan: ${availableFields}`,
          ].join('\n')
        );
      }

      if (!value) {
        return msg.reply(
          `Tentukan nilai baru untuk field \`${field}\`.\nContoh: \`${cmd} set ${field} 100\``
        );
      }

      const dbColumn = fieldConfig.column || field;
      const updates = {};
      let finalValueDisplay = value;

      if (fieldConfig.type === 'number') {
        let num = parseInt(value, 10);
        if (isNaN(num)) {
          return msg.reply(`Nilai untuk \`${field}\` harus berupa angka.`);
        }

        if (value.startsWith('+') || value.startsWith('-')) {
          num = (member[dbColumn] || 0) + num;
        }

        if (dbColumn === 'warnings' && num < 0) {
          return msg.reply('Nilai warnings tidak boleh kurang dari 0.');
        }

        updates[dbColumn] = num;
        if (dbColumn === 'warnings' && num === 0) {
          updates.last_warned_at = null;
        }
        finalValueDisplay = String(num);
      } else {
        updates[dbColumn] = value;
        finalValueDisplay = value;
      }

      await db('group_members').where({ id: member.id }).update(updates);

      const targetIdentifier = member.user_pn || member.user_lid || member.id;
      return msg.reply(
        [
          '*Data member berhasil diperbarui*',
          `• Target: \`${targetIdentifier}\``,
          `• Field: \`${field}\``,
          `• Nilai Baru: \`${finalValueDisplay}\``,
        ].join('\n')
      );
    }

    // ==========================================
    // 2. TAMPILKAN INFORMASI MEMBER (Default)
    // ==========================================
    const hasTargetArg = args.length > 0 && subcommand !== 'help';
    const isSelf = !msg.quoted && !msg.body?.mentionedJid?.[0] && !hasTargetArg;

    let member = isSelf ? tableGroupMember : null;
    let nameDisplay = member?.pushname || msg.sender?.name || 'Unknown';

    if (!member) {
      const targetIdentities = resolveTarget(msg, hasTargetArg ? args[0] : '', {
        allowSelf: true,
      });

      member = await findGroupMember(tableGroup.id, targetIdentities);
      nameDisplay = member?.pushname || targetIdentities.name || 'Unknown';
    }

    if (!member) {
      return msg.reply(
        'Member belum pernah berinteraksi di grup ini (tidak ada di database).'
      );
    }

    const maxWarn = tableGroup.settings?.maxWarn || 3;
    const pnDisplay = member.user_pn ? `\`${member.user_pn}\`` : '-';
    const lidDisplay = member.user_lid ? `\`${member.user_lid}\`` : '-';
    const scoreDisplay = Number(member.score || 0).toLocaleString('id-ID');
    const lastActiveDisplay = formatRelativeDate(member.last_interacted_at);

    const lines = [
      '｢ *member information* ｣',
      `• Name: *${nameDisplay}*`,
      `• Phone: ${pnDisplay}`,
      `• LID: ${lidDisplay}`,
      `• Database ID: \`#${member.id}\``,
      '',
      '*Statistics:*',
      `• Score: *${scoreDisplay}* poin`,
      `• Warnings: *${member.warnings || 0}* / ${maxWarn}`,
      `• Last Active: _${lastActiveDisplay}_`,
    ];

    if (isAdmin) {
      lines.push(
        '',
        '*Admin Action (Reply chat target):*',
        `• \`${cmd} set score <angka>\``,
        `• \`${cmd} set warnings <angka>\``,
        `• \`${cmd} set name <nama>\``,
        '',
        `_Atau sebut target: \`${cmd} set @member score 100\`_`
      );
    }

    return msg.reply(lines.join('\n'));
  },
});
