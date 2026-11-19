/**
 * Split the raw command argument text into a subcommand and the remaining text.
 *
 * @param {string | null | undefined} argsText
 * @returns {{ subcommand: string, rest: string }}
 */
export function splitNoteArgs(argsText) {
  const text = String(argsText || '').trim();
  if (!text) return { subcommand: '', rest: '' };

  const [head, ...tail] = text.split(/\s+/);
  return {
    subcommand: (head || '').toLowerCase(),
    rest: tail.join(' ').trim(),
  };
}

/**
 * Split `save <name> | <content>` input at the first pipe.
 *
 * @param {string | null | undefined} input
 * @returns {{ name: string, content: string }}
 */
export function splitNoteSaveInput(input) {
  const text = String(input || '').trim();
  const pipeIndex = text.indexOf('|');

  if (pipeIndex === -1) {
    return { name: text, content: '' };
  }

  return {
    name: text.slice(0, pipeIndex).trim(),
    content: text.slice(pipeIndex + 1).trim(),
  };
}

export default {
  splitNoteArgs,
  splitNoteSaveInput,
};
