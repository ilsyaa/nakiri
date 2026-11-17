import logger from '@nakiri/core/utils/logger';
import { DateTime } from 'luxon';
import { createChatCompletion } from './client.js';

const SYSTEM_PROMPT = `Kamu Nakiri, cewek 20 tahun, teman chat santai di WhatsApp.
Buat SATU pesan pengingat langsung kepada penerima berdasarkan inti yang diberikan.
Aturan:
- 1-2 kalimat pendek, bahasa Indonesia santai, dominan lowercase.
- Tulis sebagai pesan yang kamu ucapkan langsung ke penerima. Pakai "lu" atau nama penerima.
- DILARANG menulis dalam bentuk orang ketiga seperti "bangunin dia", "suruh dia", atau "ingetin dia".
- Parafrase inti, jangan copy-paste mentah.
- Contoh: inti "bangunin dia, suruh bangun" menjadi "bangun, udah waktunya".
- Tanpa emoji, markdown, bullet, atau tanda kutip pembuka.
- Jangan menambah fakta, jadwal, atau detail yang tidak ada di inti.
- Jangan sebut kata "pengingat", "reminder", atau menjelaskan bahwa kamu AI/tool.
- Langsung ke isi, jangan mengulang instruksi ini.`;

/**
 * Compose a natural reminder message with Nakiri's style.
 * Falls back to the original message when the AI call fails.
 *
 * @param {{ message: string, senderName?: string | null, timezone?: string }} options
 * @returns {Promise<string>}
 */
export async function composeReminderMessage({
  message,
  senderName = null,
  timezone = 'Asia/Jakarta',
}) {
  const intent = String(message || '').trim();
  if (!intent) return intent;

  const now = DateTime.now().setZone(timezone).toFormat('HH:mm');

  try {
    const content = await createChatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Nama penerima: ${senderName || 'lu'}\nSekarang: ${now}\nInti pengingat: ${intent}`,
        },
      ],
      {
        temperature: 0.85,
        maxTokens: 140,
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
