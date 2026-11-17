import { defineSkill } from '#app/services/ai/skill.js';
import { createSticker } from '#app/services/sticker.js';

export default defineSkill({
  name: 'create_sticker',
  description:
    'Create and send a WhatsApp sticker from the current image/video, the quoted image/video, or a media URL. Call this only when the user explicitly asks to make a sticker.',
  parameters: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description:
          'Optional meme text placed on the sticker. Use "|" to split top and bottom text.',
      },
      url: {
        type: 'string',
        description:
          'Optional image or video URL when the user provides a link instead of media.',
      },
    },
  },
  async execute(args, context) {
    const { client, msg, payload } = context || {};
    if (!msg || !client?.message?.send) {
      return 'Sticker skill is not available in this chat.';
    }

    const text = typeof args?.text === 'string' ? args.text.trim() : '';
    const rawText =
      typeof msg.body?.rawText === 'string' ? msg.body.rawText : '';
    const fallbackUrl = rawText.match(/https?:\/\/[^\s]+/)?.[0] || '';
    const url =
      typeof args?.url === 'string' && args.url.trim()
        ? args.url.trim()
        : fallbackUrl;
    const sticker = await createSticker({ msg, text, url });

    if (!sticker) {
      return 'No image or video was found. Ask the user to send or reply to a photo/video, or provide a valid media URL.';
    }

    await client.message.send(
      msg.chat,
      {
        type: 'sticker',
        media: sticker,
      },
      { quote: payload }
    );

    return 'Sticker sent successfully.';
  },
});
