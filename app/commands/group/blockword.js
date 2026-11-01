import { defineCommand } from '#app/services/bot/index.js';
import db from '@nakiri/core/services/database';

export default defineCommand({
  name: 'blockword',
  aliases: ['badword', 'blockword'],
  category: 'group',
  description:
    'Manage blocked words and link filter patterns for the group (admin only)',
  middlewares: ['group', 'sender:admin,superAdmin,isOwner', 'bot:admin'],

  async execute(payload, ctx) {
    const { msg, tableGroup } = ctx;
    if (!msg || !tableGroup) return;

    const p = msg.body?.prefix || '.';
    const cmd = msg.body?.command || `${p}blockword`;
    const [subcommandRaw, ...rest] = msg.body?.args || [];
    const subcommand = (subcommandRaw || '').toLowerCase();

    const currentWords = Array.isArray(tableGroup.settings?.blockedWords)
      ? [...tableGroup.settings.blockedWords]
      : [];

    const saveBlockedWords = async (newWords) => {
      const unique = Array.from(
        new Set(newWords.map((s) => s.trim()).filter(Boolean))
      );
      const updatedSettings = {
        ...(tableGroup.settings || {}),
        blockedWords: unique,
      };

      await db('groups')
        .where({ id: msg.chat })
        .update({ settings: JSON.stringify(updatedSettings) });

      tableGroup.clearCache?.();
      return unique;
    };

    // Guide display
    const sendGuide = () =>
      msg.reply(
        [
          '｢ *filter kata & link* ｣',
          `• \`${cmd} list\``,
          `• \`${cmd} add <pola...>\``,
          `• \`${cmd} del <nomor/pola>\``,
          `• \`${cmd} reset\``,
          '',
          '*Pola Khusus yang Didukung:*',
          '• `*kata*` : Potongan kata (contains)',
          '• `link:wa` : Blokir link grup WhatsApp',
          '• `link:telegram` : Blokir tautan Telegram',
          '• `link:all` : Blokir semua tautan web',
          '• `domain:bit.ly` : Blokir domain tertentu',
          '• `r:/pattern/` : Regex kustom',
          '',
          '_Pesan yang melanggar akan otomatis dihapus oleh bot._',
        ].join('\n')
      );

    if (!subcommand) {
      return sendGuide();
    }

    // 1. LIST
    if (subcommand === 'list') {
      if (currentWords.length === 0) {
        return msg.reply('Belum ada kata atau pola terlarang di grup ini.');
      }

      const listText = currentWords
        .map((item, i) => {
          let label = 'kata utuh';
          if (item.startsWith('*') && item.endsWith('*')) label = 'contains';
          else if (item.startsWith('link:')) label = 'preset link';
          else if (item.startsWith('domain:')) label = 'domain';
          else if (item.startsWith('r:/')) label = 'regex';

          return `• [${i + 1}] \`${item}\` _(${label})_`;
        })
        .join('\n');

      return msg.reply(
        [
          '｢ *daftar filter aktif* ｣',
          `Total: *${currentWords.length}* pola`,
          '',
          listText,
        ].join('\n')
      );
    }

    // 2. ADD
    if (subcommand === 'add') {
      if (rest.length === 0) {
        return msg.reply(
          [
            'Tentukan kata atau pola yang ingin diblokir.',
            `Contoh: \`${cmd} add judi *slot* link:wa\``,
          ].join('\n')
        );
      }

      const toAdd = rest.map((s) => s.trim()).filter((s) => s.length > 0);
      const updated = await saveBlockedWords([...currentWords, ...toAdd]);

      return msg.reply(
        [
          '*Pola terlarang berhasil ditambahkan:*',
          toAdd.map((w) => `• \`${w}\``).join('\n'),
          '',
          `Total aktif: *${updated.length}* pola`,
        ].join('\n')
      );
    }

    // 3. DEL / REMOVE
    if (
      subcommand === 'del' ||
      subcommand === 'delete' ||
      subcommand === 'remove'
    ) {
      const target = rest[0]?.trim();
      if (!target) {
        return msg.reply(
          `Tentukan nomor urut atau pola yang ingin dihapus.\nContoh: \`${cmd} del 1\` atau \`${cmd} del *slot*\``
        );
      }

      let toRemove = target;
      const index = parseInt(target, 10);
      if (
        !isNaN(index) &&
        index >= 1 &&
        index <= currentWords.length &&
        String(index) === target
      ) {
        toRemove = currentWords[index - 1];
      }

      if (!currentWords.includes(toRemove)) {
        return msg.reply(`Pola \`${toRemove}\` tidak ditemukan dalam daftar.`);
      }

      const remaining = currentWords.filter((w) => w !== toRemove);
      const updated = await saveBlockedWords(remaining);

      return msg.reply(
        [
          `*Pola berhasil dihapus:* \`${toRemove}\``,
          '',
          `Sisa aktif: *${updated.length}* pola`,
        ].join('\n')
      );
    }

    // 4. RESET
    if (subcommand === 'reset') {
      await saveBlockedWords([]);
      return msg.reply(
        [
          '*Seluruh filter kata & link berhasil di-reset*',
          'Daftar filter kata terlarang sekarang kosong.',
        ].join('\n')
      );
    }

    return sendGuide();
  },
});
