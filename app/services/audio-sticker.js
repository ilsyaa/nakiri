import { randomBytes } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { proto } from 'zapo-js';
import cache from '@nakiri/core/services/cache';
import logger from '@nakiri/core/utils/logger';
import { dirTemp } from '@nakiri/core/utils/path';
import { imageToWebp } from '@nakiri/core/utils/converter';
import { writeExif } from '@nakiri/core/utils/metadata';

const execFileAsync = promisify(execFile);

export const MAX_AUDIO_STICKER_DURATION = 25;
export const AUDIO_STICKER_SESSION_TTL_MS = 60 * 1000;

// Wire tags: (fieldNumber << 3) | wireType(2 = length-delimited)
const STICKER_AUDIO_FIELD_TAG = (26 << 3) | 2; // 210
const MESSAGE_AUDIO_STICKER_FIELD_TAG = (134 << 3) | 2; // 1074
const STRIP_STICKER_SYMBOL = Symbol('nakiri.audioSticker');

let encodePatched = false;

/**
 * Guard proto.Message.encode so audioSticker payloads keep `stickerMessage`
 * visible to Zapo's outbound stanza resolver (`type="media"`, `mediatype="sticker"`)
 * even after object spreads (ICDC / contextInfo), without encoding a duplicate
 * root `stickerMessage` field.
 */
function ensureAudioStickerEncoder() {
  if (encodePatched) return;
  const origEncode = proto.Message.encode;
  proto.Message.encode = function encodeWithAudioSticker(
    message,
    writer,
    depth
  ) {
    if (message && message[STRIP_STICKER_SYMBOL]) {
      const { stickerMessage: _, ...clean } = message;
      return origEncode.call(this, clean, writer, depth);
    }
    return origEncode.call(this, message, writer, depth);
  };
  encodePatched = true;
}

const sessionCache = cache.namespace('audio_sticker_session');

/**
 * Build a unique session key for a user in a chat.
 *
 * @param {string} chat
 * @param {string} sender
 * @returns {string}
 */
function buildSessionKey(chat, sender) {
  return `${chat}:${sender}`;
}

/**
 * Get an active audio sticker session from cache.
 *
 * @param {string} chat
 * @param {string} sender
 * @returns {{
 *   stickerBuffer: Buffer,
 *   isAnimated: boolean,
 *   packname: string,
 *   author: string,
 *   expiresAt: number,
 *   processing: boolean
 * } | undefined}
 */
export function getAudioStickerSession(chat, sender) {
  if (!chat || !sender) return undefined;
  return sessionCache.get(buildSessionKey(chat, sender));
}

/**
 * Store a temporary sticker session with a 60-second TTL.
 *
 * @param {string} chat
 * @param {string} sender
 * @param {{ stickerBuffer: Buffer, isAnimated: boolean, packname: string, author: string }} data
 */
export function setAudioStickerSession(chat, sender, data) {
  const key = buildSessionKey(chat, sender);
  sessionCache.set(
    key,
    {
      ...data,
      expiresAt: Date.now() + AUDIO_STICKER_SESSION_TTL_MS,
      processing: false,
    },
    AUDIO_STICKER_SESSION_TTL_MS
  );
}

/**
 * Clear an active audio sticker session.
 *
 * @param {string} chat
 * @param {string} sender
 */
export function clearAudioStickerSession(chat, sender) {
  if (!chat || !sender) return;
  sessionCache.delete(buildSessionKey(chat, sender));
}

/**
 * Encode an unsigned 32-bit integer as a protobuf varint.
 *
 * @param {number} value
 * @returns {Uint8Array}
 */
function encodeVarint(value) {
  const bytes = [];
  let v = value >>> 0;
  while (v > 0x7f) {
    bytes.push((v & 0x7f) | 0x80);
    v >>>= 7;
  }
  bytes.push(v);
  return Uint8Array.from(bytes);
}

/**
 * Wrap encoded protobuf bytes into a raw length-delimited field for `$unknowns`.
 *
 * @param {number} fieldTag
 * @param {Uint8Array} payloadBytes
 * @returns {Uint8Array}
 */
function makeLengthDelimitedField(fieldTag, payloadBytes) {
  const tag = encodeVarint(fieldTag);
  const len = encodeVarint(payloadBytes.length);
  const out = new Uint8Array(tag.length + len.length + payloadBytes.length);
  out.set(tag, 0);
  out.set(len, tag.length);
  out.set(payloadBytes, tag.length + len.length);
  return out;
}

/**
 * Check whether a WebP buffer is animated.
 *
 * @param {Buffer} buf
 * @returns {boolean}
 */
export function isWebpAnimated(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 22) return false;
  if (buf.toString('ascii', 12, 16) === 'VP8X' && (buf[20] & 0x02) !== 0) {
    return true;
  }
  return buf.includes(Buffer.from('ANIM'));
}

/**
 * Parse the last recorded duration from ffmpeg stderr output.
 *
 * @param {string} stderrText
 * @returns {number}
 */
function parseFfmpegDuration(stderrText) {
  const matches = [
    ...String(stderrText || '').matchAll(/time=(\d+):(\d+):(\d+(?:\.\d+)?)/g),
  ];
  if (matches.length === 0) return 0;
  const last = matches[matches.length - 1];
  const sec = Number(last[1]) * 3600 + Number(last[2]) * 60 + Number(last[3]);
  return Number.isFinite(sec) ? sec : 0;
}

/**
 * Generate a lightweight 64-byte waveform fallback for PTT audio.
 *
 * @param {Buffer} seedBuf
 * @param {number} [length=64]
 * @returns {Uint8Array}
 */
function generateWaveform(seedBuf, length = 64) {
  const wf = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    const b =
      seedBuf && seedBuf.length
        ? seedBuf[(i * 19 + 7) % seedBuf.length]
        : i * 11;
    wf[i] = 18 + (b % 76);
  }
  return wf;
}

/**
 * Convert an audio or video buffer to OGG/Opus (PTT-ready, capped at 25s).
 *
 * @param {Buffer} buffer
 * @param {string} [ext='mp3']
 * @returns {Promise<{ oggBuffer: Buffer, seconds: number }>}
 */
export async function convertAudioToOggOpus(buffer, ext = 'mp3') {
  const tmpId = randomBytes(8).toString('hex');
  const tempDir = dirTemp();
  await fs.mkdir(tempDir, { recursive: true });

  const inPath = path.join(tempDir, `as_audio_in_${tmpId}.${ext}`);
  const outPath = path.join(tempDir, `as_audio_out_${tmpId}.ogg`);

  try {
    await fs.writeFile(inPath, buffer);
    const { stderr } = await execFileAsync(
      'ffmpeg',
      [
        '-y',
        '-i',
        inPath,
        '-vn',
        '-map',
        '0:a:0',
        '-t',
        String(MAX_AUDIO_STICKER_DURATION),
        '-c:a',
        'libopus',
        '-b:a',
        '48k',
        '-vbr',
        'on',
        '-compression_level',
        '10',
        '-ac',
        '1',
        '-ar',
        '48000',
        '-application',
        'audio',
        '-f',
        'ogg',
        outPath,
      ],
      { maxBuffer: 10 * 1024 * 1024 }
    );

    const oggBuffer = await fs.readFile(outPath);
    if (!oggBuffer || oggBuffer.length < 200) {
      throw new Error('Audio track is empty or too short');
    }

    return { oggBuffer, seconds: parseFfmpegDuration(stderr) };
  } catch (err) {
    const detail = String(err?.stderr || err?.message || err)
      .split('\n')
      .filter(Boolean)
      .slice(-3)
      .join(' | ');
    throw new Error(detail || 'Failed to convert audio to OGG/Opus');
  } finally {
    await fs.unlink(inPath).catch(() => {});
    await fs.unlink(outPath).catch(() => {});
  }
}

/**
 * Convert a video buffer (up to 25s) to an animated 512x512 WebP sticker.
 *
 * @param {Buffer} buffer
 * @returns {Promise<Buffer>}
 */
async function convertVideoToStickerWebp(buffer) {
  const tmpId = randomBytes(8).toString('hex');
  const tempDir = dirTemp();
  await fs.mkdir(tempDir, { recursive: true });

  const inPath = path.join(tempDir, `as_vid_in_${tmpId}.mp4`);
  const outPath = path.join(tempDir, `as_vid_out_${tmpId}.webp`);

  const encode = async (fps, quality) => {
    await execFileAsync('ffmpeg', [
      '-y',
      '-i',
      inPath,
      '-t',
      String(MAX_AUDIO_STICKER_DURATION),
      '-vf',
      `fps=${fps},scale=512:512:force_original_aspect_ratio=increase,crop=512:512,format=rgba,setsar=1`,
      '-c:v',
      'libwebp',
      '-lossless',
      '0',
      '-compression_level',
      '6',
      '-q:v',
      String(quality),
      '-loop',
      '0',
      '-preset',
      'picture',
      '-an',
      '-vsync',
      '0',
      outPath,
    ]);
    return fs.readFile(outPath);
  };

  try {
    await fs.writeFile(inPath, buffer);
    let webp = await encode(10, 48);
    if (webp.length > 900 * 1024) {
      webp = await encode(6, 22);
    }
    return webp;
  } finally {
    await fs.unlink(inPath).catch(() => {});
    await fs.unlink(outPath).catch(() => {});
  }
}

/**
 * Convert image/video/webp media into a WhatsApp sticker WebP with EXIF metadata.
 *
 * @param {Buffer} buffer
 * @param {'image' | 'video' | 'webp'} kind
 * @param {{ packname?: string, author?: string }} [meta]
 * @returns {Promise<{ stickerBuffer: Buffer, isAnimated: boolean }>}
 */
export async function prepareStickerBuffer(
  buffer,
  kind,
  { packname = 'Nakiri', author = 'BOT' } = {}
) {
  let rawWebp = buffer;
  if (kind === 'image') {
    rawWebp = await imageToWebp(buffer, { crop: true });
  } else if (kind === 'video') {
    rawWebp = await convertVideoToStickerWebp(buffer);
  }

  const stickerBuffer = await writeExif(rawWebp, { packname, author });
  const isAnimated = kind === 'video' || isWebpAnimated(stickerBuffer);
  return { stickerBuffer, isAnimated };
}

/**
 * Upload sticker + OGG/Opus audio in parallel and send a combined Audio Sticker via Zapo.
 * Uses native `$unknowns` fields (StickerMessage#26 and Message#134) without proto monkey-patching.
 *
 * @param {any} client
 * @param {string} chat
 * @param {{
 *   stickerBuffer: Buffer,
 *   isAnimated: boolean,
 *   oggBuffer: Buffer,
 *   seconds: number,
 *   quote?: any
 * }} options
 */
export async function sendPreparedAudioSticker(
  client,
  chat,
  { stickerBuffer, isAnimated, oggBuffer, seconds }
) {
  ensureAudioStickerEncoder();

  const finalSeconds = Math.max(
    1,
    Math.min(MAX_AUDIO_STICKER_DURATION, Math.round(seconds || 5))
  );

  const [stickerUpload, audioUpload] = await Promise.all([
    client.message.upload(stickerBuffer, {
      type: 'sticker',
      mimetype: 'image/webp',
    }),
    client.message.upload(oggBuffer, {
      type: 'ptt',
      mimetype: 'audio/ogg; codecs=opus',
    }),
  ]);

  const audioMessage = {
    url: audioUpload.url,
    directPath: audioUpload.directPath,
    mediaKey: audioUpload.mediaKey,
    mediaKeyTimestamp: audioUpload.mediaKeyTimestamp,
    fileSha256: audioUpload.fileSha256,
    fileEncSha256: audioUpload.fileEncSha256,
    fileLength: audioUpload.fileLength,
    streamingSidecar: audioUpload.streamingSidecar,
    mimetype: 'audio/ogg; codecs=opus',
    ptt: true,
    seconds: finalSeconds,
    waveform: generateWaveform(oggBuffer),
  };

  const audioBytes = proto.Message.AudioMessage.encode(audioMessage).finish();

  const stickerMessage = {
    url: stickerUpload.url,
    directPath: stickerUpload.directPath,
    mediaKey: stickerUpload.mediaKey,
    mediaKeyTimestamp: stickerUpload.mediaKeyTimestamp,
    fileSha256: stickerUpload.fileSha256,
    fileEncSha256: stickerUpload.fileEncSha256,
    fileLength: stickerUpload.fileLength,
    mimetype: 'image/webp',
    width: 512,
    height: 512,
    isAnimated: Boolean(isAnimated),
    stickerSentTs: Date.now(),
    $unknowns: [makeLengthDelimitedField(STICKER_AUDIO_FIELD_TAG, audioBytes)],
  };

  const futureProofBytes = proto.Message.FutureProofMessage.encode({
    message: { stickerMessage },
  }).finish();

  const rawMessage = {
    stickerMessage,
    $unknowns: [
      makeLengthDelimitedField(
        MESSAGE_AUDIO_STICKER_FIELD_TAG,
        futureProofBytes
      ),
    ],
    messageContextInfo: {
      messageSecret: randomBytes(32),
    },
    [STRIP_STICKER_SYMBOL]: true,
  };

  await client.message.send(chat, rawMessage);
  logger.info('[AUDIO_STICKER]', `Sent audio sticker to ${chat}`);
}
