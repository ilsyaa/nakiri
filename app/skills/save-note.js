import { defineSkill } from '#app/services/ai/skill.js';
import {
  MAX_NOTE_CONTENT_LENGTH,
  MAX_NOTE_NAME_LENGTH,
  MAX_PERSONAL_NOTES,
  MAX_GROUP_NOTES,
  normalizeNoteName,
  saveNote,
} from '#app/services/note.js';
import {
  getNoteSkillSession,
  isGroupAdmin,
  quotedNoteText,
} from './note-context.js';

export default defineSkill({
  name: 'save_note',
  description:
    'Save or update a named note. Use scope "personal" for the current user\'s private notes; use scope "group" for notes shared with the current group. Personal notes in a group can only be saved by replying to a message. Group notes can only be written by group admins.',
  parameters: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: `Short note name, maximum ${MAX_NOTE_NAME_LENGTH} characters. Examples: "deploy", "wifi-kos".`,
      },
      content: {
        type: 'string',
        description: `Note content, maximum ${MAX_NOTE_CONTENT_LENGTH} characters. Omit when the user replied to the message that should be saved.`,
      },
      scope: {
        type: 'string',
        enum: ['personal', 'group'],
        description:
          'Personal notes belong only to the current user. Group notes are shared with everyone in the current group.',
      },
    },
    required: ['name', 'scope'],
  },
  async execute(args, context) {
    const { msg, ctx } = context || {};
    const sessionId = getNoteSkillSession(ctx);
    if (!msg || !sessionId) {
      return 'Notes are not available in this chat.';
    }

    const scope = String(args?.scope || '').toLowerCase();
    if (scope !== 'personal' && scope !== 'group') {
      return 'Scope must be "personal" or "group".';
    }

    const name = normalizeNoteName(args?.name);
    if (!name) {
      return `Invalid note name. Use letters, numbers, hyphen, or underscore, maximum ${MAX_NOTE_NAME_LENGTH} characters.`;
    }

    let content = String(args?.content || '').trim();

    if (scope === 'personal' && msg.flags?.isGroup) {
      if (!msg.quoted) {
        return 'Personal notes in a group can only be saved by replying to a message.';
      }
      content = quotedNoteText(msg);
    } else if (!content) {
      content = quotedNoteText(msg);
    }

    if (!content) {
      return `Note content is required, maximum ${MAX_NOTE_CONTENT_LENGTH} characters.`;
    }

    if (scope === 'group') {
      if (!msg.flags?.isGroup) {
        return 'Group notes can only be saved in a group chat.';
      }
      if (!isGroupAdmin(msg)) {
        return 'Only group admins can save group notes.';
      }
    }

    const result = await saveNote({
      sessionId,
      scope,
      chatJid: msg.chat,
      sender: msg.sender,
      senderName: ctx?.tableGroupMember?.pushname || msg.sender?.name || null,
      name,
      content,
    });

    if (!result.ok) {
      switch (result.error) {
        case 'reserved_name':
          return `"${name}" is a reserved subcommand name. Choose another note name.`;
        case 'invalid_content':
          return `Note content is required, maximum ${MAX_NOTE_CONTENT_LENGTH} characters.`;
        case 'limit':
          return `The ${scope} note limit has been reached (${scope === 'group' ? MAX_GROUP_NOTES : MAX_PERSONAL_NOTES}). Delete a note first.`;
        default:
          return 'Failed to save the note.';
      }
    }

    return `${result.created ? 'Saved' : 'Updated'} ${scope} note "${result.note.name}".`;
  },
});
