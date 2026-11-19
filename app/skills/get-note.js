import { defineSkill } from '#app/services/ai/skill.js';
import {
  formatNoteTime,
  getNote,
  normalizeNoteName,
} from '#app/services/note.js';
import {
  getNoteSkillSession,
  validateNoteReadScope,
} from './note-context.js';

export default defineSkill({
  name: 'get_note',
  description:
    'Read one saved note by name. Use scope "personal" for the current user\'s private notes; use scope "group" for the current group\'s shared notes. Personal notes cannot be read in a group.',
  parameters: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Note name to read, for example "deploy" or "wifi-kos".',
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

    const name = normalizeNoteName(args?.name);
    if (!name) return 'Invalid note name.';

    const note = await getNote({
      sessionId,
      scope,
      chatJid: msg.chat,
      sender: msg.sender,
      name,
    });

    if (!note) {
      return `Note "${name}" not found.`;
    }

    const lines = [`Note "${note.name}" (${scope})`];
    if (scope === 'group') {
      lines.push(
        `Author: ${note.author_name || 'unknown'}`,
        `Updated: ${formatNoteTime(note)}`
      );
    }
    lines.push('', note.content);

    return lines.join('\n');
  },
});
