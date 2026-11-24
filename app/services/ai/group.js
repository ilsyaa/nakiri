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
            `Tag wajib disertakan: ${tags.join(' ')}`,
          ].join('\n'),
        },
      ],
      {
        temperature: 0.85,
        maxTokens: 500,
        enableWebSearch: false,
      }
    );

    const text = normalizeOutput(content);
    if (!text) return fallbackText;

    const hasAllTags = tags.every((tag) => text.includes(tag));
    return hasAllTags ? text : fallbackText;
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
            ...(targetTag ? [`Tag wajib disertakan: ${targetTag}`] : []),
            ...(reason ? [`Alasan: ${reason}`] : []),
          ].join('\n'),
        },
      ],
      {
        temperature: 0.85,
        maxTokens: 500,
        enableWebSearch: false,
      }
    );

    const text = normalizeOutput(content);
    if (!text) return fallbackText;
    if (!text.includes(ratio)) return fallbackText;
    if (targetTag && !text.includes(targetTag)) return fallbackText;

    return text;
  } catch (err) {
    logger.error(
      '[GROUP_AI]',
      `Failed to compose warning message: ${err.message}`
    );
    return fallbackText;
  }
}
