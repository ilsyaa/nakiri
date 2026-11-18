import { createChatCompletion } from './client.js';
import { buildSummarySystemPrompt } from './persona.js';

/**
 * Generate AI summary from chat transcript
 *
 * @param {string} chatTranscript
 * @param {object} [options]
 * @returns {Promise<string>}
 */
export async function summarizeChat(chatTranscript, options = {}) {
  if (!chatTranscript || !chatTranscript.trim()) {
    throw new Error('Chat transcript is empty');
  }

  /** @type {Array<{ role: 'system' | 'user' | 'assistant', content: string }>} */
  const messages = [
    { role: 'system', content: buildSummarySystemPrompt() },
    {
      role: 'user',
      content: `Berikut adalah log transkrip obrolan grup WhatsApp:\n\n${chatTranscript}\n\nTolong buatkan rangkuman terstruktur sesuai panduan.`,
    },
  ];

  return createChatCompletion(messages, {
    temperature: 0.4,
    ...options,
  });
}
