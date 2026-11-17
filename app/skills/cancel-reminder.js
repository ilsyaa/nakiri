import { defineSkill } from '#app/services/ai/skill.js';
import {
  deleteReminder,
  formatReminderTime,
  listReminders,
} from '#app/services/reminder.js';

/**
 * Format a short reminder line for disambiguation.
 *
 * @param {Record<string, any>} reminder
 * @returns {string}
 */
function reminderLine(reminder) {
  return `id ${reminder.id}: ${reminder.schedule_text || reminder.frequency} | ${reminder.message} | ${formatReminderTime(reminder)}`;
}

export default defineSkill({
  name: 'cancel_reminder',
  description:
    'Cancel one of the current user\'s reminders by id, or by a text match such as "bangun". Use only when the user clearly wants to remove a reminder.',
  parameters: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: 'Reminder id to delete, if the user provided one.',
      },
      match: {
        type: 'string',
        description:
          'Text to match against reminder message or schedule when the id is unknown.',
      },
    },
  },
  async execute(args, context) {
    const { msg, ctx } = context || {};
    const sessionId = ctx?.sessionId || process.env.SESSION_ID;
    if (!msg || !sessionId) {
      return 'Reminder cancellation is not available in this chat.';
    }

    const id = Number(args?.id || 0);
    if (Number.isInteger(id) && id > 0) {
      const deleted = await deleteReminder({
        id,
        sessionId,
        sender: msg.sender,
      });
      return deleted
        ? `Pengingat id ${id} dihapus.`
        : 'Pengingat tidak ditemukan.';
    }

    const match = String(args?.match || '')
      .trim()
      .toLowerCase();
    if (!match) {
      return 'Butuh id atau teks pengingat yang mau dihapus.';
    }

    const reminders = await listReminders({
      sessionId,
      sender: msg.sender,
    });
    const candidates = reminders.filter((reminder) => {
      const haystack =
        `${reminder.message || ''} ${reminder.schedule_text || ''}`.toLowerCase();
      return haystack.includes(match);
    });

    if (candidates.length === 0) {
      return 'Pengingat tidak ditemukan.';
    }

    if (candidates.length > 1) {
      return [
        'Ada beberapa pengingat yang cocok. Pilih id:',
        ...candidates.map((reminder) => `- ${reminderLine(reminder)}`),
      ].join('\n');
    }

    const deleted = await deleteReminder({
      id: candidates[0].id,
      sessionId,
      sender: msg.sender,
    });
    return deleted
      ? `Pengingat id ${candidates[0].id} dihapus.`
      : 'Gagal menghapus pengingat.';
  },
});
