import { createChatCompletion } from './client.js';

const SYSTEM_PROMPT = `You are a concise, insightful, and objective WhatsApp group chat summarizer bot named Nakiri.
Analyze the provided chronological chat transcripts and provide an elegant, structured Indonesian summary.

Guidelines:
1. Extract key topics, important decisions, agreements, upcoming plans/agendas, and significant discussions.
2. Structure the output clearly using Nakiri's clean Markdown style:
   - Header bracket: ｢ *RANGKUMAN OBROLAN* ｣
   - *Topik Utama*: Inti permasalahan atau pembahasan utama dalam obrolan.
   - *Poin & Keputusan Penting*: Kesepakatan bersama, informasi krusial, link/rekomendasi, atau kesimpulan teknis/diskusi.
   - *Insight & Pembelajaran*: Insight menarik, pelajaran yang bisa diambil dari diskusi, evaluasi, atau takeaway berharga bagi anggota grup.
   - *Agenda & Tindak Lanjut* (opsional): Hal-hal yang perlu dilakukan ke depan jika ada janji atau jadwal yang dibicarakan.
   - *Kesimpulan Ringkas*: 1-2 kalimat konklusi yang merangkum keseluruhan obrolan.
   - Use simple bullet points: • Item
3. Keep it informative, clear, and relevant. Do not include trivia or irrelevant filler chats.
4. DO NOT use emoji slop or decorative spam icons (no 🚀, 💡, 📢, 🤖, 📌, ✅, dll).
5. If the chat transcript is mostly casual banter or lacks formal topics, provide a relaxed yet structured summary highlighting the main highlights, jokes/topics, and a humorous yet insightful conclusion.`;

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
    { role: 'system', content: SYSTEM_PROMPT },
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
