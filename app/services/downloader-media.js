import crypto from 'node:crypto';
import { Http } from '@nakiri/core/utils/http';

const AES_KEY = Buffer.from('4c9b7d2e'.repeat(3) + '4c9b7d21', 'utf-8');
const AES_IV = Buffer.from('4c9b7d2e4c9b7d2e', 'utf-8');
const API_URL = 'https://api.vidssave.com/api/contentsite_api/media/parse';
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const PARSE_TIMEOUT_MS = 30_000;
const DOWNLOAD_TIMEOUT_MS = 120_000;

const MIME_TYPES = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  opus: 'audio/ogg',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

/**
 * @typedef {object} MediaResource
 * @property {'video' | 'audio' | 'image'} type
 * @property {string} quality
 * @property {string} format
 * @property {number} sizeBytes
 * @property {string} downloadUrl
 */

/**
 * @typedef {object} ParsedMedia
 * @property {string} sourceUrl
 * @property {string} title
 * @property {number} duration
 * @property {string | null} thumbnail
 * @property {MediaResource[]} videos
 * @property {MediaResource[]} audios
 * @property {MediaResource[]} images
 */

/**
 * @typedef {object} DownloadedMedia
 * @property {'video' | 'audio' | 'image'} type
 * @property {string} quality
 * @property {string} format
 * @property {string} downloadUrl
 * @property {string} mime
 * @property {string} filename
 * @property {Buffer} buffer
 */

/**
 * Strip invisible formatting characters that chat apps append to copied URLs.
 *
 * @param {string} value
 * @returns {string}
 */
function sanitizeUrl(value) {
  return String(value || '')
    .replace(/[\u200B-\u200F\u2060\uFEFF]/g, '')
    .trim();
}

/**
 * Read the provider's reason from a failed parse response.
 *
 * @param {any} json
 * @returns {string}
 */
function parseFailureReason(json) {
  const raw = String(json?.msg || '');
  const prefix = 'parse error:';
  if (!raw.toLowerCase().startsWith(prefix)) return '';

  try {
    const detail = JSON.parse(raw.slice(prefix.length).trim());
    return String(detail?.msg || '')
      .replace(/^invalid status:\s*/i, '')
      .replace(/^error\s+/i, '')
      .trim();
  } catch {
    return '';
  }
}

function decryptPayload(ciphertext) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', AES_KEY, AES_IV);
  decipher.setAutoPadding(false);
  let decrypted = decipher.update(ciphertext, 'base64', 'utf-8');
  decrypted += decipher.final('utf-8');
  return JSON.parse(decrypted.replace(/\0+$/, ''));
}

function normalizeType(type) {
  const value = String(type || 'video').toLowerCase();
  return value === 'picture' ? 'image' : value;
}

function qualityRank(quality) {
  const text = String(quality || '');
  const height = /(\d{3,4})\s*p/i.exec(text);
  if (height) return Number(height[1]);
  const bitrate = /(\d+)\s*kbps/i.exec(text);
  if (bitrate) return Number(bitrate[1]);
  return 0;
}

function compareResources(a, b) {
  return (
    qualityRank(b.quality) - qualityRank(a.quality) || b.sizeBytes - a.sizeBytes
  );
}

/**
 * Dedupe key: images expose the same file across many renditions that only
 * differ by query string, while video/audio renditions differ by quality.
 *
 * @param {MediaResource} item
 */
function resourceKey(item) {
  let pathname = item.downloadUrl;
  try {
    pathname = new URL(item.downloadUrl).pathname;
  } catch {}
  if (item.type === 'image') return `image|${pathname}`;
  return `${item.type}|${item.format}|${item.quality}|${pathname}`;
}

/**
 * Flatten every downloadable resource, merging the metadata list
 * (`resources`) with the stream list (`media[].resources`).
 *
 * @param {any} raw
 * @returns {MediaResource[]}
 */
function collectResources(raw) {
  const byKey = new Map();

  const add = (resource, parentType) => {
    if (!resource?.download_url) return;
    const item = {
      type: normalizeType(resource.type || parentType),
      quality: resource.quality || 'Default',
      format: String(resource.format || 'mp4').toLowerCase(),
      sizeBytes: Number(resource.size) || 0,
      downloadUrl: resource.download_url,
    };
    const key = resourceKey(item);
    /** @type {MediaResource | undefined} */
    const existing = byKey.get(key);
    if (existing) {
      if (existing.quality === 'Default') existing.quality = item.quality;
      existing.sizeBytes = existing.sizeBytes || item.sizeBytes;
      return;
    }
    byKey.set(key, item);
  };

  for (const resource of raw.resources || []) add(resource);
  for (const media of raw.media || []) {
    for (const resource of media.resources || []) add(resource, media.type);
  }

  return [...byKey.values()];
}

/**
 * Resolve a downloadable media URL into a normalized format list.
 *
 * @param {string} url
 * @returns {Promise<ParsedMedia>}
 */
export async function parseMedia(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Valid media URL is required');
  }

  const target = sanitizeUrl(url);
  if (!target) {
    throw new Error('Valid media URL is required');
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(target);
  } catch {
    throw new Error('Valid media URL is required');
  }
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('Valid media URL is required');
  }

  const response = await Http.withHeaders({
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': USER_AGENT,
    Origin: 'https://vidssave.com',
    Referer: 'https://vidssave.com/',
  })
    .timeout(PARSE_TIMEOUT_MS)
    .post(
      API_URL,
      new URLSearchParams({
        hostname: 'vidssave.com',
        auth: '4c9b7d21',
        domain: 'api-ak.vidssave.com',
        link: target,
        source: 'source',
      })
    );

  if (!response.ok()) {
    throw new Error(`Media parser responded with HTTP ${response.status()}`);
  }

  let json;
  try {
    json = await response.json();
  } catch {
    throw new Error('Media parser returned an invalid response');
  }

  if (!json || json.status !== 1 || !json.data) {
    throw new Error(
      parseFailureReason(json) || 'Unsupported or unavailable media URL'
    );
  }

  let raw;
  try {
    raw = typeof json.data === 'string' ? decryptPayload(json.data) : json.data;
  } catch {
    throw new Error('Failed to decode media payload');
  }

  const resources = collectResources(raw);
  const videos = resources
    .filter((item) => item.type === 'video')
    .sort(compareResources);
  const audios = resources
    .filter((item) => item.type === 'audio')
    .sort(compareResources);
  const images = resources
    .filter((item) => item.type === 'image')
    .sort(compareResources);

  if (!videos.length && !audios.length && !images.length) {
    throw new Error('No downloadable media found for this URL');
  }

  return {
    sourceUrl: target,
    title: raw.title || '',
    duration: Number(raw.duration) || 0,
    thumbnail: raw.thumbnail || null,
    videos,
    audios,
    images,
  };
}

const PREFERRED_FORMATS = {
  video: ['mp4'],
  audio: ['mp3', 'm4a'],
};

function pickResource(resources, type, quality) {
  if (quality) {
    const wanted = String(quality).trim().toLowerCase();
    return (
      resources.find((item) => item.quality.toLowerCase() === wanted) || null
    );
  }

  // Prefer formats WhatsApp can actually play over a marginally better one.
  const preferred = PREFERRED_FORMATS[type] || [];
  return (
    resources.find((item) => preferred.includes(item.format)) ||
    resources[0] ||
    null
  );
}

function slugifyFilename(title, fallback) {
  const base = String(title || '')
    .replace(/[\\/:*?"<>|\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
  return base || fallback;
}

function parseContentDispositionFilename(header) {
  if (!header) return '';
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8) {
    try {
      return decodeURIComponent(utf8[1]);
    } catch {}
  }
  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain ? plain[1].trim() : '';
}

/**
 * Download the best matching resource (or an exact quality) into a Buffer.
 *
 * @param {string} url
 * @param {{ type?: 'video' | 'audio' | 'image', quality?: string }} [options]
 * @returns {Promise<DownloadedMedia>}
 */
export async function downloadMedia(url, options = {}) {
  const { type = 'video', quality } = options;
  const parsed = await parseMedia(url);

  const bucket =
    type === 'audio'
      ? parsed.audios
      : type === 'image'
        ? parsed.images
        : parsed.videos;
  const resource = pickResource(bucket, type, quality);
  if (!resource) {
    throw new Error(
      quality
        ? `No ${type} available at quality "${quality}"`
        : `No downloadable ${type} found for this URL`
    );
  }

  const host = new URL(resource.downloadUrl).hostname;
  // Twitter's video CDN rejects requests unless they look like an X client.
  const isTwitterCdn = host === 'video.twimg.com';
  const response = await Http.withHeaders({
    'User-Agent': USER_AGENT,
    Accept: '*/*',
    Referer: isTwitterCdn ? 'https://x.com/' : 'https://vidssave.com/',
    ...(isTwitterCdn ? { Origin: 'https://x.com' } : {}),
  })
    .timeout(DOWNLOAD_TIMEOUT_MS)
    .get(resource.downloadUrl);

  if (!response.ok()) {
    throw new Error(`Media download failed with HTTP ${response.status()}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length) {
    throw new Error('Media download returned an empty file');
  }

  const responseMime = response.headers().get('content-type') || '';
  let mime =
    responseMime.startsWith('application/octet-stream') || !responseMime
      ? MIME_TYPES[resource.format] || 'application/octet-stream'
      : responseMime.split(';')[0];
  // YouTube serves opus audio as video/webm; the stream is still audio-only.
  if (resource.type === 'audio' && mime.startsWith('video/')) {
    mime = mime.replace('video/', 'audio/');
  }

  const ext = resource.format || 'bin';
  const filename =
    parseContentDispositionFilename(
      response.headers().get('content-disposition')
    ) || `${slugifyFilename(parsed.title, 'media')}.${ext}`;

  return {
    type: resource.type,
    quality: resource.quality,
    format: resource.format,
    downloadUrl: resource.downloadUrl,
    mime,
    filename,
    buffer,
  };
}

export default { parseMedia, downloadMedia };
