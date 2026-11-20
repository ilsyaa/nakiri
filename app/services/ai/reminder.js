import logger from '@nakiri/core/utils/logger';
import { DateTime } from 'luxon';
import { createChatCompletion } from './client.js';
import { buildReminderSystemPrompt } from './persona.js';

/**
 * Compose a natural reminder message in the shared persona voice.
 * Falls back to the original message when the AI call fails.
 *
 * @param {{ message: string, senderName?: string | null, timezone?: string, personaModes?: string[] }} options
 * @returns {Promise<string>}
 */
export async function composeReminderMessage({
  message,
  senderName = null,
  timezone = 'Asia/Jakarta',
  personaModes = [],
}) {
  const intent = String(message || '').trim();
  if (!intent) return intent;

  const now = DateTime.now().setZone(timezone).toFormat('HH:mm');

  try {
    const content = await createChatCompletion(
      [
        {
          role: 'system',
          content: buildReminderSystemPrompt({ personaModes }),
        },
        {
          role: 'user',
          content: `Nama penerima: ${senderName || 'lu'}\nSekarang: ${now}\nInti pengingat: ${intent}`,
        },
      ],
      {
        temperature: 0.85,
        // Reasoning-capable models can spend the entire budget before content.
        maxTokens: 500,
        enableWebSearch: false,
      }
    );

    const text = String(content || '')
      .replace(/\s+/g, ' ')
      .trim();

    return text ? text.slice(0, 400) : intent;
  } catch (err) {
    logger.error('[REMINDER_AI]', `Failed to compose reminder: ${err.message}`);
    return intent;
  }
}

export default composeReminderMessage;
