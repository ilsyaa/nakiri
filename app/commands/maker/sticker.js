import { defineCommand } from '#app/services/bot/index.js';
import { imageToWebp, videoToWebp } from '@nakiri/core/utils/converter';
import { writeExif } from '@nakiri/core/utils/metadata';
import { Http } from '@nakiri/core/utils/http';
import logger from '@nakiri/core/utils/logger';

const URL_REGEX = /https?:\/\/[^\s]+/;

export default defineCommand({
  name: 'sticker',
  aliases: ['s', 'sticker', 'stiker', 'smeme', 'stickermeme'],
  category: 'maker',
  description: 'Convert image/video or media URL to sticker with optional meme text',

  async execute(payload, ctx) {
    const { client, msg } = ctx;
    if (!msg) return;

    try {
      let mediaBuffer = null;
      let mediaType = null; // 'image' | 'video'
      let memeText = msg.body?.argsText?.trim() || '';

      // 1. Resolve media source
      // Priority A: Quoted message
      if (msg.quoted) {
        if (msg.quoted.flags.isImage) {
          mediaType = 'image';
          const dl = await msg.quoted.download();
          if (Buffer.isBuffer(dl)) mediaBuffer = dl;
        } else if (msg.quoted.flags.isVideo) {
          mediaType = 'video';
          const dl = await msg.quoted.download();
          if (Buffer.isBuffer(dl)) mediaBuffer = dl;
        }
      }

      // Priority B: Direct message attachment
      if (!mediaBuffer) {
        if (msg.flags.isImage) {
          mediaType = 'image';
          const dl = await msg.download();
          if (Buffer.isBuffer(dl)) mediaBuffer = dl;
        } else if (msg.flags.isVideo) {
          mediaType = 'video';
          const dl = await msg.download();
          if (Buffer.isBuffer(dl)) mediaBuffer = dl;
        }
      }

      // Priority C: URL from arguments
      if (!mediaBuffer) {
        const urlMatch = memeText.match(URL_REGEX);
        if (urlMatch) {
          const url = urlMatch[0];
          // Remove URL from memeText
          memeText = memeText.replace(url, '').trim();

          const downloaded = await Http.getFromUrl(url);
          if (downloaded?.buffer) {
            mediaBuffer = downloaded.buffer;
            const mime = downloaded.mime || '';
            if (mime.startsWith('image/')) {
              mediaType = 'image';
            } else if (mime.startsWith('video/')) {
              mediaType = 'video';
            }
          }
        }
      }

      // If no valid media found
      if (!mediaBuffer || !mediaType) {
        return await msg.reply(
          'Reply or send an image/video, or provide a valid media URL.'
        );
      }

      // 2. Convert media to WebP with optional meme text
      let webpBuffer;
      if (mediaType === 'image') {
        webpBuffer = await imageToWebp(mediaBuffer, memeText || undefined);
      } else {
        webpBuffer = await videoToWebp(mediaBuffer, memeText || undefined);
      }

      // 3. Inject default EXIF metadata (Nakiri | BOT)
      const finalStickerBuffer = await writeExif(webpBuffer, {
        packname: 'Nakiri',
        author: 'BOT',
      });

      // 4. Send sticker
      await client.message.send(
        msg.chat,
        {
          type: 'sticker',
          media: finalStickerBuffer,
        },
        { quote: payload }
      );
    } catch (err) {
      logger.error('[STICKER]', `Failed to process sticker: ${err.message}`);
      await msg.reply('Failed to create sticker. Make sure media is valid.');
    }
  },
});

