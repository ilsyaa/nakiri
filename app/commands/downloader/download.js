import logger from '@nakiri/core/utils/logger';
import { defineCommand } from '#app/services/bot/index.js';
import { downloadMedia } from '#app/services/downloader-media.js';

const URL_REGEX = /https?:\/\/[^\s<>"']+/i;
const TYPE_ALIASES = {
  video: 'video',
  vid: 'video',
  mp4: 'video',
  audio: 'audio',
  mp3: 'audio',
  music: 'audio',
  image: 'image',
  img: 'image',
  photo: 'image',
  picture: 'image',
};

/**
 * Extract the first HTTP(S) URL from text and strip trailing punctuation.
 *
 * @param {string} text
 * @returns {string}
 */
function extractUrl(text) {
  const match = String(text || '').match(URL_REGEX)?.[0];
  return match ? match.replace(/[),.!?]+$/, '') : '';
}

/**
 * Parse media type and quality from command arguments.
 *
 * @param {string} text
 * @returns {{ type: 'video' | 'audio' | 'image', quality: string }}
 */
function parseOptions(text) {
  let type = 'video';
  let quality = '';

  for (const token of String(text || '')
    .replace(URL_REGEX, ' ')
    .split(/\s+/)
    .filter(Boolean)) {
    const lower = token.toLowerCase();
    if (TYPE_ALIASES[lower]) {
      type = TYPE_ALIASES[lower];
      continue;
    }
    if (/^\d{3,4}$/.test(lower)) {
      quality = `${lower}p`;
      continue;
    }
    quality = token;
  }

  return { type, quality };
}

export default defineCommand({
  name: 'download',
  aliases: ['dl', 'download'],
  category: 'downloader',
  description: 'Download video, audio, or image from a supported media URL',

  async execute(payload, ctx) {
    const { client, msg } = ctx;
    if (!msg) return;

    const argsText = msg.body?.argsText || '';
    const url =
      extractUrl(argsText) || extractUrl(msg.quoted?.body?.rawText || '');

    if (!url) {
      return await msg.reply(
        'Send a media URL, or reply to a message containing one.\n' +
          'Usage: `.dl <url> [video|audio|image] [quality]`'
      );
    }

    const { type, quality } = parseOptions(argsText);

    try {
      const media = await downloadMedia(url, { type, quality });

      await client.message.send(
        msg.chat,
        {
          type: media.type,
          media: media.buffer,
          mimetype: media.mime,
        },
        { quote: payload }
      );
    } catch (err) {
      logger.error('[DOWNLOAD]', `Failed to download media: ${err.message}`);
      await msg.reply(`Download failed: ${err.message}`);
    }
  },
});
