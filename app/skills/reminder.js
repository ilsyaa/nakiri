import { defineSkill } from '#app/services/ai/skill.js';
import {
  MAX_REMINDER_MESSAGE_LENGTH,
  createReminder,
  formatReminderTime,
} from '#app/services/reminder.js';

export default defineSkill({
  name: 'create_reminder',
  description:
    'Create a WhatsApp reminder for the current user in this chat. Use when the user asks to be reminded about something. Supports one-time, daily, and monthly schedules.',
  parameters: {
    type: 'object',
    properties: {
      schedule: {
        type: 'string',
        description:
          'Reminder schedule. Examples: "10m", "2h", "20:30", "2026-11-18 08:00", "daily 08:00", "monthly 1 09:00".',
      },
      message: {
        type: 'string',
        description: `The reminder intent or exact message, maximum ${MAX_REMINDER_MESSAGE_LENGTH} characters. Write it as the message that should reach the user, for example "bangun, udah waktunya" instead of "bangunin dia".`,
      },
      ai: {
        type: 'boolean',
        description:
          'Set true when the user wants Nakiri to rewrite the reminder naturally at delivery time instead of sending the exact static text.',
      },
      call_seconds: {
        type: 'integer',
        minimum: 1,
        maximum: 30,
        description:
          'If the user asks to be called or miscalled, ring for this many seconds before sending the reminder text. Omit for message-only reminders.',
      },
    },
    required: ['schedule', 'message'],
  },
  async execute(args, context) {
    const { msg, ctx } = context || {};
    const sessionId = ctx?.sessionId || process.env.SESSION_ID;
    if (!msg || !sessionId) {
      return 'Reminder skill is not available in this chat.';
    }

    const result = await createReminder({
      sessionId,
      chatJid: msg.chat,
      sender: msg.sender,
      senderName: ctx?.tableGroupMember?.pushname || msg.sender?.name || null,
      message: args?.message,
      schedule: args?.schedule,
      ai: Boolean(args?.ai),
      callSeconds: Number(args?.call_seconds || 0),
    });

    if (!result.ok) {
      if (result.error === 'limit') {
        return 'The user already reached the active reminder limit.';
      }
      if (result.error === 'invalid_schedule') {
        return 'Invalid schedule format. Use a supported example.';
      }
      if (result.error === 'invalid_message') {
        return `Reminder message must be 1-${MAX_REMINDER_MESSAGE_LENGTH} characters.`;
      }
      if (result.error === 'invalid_call_seconds') {
        return 'Invalid miscall duration. Use 1-30 seconds.';
      }
      if (result.error === 'call_requires_pn') {
        return 'Miscall requires a phone-number JID, not a LID.';
      }
      return 'Failed to create the reminder.';
    }

    const reminder = result.reminder;
    const callDetail = reminder.call_seconds
      ? ` Miscall: ${reminder.call_seconds}s.`
      : '';
    return `Reminder scheduled. Next trigger: ${formatReminderTime(reminder)}.${callDetail} Reply to the user naturally in Nakiri's voice, in one short sentence. Do not mention the id or technical fields unless the user asks.`;
  },
});
