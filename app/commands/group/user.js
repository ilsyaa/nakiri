import { defineCommand } from '#app/services/bot/index.js';
import db from '@nakiri/core/services/database';
import { getTableGroupMember } from '#app/middlewares/group-table.js';
import { resolveTarget } from '#app/utils/target.js';

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

const formatDate = (val) => {
  if (!val) return '-';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '-';
    return d.toISOString().replace('T', ' ').slice(0, 19);
  } catch {
    return '-';
  }
};

export default defineCommand({
  name: 'user',
  aliases: ['user', 'member'],
  category: 'group',
  description:
    'Show group member database information and edit values (for admins)',
  middlewares: ['group'],

  async execute(payload, ctx) {
    const { msg, tableGroup } = ctx;
    if (!msg || !tableGroup) return;

    const p = msg.body?.prefix || '.';
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

      let targetInput = '';
      let field = '';
      let value = '';

      if (msg.quoted || (!msg.body?.mentionedJid?.[0] && args.length === 3)) {
        field = (args[1] || '').toLowerCase();
        value = args.slice(2).join(' ').trim();
      } else if (args.length >= 4) {
        targetInput = args[1] || '';
        field = (args[2] || '').toLowerCase();
        value = args.slice(3).join(' ').trim();
      } else {
        field = (args[1] || '').toLowerCase();
        value = args.slice(2).join(' ').trim();
      }

      const targetIdentities = resolveTarget(msg, targetInput, {
        allowSelf: false,
      });

      if (!targetIdentities.lid && !targetIdentities.pn) {
        return msg.reply(
          `Gunakan: reply chat target atau sebut target.\nContoh: \`${p}user set score 100\``
        );
      }

      const member = await getTableGroupMember(tableGroup.id, targetIdentities);
      if (!member) {
        return msg.reply('Member tidak ditemukan dalam database grup.');
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
            `Field \`${field}\` tidak dapat diubah.`,
            `Kolom yang diizinkan: ${availableFields}`,
          ].join('\n')
        );
      }

      if (!value) {
        return msg.reply(`Masukkan nilai baru untuk field \`${field}\`.`);
      }

      const dbColumn = fieldConfig.column || field;
      const updates = {};
      let finalValueDisplay = value;

      if (fieldConfig.type === 'number') {
        let num = parseInt(value, 10);
        if (isNaN(num)) {
          return msg.reply(`Nilai untuk \`${field}\` harus berupa angka.`);
        }

        // Support operator + dan - (contoh: +50 atau -20)
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
        // Type: string
        updates[dbColumn] = value;
        finalValueDisplay = value;
      }

      await db('group_members').where({ id: member.id }).update(updates);
      member.clearCache?.();

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
    const targetInput = subcommand !== 'help' ? args[0] : '';
    const targetIdentities = resolveTarget(msg, targetInput, {
      allowSelf: true,
    });
    const member = await getTableGroupMember(tableGroup.id, targetIdentities);

    if (!member) {
      return msg.reply('Member tidak ditemukan dalam database grup.');
    }

    const maxWarn = tableGroup.settings?.maxWarn || 3;
    const nameDisplay = member.pushname || targetIdentities.name || 'Unknown';
    const pnDisplay = member.user_pn ? `\`${member.user_pn}\`` : '-';
    const lidDisplay = member.user_lid ? `\`${member.user_lid}\`` : '-';
    const scoreDisplay = Number(member.score || 0).toLocaleString('id-ID');
    const lastActiveDisplay = formatDate(member.last_interacted_at);

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
        '*Admin Action:*',
        `• \`${p}user set score <angka>\``,
        `• \`${p}user set warnings <angka>\``,
        `• \`${p}user set name <nama>\``
      );
    }

    return msg.reply(lines.join('\n'));
  },
});
