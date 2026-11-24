import logger from '@nakiri/core/utils/logger';
import { createChatCompletion } from './client.js';
import { buildGroupActionSystemPrompt } from './persona.js';

/**
 * Normalize single-line AI output for group notifications.
 *
 * @param {string} raw
 * @returns {string}
 */
function normalizeOutput(raw) {
  return String(raw || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 400);
}

/**
 * Replace `@mention` / `@mentionN` placeholders with real `@digits` tags.
 * Returns `null` if any required tag cannot be placed.
 *
 * @param {string} text
 * @param {string[]} tags
 * @returns {string | null}
 */
function applyMentionPlaceholders(text, tags) {
  if (!tags || tags.length === 0) return text;

  let result = text;
  if (tags.length === 1) {
    result = result.replace(/@mention1?\b|\{mention1?\}/gi, tags[0]);
    if (!result.includes(tags[0])) {
      result = `${tags[0]} ${result}`;
    }
    return result;
  }

  result = result.replace(
    /@mention(\d+)\b|\{mention(\d+)\}/gi,
    (match, idx1, idx2) => {
      const idx = Number(idx1 || idx2) - 1;
      return idx >= 0 && idx < tags.length ? tags[idx] : match;
    }
  );

  const hasAllTags = tags.every((tag) => result.includes(tag));
  return hasAllTags ? result : null;
}

/**
 * Compose an AI welcome or goodbye message in Nakiri's persona voice.
 * Falls back to `fallbackText` if the AI call fails or drops required tags.
 *
 * @param {{
 *   kind: 'welcome' | 'goodbye',
 *   groupSubject: string,
 *   tags: string[],
 *   fallbackText: string
 * }} options
 * @returns {Promise<string>}
 */
export async function composeGreetingMessage({
  kind,
  groupSubject,
  tags,
  fallbackText,
}) {
  const placeholders =
    tags.length === 1
      ? ['@mention']
      : tags.map((_, index) => `@mention${index + 1}`);

  try {
    const content = await createChatCompletion(
      [
        {
          role: 'system',
          content: buildGroupActionSystemPrompt(kind),
        },
        {
          role: 'user',
          content: [
            `Aksi: ${kind === 'welcome' ? 'member baru masuk' : 'member keluar'}`,
            `Nama grup: ${groupSubject}`,
            `Placeholder tag wajib: ${placeholders.join(' ')}`,
          ].join('\n'),
        },
      ],
      {
        temperature: 0.95,
        maxTokens: 500,
        enableWebSearch: false,
      }
    );

    const text = normalizeOutput(content);
    if (!text) return fallbackText;

    return applyMentionPlaceholders(text, tags) || fallbackText;
  } catch (err) {
    logger.error(
      '[GROUP_AI]',
      `Failed to compose ${kind} message: ${err.message}`
    );
    return fallbackText;
  }
}

/**
 * Compose an AI warning or max-warn kick message in Nakiri's persona voice.
 * Falls back to `fallbackText` if the AI call fails or omits the warn ratio.
 *
 * @param {{
 *   currentWarn: number,
 *   maxWarn: number,
 *   kicked?: boolean,
 *   kickFailed?: boolean,
 *   reason?: string | null,
 *   targetTag?: string | null,
 *   fallbackText: string
 * }} options
 * @returns {Promise<string>}
 */
export async function composeWarningMessage({
  currentWarn,
  maxWarn,
  kicked = false,
  kickFailed = false,
  reason = null,
  targetTag = null,
  fallbackText,
}) {
  const ratio = `${currentWarn}/${maxWarn}`;
  const status = kicked
    ? 'dikeluarkan dari grup karena mencapai batas peringatan'
    : kickFailed
      ? 'mencapai batas peringatan tetapi gagal dikeluarkan dari grup'
      : 'mendapat peringatan';

  try {
    const content = await createChatCompletion(
      [
        {
          role: 'system',
          content: buildGroupActionSystemPrompt('warn'),
        },
        {
          role: 'user',
          content: [
            `Status: ${status}`,
            `Peringatan: ${ratio}`,
            ...(targetTag ? ['Placeholder tag wajib: @mention'] : []),
            ...(reason ? [`Alasan: ${reason}`] : []),
          ].join('\n'),
        },
      ],
      {
        temperature: 0.95,
        maxTokens: 500,
        enableWebSearch: false,
      }
    );

    const text = normalizeOutput(content);
    if (!text || !text.includes(ratio)) return fallbackText;

    if (targetTag) {
      return applyMentionPlaceholders(text, [targetTag]) || fallbackText;
    }

    return text;
  } catch (err) {
    logger.error(
      '[GROUP_AI]',
      `Failed to compose warning message: ${err.message}`
    );
    return fallbackText;
  }
}
