import { defineCommand } from '#app/services/bot/index.js';
import { stickerToImage, stickerToVideo } from '@nakiri/core/utils/converter';
import logger from '@nakiri/core/utils/logger';

export default defineCommand({
  name: 'toimg',
  aliases: ['toimg', 'tovid', 'tovideo', 'toimage'],
  category: 'maker',
  description: 'Convert sticker back to image or video',

  async execute(payload, ctx) {
    const { client, msg } = ctx;
    if (!msg) return;

    try {
      // 1. Validate quoted sticker
      if (!msg.quoted || !msg.quoted.flags.isSticker) {
        return await msg.reply('Reply to a sticker!');
      }

      // 2. Download sticker buffer
      const dl = await msg.quoted.download();
      if (!dl || !Buffer.isBuffer(dl)) {
        return await msg.reply('Failed to download sticker.');
      }
      const stickerBuffer = dl;

      // 3. Determine if sticker is animated
      // Fallback to checking the WebP ANIM chunk in buffer if WhatsApp flag is unset
      const isAnimated = Boolean(
        msg.quoted.flags.isStickerAnimated ||
          stickerBuffer.includes(Buffer.from('ANIM'))
      );

      // 4. Convert based on sticker animation
      if (isAnimated) {
        const videoBuffer = await stickerToVideo(stickerBuffer);
        await client.message.send(
          msg.chat,
          {
            type: 'video',
            media: videoBuffer,
            mimetype: 'video/mp4',
          },
          { quote: payload }
        );
      } else {
        const imageBuffer = await stickerToImage(stickerBuffer);
        await client.message.send(
          msg.chat,
          {
            type: 'image',
            media: imageBuffer,
            mimetype: 'image/png',
          },
          { quote: payload }
        );
      }
    } catch (err) {
      logger.error('[TOIMG]', `Failed to convert sticker: ${err.message}`);
      await msg.reply('Failed to convert sticker.');
    }
  },
});

