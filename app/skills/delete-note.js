import { defineSkill } from '#app/services/ai/skill.js';
import {
  deleteNote,
  normalizeNoteName,
} from '#app/services/note.js';
import {
  getNoteSkillSession,
  isGroupAdmin,
  validateNoteReadScope,
} from './note-context.js';

export default defineSkill({
  name: 'delete_note',
  description:
    'Delete a saved note by name. Use scope "personal" for the current user\'s private notes; use scope "group" for the current group\'s shared notes. Group notes can only be deleted by group admins.',
  parameters: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Note name to delete.',
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

    const scopeCheck = validateNoteReadScope(args?.scope, msg);
    if (scopeCheck.error) return scopeCheck.error;
    const scope = scopeCheck.scope;

    if (scope === 'group' && !isGroupAdmin(msg)) {
      return 'Only group admins can delete group notes.';
    }

    const name = normalizeNoteName(args?.name);
    if (!name) return 'Invalid note name.';

    const deleted = await deleteNote({
      sessionId,
      scope,
      chatJid: msg.chat,
      sender: msg.sender,
      name,
    });

    return deleted
      ? `Deleted ${scope} note "${name}".`
      : `Note "${name}" not found.`;
  },
});
