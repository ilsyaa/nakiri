import { defineSkill } from '#app/services/ai/skill.js';
import {
  MAX_NOTE_LIST,
  formatNotePreview,
  formatNoteTime,
  listNotes,
} from '#app/services/note.js';
import {
  getNoteSkillSession,
  validateNoteReadScope,
} from './note-context.js';

export default defineSkill({
  name: 'list_notes',
  description:
    'List saved notes, optionally filtered by a search query. Use scope "personal" for the current user\'s private notes; use scope "group" for the current group\'s shared notes. Personal notes cannot be listed in a group.',
  parameters: {
    type: 'object',
    properties: {
      scope: {
        type: 'string',
        enum: ['personal', 'group'],
        description:
          'Personal notes belong only to the current user. Group notes are shared with everyone in the current group.',
      },
      query: {
        type: 'string',
        description:
          'Optional text to match against note names and content, for example "wifi" or "deploy".',
      },
    },
    required: ['scope'],
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

    const query = String(args?.query || '').trim();
    const notes = await listNotes({
      sessionId,
      scope,
      chatJid: msg.chat,
      sender: msg.sender,
      query,
      limit: MAX_NOTE_LIST,
    });

    if (notes.length === 0) {
      return query
        ? `No ${scope} notes matched "${query}".`
        : `No ${scope} notes found.`;
    }

    const lines = notes.map(
      (note) =>
        `- ${note.name}: ${formatNotePreview(note.content, 80)} (updated ${formatNoteTime(note)})`
    );

    return [`${scope} notes (${notes.length}):`, ...lines].join('\n');
  },
});
