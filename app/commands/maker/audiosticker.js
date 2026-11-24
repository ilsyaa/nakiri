import { defineCommand } from '#app/services/bot/index.js';
import logger from '@nakiri/core/utils/logger';
import {
  MAX_AUDIO_STICKER_DURATION,
  AUDIO_STICKER_SESSION_TTL_MS,
  getAudioStickerSession,
  setAudioStickerSession,
  clearAudioStickerSession,
  prepareStickerBuffer,
  convertAudioToOggOpus,
  sendPreparedAudioSticker,
} from '#app/services/audio-sticker.js';

const SESSION_SECONDS = Math.round(AUDIO_STICKER_SESSION_TTL_MS / 1000);

/**
 * Inspect a parsed message or quoted message for visual/audio media metadata.
 *
 * @param {any} node
 * @returns {{ kind: 'video' | 'image' | 'webp' | 'audio' | null, mime: string, seconds: number }}
 */
function inspectMedia(node) {
  if (!node) return { kind: null, mime: '', seconds: 0 };

  const flags = node.flags || {};
  const raw = node.raw || {};
  const mime = String(
    raw.videoMessage?.mimetype ||
      raw.imageMessage?.mimetype ||
      raw.stickerMessage?.mimetype ||
      raw.audioMessage?.mimetype ||
      raw.documentMessage?.mimetype ||
      ''
  ).toLowerCase();

  const seconds = Number(
    raw.videoMessage?.seconds || raw.audioMessage?.seconds || 0
  );

  if (flags.isVideo) return { kind: 'video', mime: mime || 'video/mp4', seconds };
  if (flags.isSticker) return { kind: 'webp', mime: 'image/webp', seconds: 0 };
  if (flags.isImage) return { kind: 'image', mime: mime || 'image/jpeg', seconds: 0 };
  if (flags.isAudio) return { kind: 'audio', mime: mime || 'audio/mpeg', seconds };

  if (flags.isDocument) {
    if (mime.startsWith('video/')) return { kind: 'video', mime, seconds };
    if (mime.includes('webp')) return { kind: 'webp', mime, seconds: 0 };
    if (mime.startsWith('image/')) return { kind: 'image', mime, seconds: 0 };
    if (mime.startsWith('audio/')) return { kind: 'audio', mime, seconds };
  }

  return { kind: null, mime: '', seconds: 0 };
}

/**
 * Infer ffmpeg input extension from media kind and MIME type.
 *
 * @param {{ kind: string | null, mime: string }} info
 * @returns {string}
 */
function inferAudioExt(info) {
  if (info.kind === 'video') return 'mp4';
  if (/ogg|opus/i.test(info.mime)) return 'ogg';
  if (/mp4|m4a|aac/i.test(info.mime)) return 'm4a';
  return 'mp3';
}

export default defineCommand({
  name: 'audiosticker',
  aliases: ['audiosticker', 'stikeraudio', 'stickeraudio', 'saudio'],
  category: 'maker',
  description:
    'Create a sticker with audio (max 25s) from video or image + audio',

  async execute(payload, ctx) {
    const { client, msg } = ctx;
    if (!msg) return;

    const p = msg.body?.prefix || '.';
    const cmd = msg.body?.command || `${p}saudio`;
    const rawText = String(msg.body?.argsText || '').trim();
    const senderKey = msg.sender?.pn || msg.sender?.lid || msg.sender?.id;
    const activeSession = getAudioStickerSession(msg.chat, senderKey);

    if (/^(batal|cancel|stop)$/i.test(rawText)) {
      if (!activeSession) {
        return msg.reply('Tidak ada sesi audio sticker yang aktif.');
      }
      clearAudioStickerSession(msg.chat, senderKey);
      return msg.reply('Sesi audio sticker dibatalkan.');
    }

    const ownInfo = inspectMedia(msg);
    const quotedInfo = inspectMedia(msg.quoted);

    const hasOwnVisual =
      ownInfo.kind === 'video' ||
      ownInfo.kind === 'image' ||
      ownInfo.kind === 'webp';
    const hasQuotedVisual =
      quotedInfo.kind === 'video' ||
      quotedInfo.kind === 'image' ||
      quotedInfo.kind === 'webp';
    const hasOwnAudio = ownInfo.kind === 'audio';
    const hasQuotedAudio = quotedInfo.kind === 'audio';

    // 1. Active session + audio provided -> finalize immediately
    if (
      activeSession &&
      !activeSession.processing &&
      !hasOwnVisual &&
      (hasOwnAudio || hasQuotedAudio)
    ) {
      const audioNode = hasOwnAudio ? msg : msg.quoted;
      const audioInfo = hasOwnAudio ? ownInfo : quotedInfo;
      activeSession.processing = true;

      try {
        const audioBuf = await audioNode.download();
        if (!Buffer.isBuffer(audioBuf) || audioBuf.length === 0) {
          throw new Error('Failed to download audio media');
        }

        const { oggBuffer, seconds } = await convertAudioToOggOpus(
          audioBuf,
          inferAudioExt(audioInfo)
        );

        await sendPreparedAudioSticker(client, msg.chat, {
          stickerBuffer: activeSession.stickerBuffer,
          isAnimated: activeSession.isAnimated,
          oggBuffer,
          seconds: seconds || audioInfo.seconds,
          quote: payload,
        });

        clearAudioStickerSession(msg.chat, senderKey);
        return;
      } catch (err) {
        activeSession.processing = false;
        logger.error(
          '[AUDIO_STICKER]',
          `Failed to finalize audio sticker session: ${err.message}`
        );
        return msg.reply('Gagal menggabungkan audio ke stiker.');
      }
    }

    // 2. No visual media provided -> show guide or session status
    if (!hasOwnVisual && !hasQuotedVisual) {
      if (activeSession) {
        const remSec = Math.max(
          1,
          Math.ceil((activeSession.expiresAt - Date.now()) / 1000)
        );
        return msg.reply(
          [
            '｢ *sesi audio sticker* ｣',
            `Sisa waktu: *${remSec} detik*`,
            `• Kirim audio/VN/video langsung, atau reply audio dengan \`${cmd}\``,
            `• Batalkan: \`${cmd} batal\``,
          ].join('\n')
        );
      }

      if (hasOwnAudio || hasQuotedAudio) {
        return msg.reply(
          `Kirim atau reply *foto/stiker* dulu dengan \`${cmd}\`, lalu kirim audionya.`
        );
      }

      return msg.reply(
        [
          '｢ *audio sticker* ｣',
          `• Video (maks ${MAX_AUDIO_STICKER_DURATION}d): kirim/reply video dengan \`${cmd}\``,
          `• Foto/Stiker + Audio: kirim foto sambil reply audio dengan \`${cmd}\``,
          `• Mode sesi: kirim/reply foto dengan \`${cmd}\`, lalu kirim audio dalam ${SESSION_SECONDS}d`,
          `• Custom pack: \`${cmd} PackName|Author\``,
        ].join('\n')
      );
    }

    // 3. Process visual media
    try {
      const [customPack, customAuthor] = rawText.includes('|')
        ? rawText.split('|').map((s) => s.trim())
        : [rawText, ''];

      const packname = customPack || 'Nakiri';
      const author = customAuthor || msg.sender?.name || 'BOT';

      const visualNode = hasOwnVisual ? msg : msg.quoted;
      const visualInfo = hasOwnVisual ? ownInfo : quotedInfo;
      const visualKind = visualInfo.kind;
      if (
        visualKind !== 'video' &&
        visualKind !== 'image' &&
        visualKind !== 'webp'
      ) {
        return;
      }

      if (
        visualKind === 'video' &&
        visualInfo.seconds > MAX_AUDIO_STICKER_DURATION
      ) {
        return msg.reply(
          `Durasi video maksimal *${MAX_AUDIO_STICKER_DURATION} detik*.`
        );
      }

      const visualBuf = await visualNode.download();
      if (!Buffer.isBuffer(visualBuf) || visualBuf.length === 0) {
        return msg.reply('Gagal mengunduh media.');
      }

      // Case A: Sending visual while replying to an audio -> 1-step parallel conversion
      if (hasOwnVisual && hasQuotedAudio) {
        const audioBuf = await msg.quoted.download();
        if (!Buffer.isBuffer(audioBuf) || audioBuf.length === 0) {
          return msg.reply('Gagal mengunduh audio yang di-reply.');
        }

        const [stickerRes, audioRes] = await Promise.all([
          prepareStickerBuffer(visualBuf, visualKind, {
            packname,
            author,
          }),
          convertAudioToOggOpus(audioBuf, inferAudioExt(quotedInfo)),
        ]);

        await sendPreparedAudioSticker(client, msg.chat, {
          stickerBuffer: stickerRes.stickerBuffer,
          isAnimated: stickerRes.isAnimated,
          oggBuffer: audioRes.oggBuffer,
          seconds: audioRes.seconds || quotedInfo.seconds,
          quote: payload,
        });

        clearAudioStickerSession(msg.chat, senderKey);
        return;
      }

      // Case B: Video -> convert animated WebP and extract audio track in parallel
      if (visualKind === 'video') {
        const [stickerOutcome, audioOutcome] = await Promise.allSettled([
          prepareStickerBuffer(visualBuf, 'video', { packname, author }),
          convertAudioToOggOpus(visualBuf, 'mp4'),
        ]);

        if (stickerOutcome.status === 'rejected') {
          throw stickerOutcome.reason;
        }

        const { stickerBuffer, isAnimated } = stickerOutcome.value;

        if (audioOutcome.status === 'fulfilled') {
          await sendPreparedAudioSticker(client, msg.chat, {
            stickerBuffer,
            isAnimated,
            oggBuffer: audioOutcome.value.oggBuffer,
            seconds: audioOutcome.value.seconds || visualInfo.seconds,
            quote: payload,
          });
          clearAudioStickerSession(msg.chat, senderKey);
          return;
        }

        // Video had no usable audio track -> fall back to 60s audio session
        logger.warn(
          '[AUDIO_STICKER]',
          `Video audio extraction failed, falling back to session: ${audioOutcome.reason?.message || audioOutcome.reason}`
        );
        setAudioStickerSession(msg.chat, senderKey, {
          stickerBuffer,
          isAnimated,
          packname,
          author,
        });

        return msg.reply(
          [
            '｢ *sesi audio sticker* ｣',
            'Video tidak memiliki audio. Stiker animasi disimpan selama 60 detik.',
            `• Kirim audio/VN langsung atau reply audio dengan \`${cmd}\``,
            `• Batalkan: \`${cmd} batal\``,
          ].join('\n')
        );
      }

      // Case C: Image or WebP sticker -> store in 60s session
      const { stickerBuffer, isAnimated } = await prepareStickerBuffer(
        visualBuf,
        visualKind,
        { packname, author }
      );

      setAudioStickerSession(msg.chat, senderKey, {
        stickerBuffer,
        isAnimated,
        packname,
        author,
      });

      return msg.reply(
        [
          '｢ *sesi audio sticker* ｣',
          `Stiker tersimpan selama *${SESSION_SECONDS} detik* (${isAnimated ? 'animasi' : 'statis'}).`,
          `• Kirim audio/VN/video langsung ke chat ini (maks ${MAX_AUDIO_STICKER_DURATION}d)`,
          `• Atau reply audio dengan \`${cmd}\``,
          `• Batalkan: \`${cmd} batal\``,
        ].join('\n')
      );
    } catch (err) {
      logger.error(
        '[AUDIO_STICKER]',
        `Failed to process audio sticker: ${err.message}`
      );
      return msg.reply('Gagal memproses media untuk audio sticker.');
    }
  },
});
