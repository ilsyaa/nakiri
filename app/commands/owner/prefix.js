import { defineCommand } from '#app/services/bot/index.js';
import db from '@nakiri/core/services/database';

const DEFAULT_PREFIXES = ['!', '.', '#'];

export default defineCommand({
  name: 'prefix',
  aliases: ['prefix'],
  category: 'owner',
  description: 'Manage bot command prefixes (list, add, set, del, reset)',
  middlewares: ['sender:isOwner'],

  async execute(payload, ctx) {
    const { msg, tableBot } = ctx;
    if (!msg) return;

    const [subcommandRaw, ...rest] = msg.body?.args || [];
    const subcommand = (subcommandRaw || '').toLowerCase();
    const currentPrefixes =
      Array.isArray(tableBot?.prefixes) && tableBot.prefixes.length > 0
        ? tableBot.prefixes
        : DEFAULT_PREFIXES;

    const savePrefixes = async (newPrefixes) => {
      const unique = Array.from(new Set(newPrefixes.filter(Boolean)));
      await db('bots').update({ prefixes: JSON.stringify(unique) });
      tableBot?.clearCache?.();
      return unique;
    };

    const p = msg.body?.prefix || '.';
    const cmd = msg.body?.command || `${p}prefix`;

    // Panduan jika tanpa argumen atau subcommand tidak dikenali
    const sendGuide = () =>
      msg.reply(
        [
          '｢ *prefix management* ｣',
          `• \`${cmd} list\``,
          `• \`${cmd} add <simbol>\``,
          `• \`${cmd} set <simbol...>\``,
          `• \`${cmd} del <simbol/nomor>\``,
          `• \`${cmd} reset\``,
          '',
          `_Gunakan \`${cmd} <command>\` untuk menjalankan._`,
        ].join('\n')
      );

    if (!subcommand) {
      return sendGuide();
    }

    // 1. LIST
    if (subcommand === 'list') {
      const listText = currentPrefixes
        .map((item, i) => `• [${i + 1}] \`${item}\``)
        .join('\n');
      const examples = currentPrefixes
        .slice(0, 3)
        .map((item) => `\`${item}menu\``)
        .join(', ');

      return msg.reply(
        [
          '｢ *daftar prefix aktif* ｣',
          `Total: *${currentPrefixes.length}* prefix`,
          '',
          listText,
          '',
          `Contoh: ${examples}`,
        ].join('\n')
      );
    }

    // 2. ADD
    if (subcommand === 'add') {
      const target = rest[0]?.trim();
      if (!target) {
        return msg.reply(
          `Masukkan simbol prefix baru.\nContoh: \`${cmd} add /\``
        );
      }

      if (target.length > 5) {
        return msg.reply('Gagal: Panjang prefix maksimal 5 karakter.');
      }

      if (currentPrefixes.includes(target)) {
        return msg.reply(`Prefix \`${target}\` sudah terdaftar.`);
      }

      const updated = await savePrefixes([...currentPrefixes, target]);
      const listFormatted = updated.map((item) => `\`${item}\``).join(', ');

      return msg.reply(
        [
          `*Prefix berhasil ditambahkan:* \`${target}\``,
          '',
          `Prefix aktif: ${listFormatted}`,
        ].join('\n')
      );
    }

    // 3. SET (Ganti seluruh prefix sekaligus)
    if (subcommand === 'set') {
      const targets = rest
        .map((item) => item.trim())
        .filter((item) => item.length > 0 && item.length <= 5);

      if (targets.length === 0) {
        return msg.reply(
          `Tentukan minimal 1 prefix.\nContoh: \`${cmd} set .\` atau \`${cmd} set ! . #\``
        );
      }

      const updated = await savePrefixes(targets);
      const listFormatted = updated.map((item) => `\`${item}\``).join(', ');

      return msg.reply(
        [
          '*Prefix berhasil diatur ulang:*',
          '',
          `Prefix aktif: ${listFormatted}`,
        ].join('\n')
      );
    }

    // 4. DEL / REMOVE / DELETE
    if (
      subcommand === 'del' ||
      subcommand === 'delete' ||
      subcommand === 'remove'
    ) {
      const target = rest[0]?.trim();
      if (!target) {
        return msg.reply(
          `Tentukan prefix atau nomor index yang ingin dihapus.\nContoh: \`${cmd} del #\` atau \`${cmd} del 2\``
        );
      }

      if (currentPrefixes.length <= 1) {
        return msg.reply('Gagal: Bot harus memiliki minimal 1 prefix aktif.');
      }

      let toRemove = target;
      const index = parseInt(target, 10);
      if (
        !isNaN(index) &&
        index >= 1 &&
        index <= currentPrefixes.length &&
        String(index) === target
      ) {
        toRemove = currentPrefixes[index - 1];
      }

      if (!currentPrefixes.includes(toRemove)) {
        return msg.reply(
          `Prefix \`${toRemove}\` tidak ditemukan dalam daftar.`
        );
      }

      const remaining = currentPrefixes.filter((item) => item !== toRemove);
      if (remaining.length === 0) {
        return msg.reply('Gagal: Bot harus memiliki minimal 1 prefix aktif.');
      }

      const updated = await savePrefixes(remaining);
      const listFormatted = updated.map((item) => `\`${item}\``).join(', ');

      return msg.reply(
        [
          `*Prefix berhasil dihapus:* \`${toRemove}\``,
          '',
          `Prefix aktif: ${listFormatted}`,
        ].join('\n')
      );
    }

    // 5. RESET (Kembalikan ke default ['!', '.', '#'])
    if (subcommand === 'reset') {
      const updated = await savePrefixes(DEFAULT_PREFIXES);
      const listFormatted = updated.map((item) => `\`${item}\``).join(', ');

      return msg.reply(
        [
          '*Prefix berhasil di-reset ke setelan awal*',
          '',
          `Prefix aktif: ${listFormatted}`,
        ].join('\n')
      );
    }

    // Subcommand tidak dikenali
    return sendGuide();
  },
});
