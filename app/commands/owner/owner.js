import { defineCommand } from '#app/services/bot/index.js';
import {
  cleanDigits,
  addOwner,
  removeOwner,
  getOwnersFromDb,
  groupOwners,
} from '#app/services/owner.js';

export default defineCommand({
  name: 'owner',
  category: 'owner',
  description: 'Manage bot owners (set, list, delete)',
  prefix: 'optional',

  async execute(payload, ctx) {
    const { client, msg } = ctx;
    if (!msg) return;

    const args = msg.body?.args || [];
    const action = (args[0] || '').toLowerCase();
    const rawInput = args.slice(1).join(' ').trim();

    const isSet = [
      '-set',
      '--set',
      '-add',
      '--add',
      'set',
      'add',
      '+',
    ].includes(action);
    const isDel = [
      '-del',
      '--del',
      '-delete',
      '--delete',
      '-remove',
      '--remove',
      'del',
      'delete',
      '-',
    ].includes(action);
    const isList =
      ['-list', '--list', '-l', 'list', 'show', 'all'].includes(action) ||
      (!isSet && !isDel && !action);

    // Permission guard: Only bot owners can add or remove owners
    if (isSet || isDel) {
      if (!msg.permissions?.sender?.isOwner) {
        return await msg.reply('Only Owner!');
      }
    }

    // 1. Action: -set (Add owner - adds both PN and LID)
    if (isSet) {
      let targetJid = null;
      let inputDigits = null;
      let senderRef = null;

      if (
        Array.isArray(msg.body?.mentionedJid) &&
        msg.body.mentionedJid.length > 0
      ) {
        targetJid = msg.body.mentionedJid[0];
        inputDigits = cleanDigits(targetJid);
      } else if (msg.quoted?.sender) {
        senderRef = msg.quoted.sender;
        targetJid = senderRef.id || senderRef.lid || senderRef.pn || null;
        inputDigits = cleanDigits(targetJid || senderRef.pn || senderRef.lid);
      } else if (rawInput) {
        targetJid = rawInput.includes('@') ? rawInput : null;
        inputDigits = cleanDigits(rawInput);
      }

      const res = await addOwner({
        targetDigits: inputDigits,
        targetJid,
        senderRef,
        client,
        chatJid: msg.chat,
      });

      if (!res.success) {
        if (res.reason === 'ALREADY_OWNER') {
          const isPn = Boolean(
            res.pn || (res.displayId && res.displayId.length <= 14)
          );
          const mentionText = res.pn
            ? `@${res.pn}`
            : res.lid
            ? `LID \`${res.lid}\``
            : isPn
            ? `@${res.displayId}`
            : `LID \`${res.displayId}\``;
          const mentions =
            isPn && res.displayId ? [`${res.displayId}@s.whatsapp.net`] : [];

          return await msg.reply(
            `${mentionText} sudah terdaftar sebagai owner.`,
            { mentions }
          );
        }

        const prefix = msg.body?.prefix || '.';
        return await msg.reply(
          [
            '*Panduan Format Tambah Owner:*',
            `- Reply pesan: reply pesan target lalu ketik \`${prefix}owner -set\``,
            `- Tag member: \`${prefix}owner -set @member\``,
            `- Input manual (format E.164): \`${prefix}owner -set 6281234567890\` / \`${prefix}owner -set +12025550123\``,
            '_Catatan: Nomor harus menggunakan kode negara internasional (tidak boleh diawali angka 0)._',
          ].join('\n')
        );
      }

      const isPn = Boolean(
        res.pn || (res.displayId && res.displayId.length <= 14)
      );
      const detailText =
        res.pn && res.lid
          ? `@${res.pn} (LID: \`${res.lid}\`)`
          : res.pn
          ? `@${res.pn}`
          : isPn
          ? `@${res.displayId}`
          : `LID: \`${res.displayId}\``;

      const mentions =
        isPn && res.displayId ? [`${res.displayId}@s.whatsapp.net`] : [];

      return await msg.reply(
        `Berhasil menambahkan ${detailText} sebagai owner bot.`,
        { mentions }
      );
    }

    // 2. Action: -del (Remove owner - removes both PN and LID)
    if (isDel) {
      let targetJid = null;
      let inputDigits = null;
      let senderRef = null;

      if (
        Array.isArray(msg.body?.mentionedJid) &&
        msg.body.mentionedJid.length > 0
      ) {
        targetJid = msg.body.mentionedJid[0];
        inputDigits = cleanDigits(targetJid);
      } else if (msg.quoted?.sender) {
        senderRef = msg.quoted.sender;
        targetJid = senderRef.id || senderRef.lid || senderRef.pn || null;
        inputDigits = cleanDigits(targetJid || senderRef.pn || senderRef.lid);
      } else if (rawInput) {
        targetJid = rawInput.includes('@') ? rawInput : null;
        inputDigits = cleanDigits(rawInput);
      }

      const res = await removeOwner({
        rawInput: inputDigits || rawInput,
        targetJid,
        senderRef,
        client,
        chatJid: msg.chat,
      });

      if (!res.success) {
        if (res.reason === 'EMPTY') {
          return await msg.reply(
            'Daftar owner kosong, tidak ada yang dapat dihapus.'
          );
        }

        if (res.reason === 'NO_TARGET') {
          const prefix = msg.body?.prefix || '.';
          return await msg.reply(
            [
              '*Panduan Format Hapus Owner:*',
              `- Menggunakan nomor urut: \`${prefix}owner -del 1\``,
              `- Tag member: \`${prefix}owner -del @member\``,
              `- Reply pesan: reply pesan owner lalu ketik \`${prefix}owner -del\``,
              `- Input manual (format E.164): \`${prefix}owner -del 6281234567890\` / \`${prefix}owner -del +12025550123\``,
            ].join('\n')
          );
        }

        return await msg.reply(
          'Nomor telepon, LID, atau nomor urut tersebut tidak ditemukan dalam daftar owner.'
        );
      }

      const isPn = Boolean(
        res.pn || (res.targetDisplay && res.targetDisplay.length <= 14)
      );
      const displayLabel = res.pn
        ? `@${res.pn}`
        : res.targetDisplay
        ? isPn
          ? `@${res.targetDisplay}`
          : `LID \`${res.targetDisplay}\``
        : 'target';
      const mentions =
        isPn && res.targetDisplay
          ? [`${res.targetDisplay}@s.whatsapp.net`]
          : [];

      return await msg.reply(
        `Berhasil menghapus ${displayLabel} dari daftar owner bot.`,
        { mentions }
      );
    }

    // 3. Action: -list (List owners)
    if (isList) {
      const { owners } = await getOwnersFromDb();
      if (owners.length === 0) {
        return await msg.reply(
          '｢ *BOT OWNERS* ｣\nBelum ada owner tambahan yang terdaftar di database.\n\n_Gunakan `.owner -set <@user / nomor>` untuk menambahkan._'
        );
      }

      const groups = await groupOwners(owners, client, msg.chat);
      const mentions = [];
      const lines = [
        '｢ *BOT OWNERS* ｣',
        ...groups.map((g, idx) => {
          if (g.pn) {
            mentions.push(`${g.pn}@s.whatsapp.net`);
          }
          if (g.pn && g.lid) {
            return `${idx + 1}. @${g.pn} (LID: \`${g.lid}\`)`;
          }
          if (g.pn) {
            return `${idx + 1}. @${g.pn}`;
          }
          return `${idx + 1}. LID: \`${g.lid}\``;
        }),
        '',
        `Total: *${groups.length}* owner(s)`,
      ];

      if (msg.permissions?.sender?.isOwner) {
        lines.push(
          '',
          'Penggunaan:',
          '• `.owner -set <@user / nomor>`',
          '• `.owner -del <@user / nomor / index>`'
        );
      }

      return await msg.reply(lines.join('\n'), { mentions });
    }

    // Fallback: Unknown action
    return await msg.reply(
      '｢ *PENGGUNAAN OWNER* ｣\n• `.owner -set <@user / nomor>` : Tambah owner baru\n• `.owner -del <@user / nomor / index>` : Hapus owner\n• `.owner -list` : Tampilkan daftar owner'
    );
  },
});
