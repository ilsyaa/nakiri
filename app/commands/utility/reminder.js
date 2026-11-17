import { defineCommand } from '#app/services/bot/index.js';
import {
  MAX_ACTIVE_REMINDERS,
  MAX_CALL_SECONDS,
  MAX_REMINDER_MESSAGE_LENGTH,
  createReminder,
  deleteReminder,
  formatReminderTime,
  listReminders,
  updateReminderStatus,
} from '#app/services/reminder.js';

/**
 * Extract and strip the --ai flag from reminder input.
 *
 * @param {string} text
 * @returns {{ text: string, ai: boolean }}
 */
function extractAiFlag(text) {
  const ai = /(?:^|\s)--ai(?=\s|$)/i.test(text);
  return {
    ai,
    text: text.replace(/(?:^|\s)--ai(?=\s|$)/gi, ' ').trim(),
  };
}

/**
 * Extract and strip the --call=<seconds> flag from reminder input.
 *
 * @param {string} text
 * @returns {{ text: string, callSeconds: number }}
 */
function extractCallFlag(text) {
  const match = text.match(/--call(?:=|\s+)(\d+)/i);
  return {
    callSeconds: match ? Number(match[1]) : 0,
    text: text.replace(/--call(?:=|\s+)\d+/gi, ' ').trim(),
  };
}

/**
 * Shorten a reminder message for list output.
 *
 * @param {string} message
 * @returns {string}
 */
function shorten(message) {
  const text = String(message || '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 40 ? `${text.slice(0, 40)}...` : text;
}

export default defineCommand({
  name: 'reminder',
  aliases: ['remind', 'reminder', 'alarm'],
  category: 'utility',
  description: 'Create, list, pause, and delete personal reminders',

  async execute(payload, ctx) {
    const { msg } = ctx;
    if (!msg) return;

    const prefix = msg.body?.prefix || '.';
    const cmd = msg.body?.command || `${prefix}remind`;
    const argsText = (msg.body?.argsText || '').trim();
    const [subcommandRaw] = argsText.split(/\s+/);
    const subcommand = (subcommandRaw || '').toLowerCase();

    const sendGuide = () =>
      msg.reply(
        [
          '｢ *pengingat* ｣',
          `• \`${cmd} 10m | minum obat\``,
          `• \`${cmd} 20:30 | olahraga\``,
          `• \`${cmd} 2026-11-18 08:00 | bayar kos\``,
          `• \`${cmd} daily 08:00 | minum obat\``,
          `• \`${cmd} monthly 1 09:00 | bayar kos\``,
          `• \`${cmd} daily 08:00 --ai | ingetin minum obat\``,
          `• \`${cmd} 10m --call=5 | bangunin gue\``,
          `• \`${cmd} daily 08:00 --call=5 --ai | ingetin minum obat\``,
          '',
          `• \`${cmd} list\``,
          `• \`${cmd} pause <id>\``,
          `• \`${cmd} resume <id>\``,
          `• \`${cmd} del <id>\``,
          '',
          `_Flag \`--ai\` membuat pesan dirapikan Nakiri. \`--call=N\` miscall N detik dulu, lalu kirim pesan._`,
          `_Di grup, \`--call\` mengirim pesan ke DM pembuat, bukan ke grup._`,
        ].join('\n')
      );

    if (!argsText || subcommand === 'help' || subcommand === 'guide') {
      return sendGuide();
    }

    if (subcommand === 'list' || subcommand === 'ls') {
      const reminders = await listReminders({
        sessionId: ctx.sessionId,
        sender: msg.sender,
      });

      if (reminders.length === 0) {
        return msg.reply('Belum ada pengingat aktif.');
      }

      const lines = reminders.map((reminder) => {
        const mode = reminder.mode === 'ai' ? 'AI' : 'static';
        const call = reminder.call_seconds
          ? ` | call ${reminder.call_seconds}s`
          : '';
        const status = reminder.status === 'paused' ? ' | paused' : '';
        return `• \`${reminder.id}\` ${reminder.schedule_text || reminder.frequency} | ${shorten(reminder.message)} | ${mode}${call}${status} | ${formatReminderTime(reminder)}`;
      });

      return msg.reply(['｢ *pengingat kamu* ｣', ...lines].join('\n'));
    }

    if (subcommand === 'pause' || subcommand === 'resume') {
      const id = Number.parseInt(argsText.split(/\s+/)[1] || '', 10);
      if (!Number.isInteger(id) || id <= 0) {
        return msg.reply(`Gunakan \`${cmd} ${subcommand} <id>\`.`);
      }

      const status = subcommand === 'pause' ? 'paused' : 'active';
      const updated = await updateReminderStatus({
        id,
        sessionId: ctx.sessionId,
        sender: msg.sender,
        status,
      });

      if (!updated) {
        return msg.reply('Pengingat tidak ditemukan.');
      }

      return msg.reply(
        `Pengingat \`${id}\` ${status === 'paused' ? 'dijeda' : 'diaktifkan kembali'}.`
      );
    }

    if (
      subcommand === 'del' ||
      subcommand === 'delete' ||
      subcommand === 'hapus'
    ) {
      const id = Number.parseInt(argsText.split(/\s+/)[1] || '', 10);
      if (!Number.isInteger(id) || id <= 0) {
        return msg.reply(`Gunakan \`${cmd} del <id>\`.`);
      }

      const deleted = await deleteReminder({
        id,
        sessionId: ctx.sessionId,
        sender: msg.sender,
      });

      if (!deleted) {
        return msg.reply('Pengingat tidak ditemukan.');
      }

      return msg.reply(`Pengingat \`${id}\` dihapus.`);
    }

    const pipeIndex = argsText.indexOf('|');
    if (pipeIndex === -1) {
      return sendGuide();
    }

    const scheduleAi = extractAiFlag(argsText.slice(0, pipeIndex));
    const messageAi = extractAiFlag(argsText.slice(pipeIndex + 1));
    const schedulePart = extractCallFlag(scheduleAi.text);
    const messagePart = extractCallFlag(messageAi.text);
    const ai = scheduleAi.ai || messageAi.ai;
    const callSeconds = schedulePart.callSeconds || messagePart.callSeconds;
    const schedule = schedulePart.text;
    const message = messagePart.text;

    if (!schedule || !message) {
      return sendGuide();
    }

    if (callSeconds < 0 || callSeconds > MAX_CALL_SECONDS) {
      return msg.reply(`Durasi miscall harus 1-${MAX_CALL_SECONDS} detik.`);
    }

    if (message.length > MAX_REMINDER_MESSAGE_LENGTH) {
      return msg.reply(
        `Pesan pengingat maksimal ${MAX_REMINDER_MESSAGE_LENGTH} karakter.`
      );
    }

    const result = await createReminder({
      sessionId: ctx.sessionId,
      chatJid: msg.chat,
      sender: msg.sender,
      senderName: ctx.tableGroupMember?.pushname || msg.sender?.name || null,
      message,
      schedule,
      ai,
      callSeconds,
    });

    if (!result.ok) {
      if (result.error === 'limit') {
        return msg.reply(
          `Batas ${MAX_ACTIVE_REMINDERS} pengingat aktif tercapai. Hapus salah satu dulu.`
        );
      }
      if (result.error === 'invalid_schedule') {
        return msg.reply('Format jadwal tidak valid.');
      }
      if (result.error === 'invalid_message') {
        return msg.reply(
          `Pesan pengingat wajib diisi, maksimal ${MAX_REMINDER_MESSAGE_LENGTH} karakter.`
        );
      }
      if (result.error === 'invalid_call_seconds') {
        return msg.reply(`Durasi miscall harus 1-${MAX_CALL_SECONDS} detik.`);
      }
      if (result.error === 'call_requires_pn') {
        return msg.reply(
          'Miscall butuh nomor WhatsApp (PN), bukan LID. Coba dari chat private.'
        );
      }
      return msg.reply('Gagal membuat pengingat.');
    }

    const reminder = result.reminder;
    return msg.reply(
      [
        '｢ *pengingat dibuat* ｣',
        `• ID: \`${reminder.id}\``,
        `• Jadwal: \`${reminder.schedule_text}\``,
        `• Pesan: ${reminder.message}`,
        `• Berikutnya: \`${formatReminderTime(reminder)}\``,
        `• Mode: \`${reminder.mode === 'ai' ? 'AI Nakiri' : 'static'}\``,
        ...(reminder.call_seconds
          ? [`• Miscall: \`${reminder.call_seconds} detik\``]
          : []),
      ].join('\n')
    );
  },
});
