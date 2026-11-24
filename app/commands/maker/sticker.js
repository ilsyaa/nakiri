import { defineCommand } from '#app/services/bot/index.js';
import { createSticker } from '#app/services/sticker.js';
import logger from '@nakiri/core/utils/logger';

export default defineCommand({
  name: 'sticker',
  aliases: ['sticker', 's', 'stiker', 'smeme', 'stickermeme'],
  category: 'maker',
  description:
    'Convert image/video or media URL to sticker with optional meme text',

  async execute(payload, ctx) {
    const { client, msg } = ctx;
    if (!msg) return;

    try {
      const sticker = await createSticker({
        msg,
        text: msg.body?.argsText?.trim() || '',
      });

      if (!sticker) {
        return await msg.reply(
          'Reply or send an image/video, or provide a valid media URL.'
        );
      }

      await client.message.send(
        msg.chat,
        {
          type: 'sticker',
          media: sticker,
        },
        { quote: payload }
      );
    } catch (err) {
      logger.error('[STICKER]', `Failed to process sticker: ${err.message}`);
      await msg.reply('Failed to create sticker. Make sure media is valid.');
    }
  },
});
