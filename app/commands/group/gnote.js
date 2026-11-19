import { defineCommand } from '#app/services/bot/index.js';
import {
  MAX_GROUP_NOTES,
  MAX_NOTE_CONTENT_LENGTH,
  MAX_NOTE_NAME_LENGTH,
  MAX_NOTE_SEARCH,
  NOTE_SCOPE_GROUP,
  deleteNote,
  formatNotePreview,
  formatNoteTime,
  getNote,
  listNotes,
  normalizeNoteName,
  saveNote,
} from '#app/services/note.js';
import {
  splitNoteArgs,
  splitNoteSaveInput,
} from '#app/utils/note-input.js';

/**
 * @param {any} msg
 * @returns {boolean}
 */
function isGroupAdmin(msg) {
  return Boolean(
    msg?.permissions?.sender?.admin ||
      msg?.permissions?.sender?.superAdmin ||
      msg?.permissions?.sender?.isOwner
  );
}

export default defineCommand({
  name: 'gnote',
  aliases: ['gnote', 'gnotes'],
  category: 'group',
  description: 'Save and read notes shared with the group',
  middlewares: ['group'],

  async execute(payload, ctx) {
    const { msg } = ctx;
    if (!msg) return;

    const sessionId = ctx.sessionId;
    const cmd = msg.body?.command || 'gnote';
    const { subcommand, rest } = splitNoteArgs(msg.body?.argsText);

    const sendGuide = () =>
      msg.reply(
        [
          '｢ *catatan grup* ｣',
          `• \`${cmd} save <nama> | <isi>\``,
          `• \`${cmd} save <nama>\` _(balas pesan)_`,
          `• \`${cmd} get <nama>\``,
          `• \`${cmd} list\``,
          `• \`${cmd} find <kata>\``,
          `• \`${cmd} del <nama>\``,
          '',
          '_Hanya admin yang dapat menyimpan atau menghapus catatan grup._',
        ].join('\n')
      );

    if (!sessionId) {
      return msg.reply('Catatan tidak tersedia di chat ini.');
    }

    if (!subcommand || subcommand === 'help' || subcommand === 'guide') {
      return sendGuide();
    }

    const invalidName = () =>
      msg.reply(
        `Nama catatan tidak valid. Gunakan huruf, angka, tanda hubung, atau garis bawah, maksimal ${MAX_NOTE_NAME_LENGTH} karakter.`
      );

    if (
      subcommand === 'save' ||
      subcommand === 'add' ||
      subcommand === 'set'
    ) {
      if (!isGroupAdmin(msg)) {
        return msg.reply('Only Admin!');
      }

      const { name, content: inlineContent } = splitNoteSaveInput(rest);
      const normalizedName = normalizeNoteName(name);
      if (!normalizedName) return invalidName();

      const content =
        inlineContent || String(msg.quoted?.body?.rawText || '').trim();

      if (!content) {
        return msg.reply(
          `Isi catatan wajib diisi, maksimal ${MAX_NOTE_CONTENT_LENGTH} karakter.`
        );
      }

      const result = await saveNote({
        sessionId,
        scope: NOTE_SCOPE_GROUP,
        chatJid: msg.chat,
        sender: msg.sender,
        senderName: ctx.tableGroupMember?.pushname || msg.sender?.name || null,
        name: normalizedName,
        content,
      });

      if (!result.ok) {
        switch (result.error) {
          case 'invalid_name':
            return invalidName();
          case 'reserved_name':
            return msg.reply(
              `Nama \`${normalizedName}\` dipakai subcommand. Pilih nama lain.`
            );
          case 'invalid_content':
            return msg.reply(
              `Isi catatan wajib diisi, maksimal ${MAX_NOTE_CONTENT_LENGTH} karakter.`
            );
          case 'limit':
            return msg.reply(
              `Batas ${MAX_GROUP_NOTES} catatan grup tercapai. Hapus salah satu dulu.`
            );
          default:
            return msg.reply('Gagal menyimpan catatan grup.');
        }
      }

      return msg.reply(
        [
          `｢ *catatan grup ${result.created ? 'disimpan' : 'diperbarui'}* ｣`,
          `• Nama: \`${result.note.name}\``,
        ].join('\n')
      );
    }

    if (subcommand === 'list' || subcommand === 'ls') {
      const notes = await listNotes({
        sessionId,
        scope: NOTE_SCOPE_GROUP,
        chatJid: msg.chat,
        sender: msg.sender,
      });

      if (notes.length === 0) {
        return msg.reply('Belum ada catatan grup.');
      }

      const lines = notes.map(
        (note) =>
          `• \`${note.name}\` — ${formatNotePreview(note.content)} _(${note.author_name || 'admin'} · ${formatNoteTime(note)})_`
      );

      return msg.reply(
        [
          '｢ *catatan grup* ｣',
          `Total: *${notes.length}*`,
          '',
          ...lines,
        ].join('\n')
      );
    }

    if (subcommand === 'find' || subcommand === 'search') {
      const query = rest;
      if (!query) {
        return msg.reply(`Gunakan \`${cmd} find <kata>\`.`);
      }

      const notes = await listNotes({
        sessionId,
        scope: NOTE_SCOPE_GROUP,
        chatJid: msg.chat,
        sender: msg.sender,
        query,
        limit: MAX_NOTE_SEARCH,
      });

      if (notes.length === 0) {
        return msg.reply(`Tidak ada catatan yang cocok dengan \`${query}\`.`);
      }

      const lines = notes.map(
        (note) =>
          `• \`${note.name}\` — ${formatNotePreview(note.content)} _(${note.author_name || 'admin'} · ${formatNoteTime(note)})_`
      );

      return msg.reply(
        [
          '｢ *hasil pencarian* ｣',
          `Kata kunci: \`${query}\``,
          '',
          ...lines,
        ].join('\n')
      );
    }

    if (
      subcommand === 'del' ||
      subcommand === 'delete' ||
      subcommand === 'remove'
    ) {
      if (!isGroupAdmin(msg)) {
        return msg.reply('Only Admin!');
      }

      const name = normalizeNoteName(rest);
      if (!name) {
        return msg.reply(`Gunakan \`${cmd} del <nama>\`.`);
      }

      const deleted = await deleteNote({
        sessionId,
        scope: NOTE_SCOPE_GROUP,
        chatJid: msg.chat,
        sender: msg.sender,
        name,
      });

      return msg.reply(
        deleted
          ? `Catatan grup \`${name}\` dihapus.`
          : `Catatan grup \`${name}\` tidak ditemukan.`
      );
    }

    const rawName =
      subcommand === 'get' || subcommand === 'show'
        ? rest
        : msg.body?.argsText || '';
    const name = normalizeNoteName(rawName);
    if (!name) return sendGuide();

    const note = await getNote({
      sessionId,
      scope: NOTE_SCOPE_GROUP,
      chatJid: msg.chat,
      sender: msg.sender,
      name,
    });

    if (!note) {
      return msg.reply(`Catatan grup \`${name}\` tidak ditemukan.`);
    }

    return msg.reply(
      [
        `｢ *${note.name}* ｣`,
        note.content,
        '',
        `_Oleh ${note.author_name || 'admin'} · ${formatNoteTime(note)}_`,
      ].join('\n'),
      { autoMention: false }
    );
  },
});
