import { imageToWebp, videoToWebp } from '@nakiri/core/utils/converter';
import { writeExif } from '@nakiri/core/utils/metadata';
import { Http } from '@nakiri/core/utils/http';

const URL_REGEX = /https?:\/\/[^\s]+/;

/**
 * Download media from a quoted message or the current message.
 *
 * @param {any} msg
 * @returns {Promise<{ buffer: Buffer, mediaType: 'image' | 'video' } | null>}
 */
async function resolveMessageMedia(msg) {
  if (!msg) return null;

  if (msg.quoted) {
    if (msg.quoted.flags?.isImage) {
      const buffer = await msg.quoted.download();
      if (Buffer.isBuffer(buffer)) {
        return { buffer, mediaType: 'image' };
      }
    }
    if (msg.quoted.flags?.isVideo) {
      const buffer = await msg.quoted.download();
      if (Buffer.isBuffer(buffer)) {
        return { buffer, mediaType: 'video' };
      }
    }
  }

  if (msg.flags?.isImage) {
    const buffer = await msg.download();
    if (Buffer.isBuffer(buffer)) {
      return { buffer, mediaType: 'image' };
    }
  }
  if (msg.flags?.isVideo) {
    const buffer = await msg.download();
    if (Buffer.isBuffer(buffer)) {
      return { buffer, mediaType: 'video' };
    }
  }

  return null;
}

/**
 * Download media from a URL and infer its type from the response MIME type.
 *
 * @param {string} url
 * @returns {Promise<{ buffer: Buffer, mediaType: 'image' | 'video' } | null>}
 */
async function resolveUrlMedia(url) {
  if (!url) return null;

  const downloaded = await Http.getFromUrl(url);
  if (!downloaded?.buffer) return null;

  const mime = downloaded.mime || '';
  if (mime.startsWith('image/')) {
    return { buffer: downloaded.buffer, mediaType: 'image' };
  }
  if (mime.startsWith('video/')) {
    return { buffer: downloaded.buffer, mediaType: 'video' };
  }

  return null;
}

/**
 * Create a WhatsApp sticker from the quoted message, current message, or a URL.
 * Media priority matches the sticker command: quoted, current message, then URL.
 *
 * @param {object} options
 * @param {any} options.msg - Parsed message
 * @param {string} [options.text=''] - Optional meme text, use `|` for top and bottom
 * @param {string} [options.url=''] - Optional image/video URL
 * @param {string} [options.packname='Nakiri']
 * @param {string} [options.author='BOT']
 * @returns {Promise<Buffer | null>} Sticker WebP buffer, or null when no media is found
 */
export async function createSticker({
  msg,
  text = '',
  url = '',
  packname = 'Nakiri',
  author = 'BOT',
}) {
  let memeText = typeof text === 'string' ? text.trim() : '';
  let media = await resolveMessageMedia(msg);

  if (!media) {
    const urlMatch =
      (typeof url === 'string' && url.match(URL_REGEX)?.[0]) ||
      memeText.match(URL_REGEX)?.[0] ||
      null;

    if (urlMatch) {
      memeText = memeText.replace(urlMatch, '').trim();
      media = await resolveUrlMedia(urlMatch);
    }
  }

  if (!media?.buffer) return null;

  const webpBuffer =
    media.mediaType === 'image'
      ? await imageToWebp(media.buffer, memeText || undefined)
      : await videoToWebp(media.buffer, memeText || undefined);

  return writeExif(webpBuffer, { packname, author });
}

export default createSticker;
