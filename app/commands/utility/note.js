import { defineCommand } from '#app/services/bot/index.js';
import {
  MAX_NOTE_CONTENT_LENGTH,
  MAX_NOTE_NAME_LENGTH,
  MAX_NOTE_SEARCH,
  MAX_PERSONAL_NOTES,
  NOTE_SCOPE_PERSONAL,
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

export default defineCommand({
  name: 'note',
  aliases: ['note', 'notes'],
  category: 'utility',
  description: 'Save and read personal notes',

  async execute(payload, ctx) {
    const { msg } = ctx;
    if (!msg) return;

    const sessionId = ctx.sessionId;
    const cmd = msg.body?.command || 'note';
    const isGroup = Boolean(msg.flags?.isGroup);
    const { subcommand, rest } = splitNoteArgs(msg.body?.argsText);

    const sendGuide = () =>
      msg.reply(
        [
          '｢ *catatan pribadi* ｣',
          `• \`${cmd} save <nama> | <isi>\``,
          `• \`${cmd} save <nama>\` _(balas pesan)_`,
          `• \`${cmd} get <nama>\``,
          `• \`${cmd} list\``,
          `• \`${cmd} find <kata>\``,
          `• \`${cmd} del <nama>\``,
          '',
          '_Catatan pribadi hanya bisa dibaca di chat private._',
          '_Di grup, simpan catatan pribadi lewat reply pesan._',
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
      const { name, content: inlineContent } = splitNoteSaveInput(rest);
      const normalizedName = normalizeNoteName(name);
      if (!normalizedName) return invalidName();

      let content = inlineContent;

      if (isGroup) {
        if (!msg.quoted) {
          return msg.reply(
            'Di grup, catatan pribadi hanya bisa disimpan lewat reply pesan.'
          );
        }
        if (inlineContent) {
          return msg.reply(
            'Di grup, isi catatan diambil dari pesan yang dibalas.'
          );
        }
        content = String(msg.quoted.body?.rawText || '').trim();
      } else if (!content && msg.quoted) {
        content = String(msg.quoted.body?.rawText || '').trim();
      }

      if (!content) {
        return msg.reply(
          `Isi catatan wajib diisi, maksimal ${MAX_NOTE_CONTENT_LENGTH} karakter.`
        );
      }

      const result = await saveNote({
        sessionId,
        scope: NOTE_SCOPE_PERSONAL,
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
              `Batas ${MAX_PERSONAL_NOTES} catatan pribadi tercapai. Hapus salah satu dulu.`
            );
          default:
            return msg.reply('Gagal menyimpan catatan.');
        }
      }

      return msg.reply(
        [
          `｢ *catatan ${result.created ? 'disimpan' : 'diperbarui'}* ｣`,
          `• Nama: \`${result.note.name}\``,
          '• Scope: `pribadi`',
        ].join('\n')
      );
    }

    // Every read or delete operation exposes private note data.
    if (isGroup) {
      return msg.reply('Only in Private Chat!');
    }

    if (subcommand === 'list' || subcommand === 'ls') {
      const notes = await listNotes({
        sessionId,
        scope: NOTE_SCOPE_PERSONAL,
        sender: msg.sender,
      });

      if (notes.length === 0) {
        return msg.reply('Belum ada catatan pribadi.');
      }

      const lines = notes.map(
        (note) =>
          `• \`${note.name}\` — ${formatNotePreview(note.content)} _(${formatNoteTime(note)})_`
      );

      return msg.reply(
        [
          '｢ *catatan pribadi* ｣',
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
        scope: NOTE_SCOPE_PERSONAL,
        sender: msg.sender,
        query,
        limit: MAX_NOTE_SEARCH,
      });

      if (notes.length === 0) {
        return msg.reply(`Tidak ada catatan yang cocok dengan \`${query}\`.`);
      }

      const lines = notes.map(
        (note) =>
          `• \`${note.name}\` — ${formatNotePreview(note.content)} _(${formatNoteTime(note)})_`
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
      const name = normalizeNoteName(rest);
      if (!name) {
        return msg.reply(`Gunakan \`${cmd} del <nama>\`.`);
      }

      const deleted = await deleteNote({
        sessionId,
        scope: NOTE_SCOPE_PERSONAL,
        sender: msg.sender,
        name,
      });

      return msg.reply(
        deleted
          ? `Catatan \`${name}\` dihapus.`
          : `Catatan \`${name}\` tidak ditemukan.`
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
      scope: NOTE_SCOPE_PERSONAL,
      sender: msg.sender,
      name,
    });

    if (!note) {
      return msg.reply(`Catatan \`${name}\` tidak ditemukan.`);
    }

    return msg.reply(
      [
        `｢ *${note.name}* ｣`,
        note.content,
        '',
        `_Diperbarui ${formatNoteTime(note)}_`,
      ].join('\n'),
      { autoMention: false }
    );
  },
});
