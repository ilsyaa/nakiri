import logger from '@nakiri/core/utils/logger';
import {
  getAudioStickerSession,
  clearAudioStickerSession,
  convertAudioToOggOpus,
  sendPreparedAudioSticker,
} from '#app/services/audio-sticker.js';

/**
 * Consume an active 60-second audio sticker session when the user follows up
 * with an audio, voice note, or video message.
 *
 * @type {import('@nakiri/core/services/modules').EventMiddleware<'message'>}
 */
export default async function audioStickerSessionMiddleware(payload, ctx) {
  const { client, msg } = ctx;
  if (!msg || msg.flags?.fromMe) return;

  const senderKey = msg.sender?.pn || msg.sender?.lid || msg.sender?.id;
  const session = getAudioStickerSession(msg.chat, senderKey);
  if (!session || session.processing) return;

  // Let explicit commands (like `.saudio batal` or `.saudio`) pass to the command handler
  if (msg.body?.isCommand) return;

  const isDirectAudio = Boolean(msg.flags?.isAudio || msg.flags?.isVideo);
  const isReplyToAudio =
    !msg.body?.text?.trim() &&
    Boolean(msg.quoted?.flags?.isAudio || msg.quoted?.flags?.isVideo);

  if (!isDirectAudio && !isReplyToAudio) return;

  const targetNode = isDirectAudio ? msg : msg.quoted;
  const raw = targetNode.raw || {};
  const mime = String(
    raw.audioMessage?.mimetype || raw.videoMessage?.mimetype || ''
  ).toLowerCase();
  const fallbackSeconds = Number(
    raw.audioMessage?.seconds || raw.videoMessage?.seconds || 0
  );
  const ext = targetNode.flags?.isVideo
    ? 'mp4'
    : /ogg|opus/i.test(mime)
      ? 'ogg'
      : /mp4|m4a|aac/i.test(mime)
        ? 'm4a'
        : 'mp3';

  session.processing = true;

  try {
    const audioBuf = await targetNode.download();
    if (!Buffer.isBuffer(audioBuf) || audioBuf.length === 0) {
      throw new Error('Failed to download follow-up audio');
    }

    const { oggBuffer, seconds } = await convertAudioToOggOpus(audioBuf, ext);

    await sendPreparedAudioSticker(client, msg.chat, {
      stickerBuffer: session.stickerBuffer,
      isAnimated: session.isAnimated,
      oggBuffer,
      seconds: seconds || fallbackSeconds,
      quote: payload,
    });

    clearAudioStickerSession(msg.chat, senderKey);
  } catch (err) {
    session.processing = false;
    logger.error(
      '[AUDIO_STICKER]',
      `Failed to process follow-up audio session: ${err.message}`
    );
    await msg.reply('Gagal menggabungkan audio ke stiker.');
  }

  return ctx.stop();
}
