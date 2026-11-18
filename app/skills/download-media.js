import { formatFileSize } from '@nakiri/core/utils/common';
import logger from '@nakiri/core/utils/logger';
import { defineSkill } from '#app/services/ai/skill.js';
import { downloadMedia } from '#app/services/downloader-media.js';

const URL_REGEX = /https?:\/\/[^\s<>"']+/i;
const MEDIA_TYPES = new Set(['video', 'audio', 'image']);

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

export default defineSkill({
  name: 'download_media',
  description:
    'Download a video, audio, or image from a social media URL and send the file to this chat. Use when the user asks to download, save, or fetch media from a link such as TikTok, Instagram, YouTube, X, or Facebook. Do not use for direct image URLs when the user only wants a sticker; use create_sticker instead.',
  parameters: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description:
          'The media page URL. Omit when the user replied to a message that contains the URL; the skill reads it from the chat.',
      },
      type: {
        type: 'string',
        enum: ['video', 'audio', 'image'],
        description:
          'Media type to download. Defaults to video. Use audio when the user wants MP3/sound only.',
      },
      quality: {
        type: 'string',
        description:
          'Optional exact quality label from the source, for example "1080p", "720p", or "128kbps". Omit to let the skill pick the best playable quality.',
      },
    },
  },
  async execute(args, context) {
    const { client, msg, payload } = context || {};
    if (!msg || !client?.message?.send) {
      return 'Media downloader is not available in this chat.';
    }

    const url =
      extractUrl(args?.url) ||
      extractUrl(msg.body?.rawText || '') ||
      extractUrl(msg.quoted?.body?.rawText || '');
    if (!url) {
      return 'No media URL was found. Ask the user to send a link or reply to a message containing one.';
    }

    const requestedType = String(args?.type || '').toLowerCase();
    const type = MEDIA_TYPES.has(requestedType) ? requestedType : 'video';
    const quality = String(args?.quality || '').trim();

    try {
      const media = await downloadMedia(url, {
        type,
        quality: quality || undefined,
      });

      await client.message.send(
        msg.chat,
        {
          type: media.type,
          media: media.buffer,
          mimetype: media.mime,
        },
        { quote: payload }
      );

      return `Media sent to the chat: ${media.type}, ${media.quality}, ${media.format}, ${formatFileSize(media.buffer.length)}. Reply to the user naturally in one short sentence.`;
    } catch (err) {
      logger.error(
        '[AI_SKILL]',
        `download_media failed for ${url}: ${err.message}`
      );
      return `Media download failed: ${err.message}`;
    }
  },
});
