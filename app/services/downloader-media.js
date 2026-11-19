import crypto from 'node:crypto';
import net from 'node:net';
import vm from 'node:vm';
import { Http } from '@nakiri/core/utils/http';

if (typeof net.setDefaultAutoSelectFamilyAttemptTimeout === 'function') {
  net.setDefaultAutoSelectFamilyAttemptTimeout(5000);
}

const AES_KEY = Buffer.from('4c9b7d2e'.repeat(3) + '4c9b7d21', 'utf-8');
const AES_IV = Buffer.from('4c9b7d2e4c9b7d2e', 'utf-8');
const SITE_URL = 'https://vidssave.com/';
const DEFAULT_SDK_URL =
  'https://res.vidssave.com/vidssave-com/sdk/js/sdk/NGM5YjdkMjE/20014-3af4f2f538f6f792.js';
const LEGACY_PARSE_API_URL =
  'https://api.vidssave.com/api/contentsite_api/media/parse';
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const PARSE_TIMEOUT_MS = 30_000;
const TASK_TIMEOUT_MS = 90_000;
const DOWNLOAD_TIMEOUT_MS = 120_000;

const MAX_AUTO_VIDEO_BYTES = 95 * 1024 * 1024;
const MAX_AUTO_TASK_VIDEO_RANK = 720;

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
 * @property {string} [resourceContent]
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

let sdkPromise = null;

/**
 * Discover and initialize the VidsSave DownloaderSDK in an isolated VM context.
 *
 * @param {boolean} [forceRefresh=false]
 * @returns {Promise<any>}
 */
async function getDownloaderSdk(forceRefresh = false) {
  if (sdkPromise && !forceRefresh) {
    return sdkPromise;
  }

  sdkPromise = (async () => {
    let sdkUrl = DEFAULT_SDK_URL;
    try {
      const pageRes = await Http.withHeaders({ 'User-Agent': USER_AGENT })
        .timeout(10_000)
        .get(SITE_URL);
      if (pageRes.ok()) {
        const html = await pageRes.text();
        const match = html.match(
          /(?:https?:)?\/\/res\.vidssave\.com\/vidssave-com\/sdk\/js\/sdk\/[^"'\s]+\.js/i
        );
        if (match) {
          sdkUrl = match[0].startsWith('//') ? `https:${match[0]}` : match[0];
        }
      }
    } catch {
      // Fallback to DEFAULT_SDK_URL
    }

    const sdkRes = await Http.withHeaders({ 'User-Agent': USER_AGENT })
      .timeout(15_000)
      .get(sdkUrl);
    if (!sdkRes.ok()) {
      throw new Error(`Failed to load Downloader SDK (HTTP ${sdkRes.status()})`);
    }

    const code = await sdkRes.text();
    /** @type {any} */
    const sandbox = {
      ...globalThis,
      window: null,
      self: null,
      globalThis: null,
      crypto: globalThis.crypto,
      btoa: globalThis.btoa,
      atob: globalThis.atob,
      fetch: globalThis.fetch,
      document: { querySelector: () => null },
      navigator: { userAgent: USER_AGENT },
      location: { hostname: 'vidssave.com', search: '' },
      URLSearchParams,
      URL,
      AbortController,
      DOMException,
      setTimeout,
      clearTimeout,
      Promise,
      JSON,
      Object,
      Array,
      String,
      Number,
      Boolean,
      RegExp,
      Error,
      TypeError,
      Math,
      Date,
      Map,
      Set,
      WeakMap,
      Symbol,
      Uint8Array,
      Int32Array,
      Uint32Array,
      DataView,
      ArrayBuffer,
      TextEncoder,
      TextDecoder,
      console,
    };
    sandbox.window = sandbox;
    sandbox.self = sandbox;
    sandbox.globalThis = sandbox;

    vm.runInNewContext(code, sandbox);
    const sdkEntry = Object.values(sandbox.DownloaderSDKs || {})[0];
    if (!sdkEntry || typeof sdkEntry.create !== 'function') {
      throw new Error('Downloader SDK entry point not found');
    }

    return await sdkEntry.create({
      commParams: { domain: 'vidssave.com', siteDomain: 'vidssave.com' },
    });
  })().catch((err) => {
    sdkPromise = null;
    throw err;
  });

  return sdkPromise;
}

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
 * Check whether a URL points to YouTube.
 *
 * @param {URL} parsedUrl
 * @returns {boolean}
 */
function isYouTubeUrl(parsedUrl) {
  const host = parsedUrl.hostname.replace(/^www\./i, '').toLowerCase();
  return (
    host === 'youtu.be' ||
    host === 'youtube.com' ||
    host.endsWith('.youtube.com')
  );
}

/**
 * Check whether a direct download URL is usable from our server.
 * YouTube `googlevideo.com` URLs returned by the parser are IP-bound to the
 * parser's server and `check_download` URLs are truncated placeholders.
 *
 * @param {string} url
 * @param {string} [downloadMode]
 * @returns {boolean}
 */
function isDirectUrlUsable(url, downloadMode) {
  if (!url || typeof url !== 'string') return false;
  if (downloadMode === 'check_download') return false;
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    if (parsed.hostname.toLowerCase().endsWith('.googlevideo.com')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Read the provider's reason from a failed parse response.
 *
 * @param {any} json
 * @returns {string}
 */
function parseFailureReason(json) {
  const raw = String(json?.msg || '').trim();
  if (!raw) return '';

  const prefix = 'parse error:';
  if (raw.toLowerCase().startsWith(prefix)) {
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

  return raw
    .replace(/^invalid status:\s*/i, '')
    .replace(/^error\s+/i, '')
    .trim();
}

function decryptPayload(ciphertext) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', AES_KEY, AES_IV);
  decipher.setAutoPadding(false);
  let decrypted = decipher.update(ciphertext, 'base64', 'utf-8');
  decrypted += decipher.final('utf-8');
  return JSON.parse(decrypted.replace(/\0+$/, ''));
}

function decodeApiData(data) {
  if (!data) return null;
  if (typeof data !== 'string') return data;
  const trimmed = data.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return JSON.parse(trimmed);
  }
  return decryptPayload(trimmed);
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
  if (item.type === 'image') {
    let pathname = item.downloadUrl || item.resourceContent || '';
    if (item.downloadUrl) {
      try {
        pathname = new URL(item.downloadUrl).pathname;
      } catch {}
    }
    return `image|${pathname}`;
  }
  return `${item.type}|${item.format}|${item.quality.toUpperCase()}`;
}

/**
 * Flatten every downloadable resource, merging cached direct resources,
 * metadata resources (`resources`), and stream resources (`media[].resources`).
 *
 * @param {any} raw
 * @param {any} [cachedRaw]
 * @returns {MediaResource[]}
 */
function collectResources(raw, cachedRaw = null) {
  const byKey = new Map();

  const add = (resource, parentType) => {
    if (!resource) return;
    const usableUrl = isDirectUrlUsable(
      resource.download_url,
      resource.download_mode
    )
      ? resource.download_url
      : '';
    const resourceContent =
      typeof resource.resource_content === 'string'
        ? resource.resource_content.trim()
        : '';

    if (!usableUrl && !resourceContent) return;

    /** @type {MediaResource} */
    const item = {
      type: normalizeType(resource.type || parentType),
      quality: String(resource.quality || 'Default').trim() || 'Default',
      format: String(
        resource.format || resource.original_format || 'mp4'
      ).toLowerCase(),
      sizeBytes: Number(resource.size) || 0,
      downloadUrl: usableUrl,
      resourceContent,
    };

    const key = resourceKey(item);
    /** @type {MediaResource | undefined} */
    const existing = byKey.get(key);
    if (existing) {
      if (existing.quality === 'Default' && item.quality !== 'Default') {
        existing.quality = item.quality;
      }
      if (!existing.downloadUrl && item.downloadUrl) {
        existing.downloadUrl = item.downloadUrl;
      }
      if (!existing.resourceContent && item.resourceContent) {
        existing.resourceContent = item.resourceContent;
      }
      existing.sizeBytes = existing.sizeBytes || item.sizeBytes;
      return;
    }
    byKey.set(key, item);
  };

  for (const resource of cachedRaw?.resources || []) add(resource);
  for (const resource of raw?.resources || []) add(resource);
  for (const media of raw?.media || []) {
    for (const resource of media?.resources || []) add(resource, media.type);
  }

  return [...byKey.values()];
}

/**
 * Call VidsSave parse endpoint via official SDK (with fallback to legacy endpoint).
 *
 * @param {string} target
 * @param {'source' | 'cache'} origin
 * @returns {Promise<{ ok: boolean, status: number, json: any, raw: any }>}
 */
async function requestParse(target, origin) {
  try {
    const sdk = await getDownloaderSdk();
    const json = await sdk.parseLink({ origin, link: target });
    if (json && json.status === 1 && json.data) {
      const raw = decodeApiData(json.data);
      return { ok: Boolean(raw), status: 200, json, raw };
    }
    return { ok: false, status: 200, json, raw: null };
  } catch {
    // Fallback to legacy contentsite_api
    const response = await Http.withHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
      Origin: 'https://vidssave.com',
      Referer: 'https://vidssave.com/',
    })
      .timeout(PARSE_TIMEOUT_MS)
      .post(
        LEGACY_PARSE_API_URL,
        new URLSearchParams({
          hostname: 'vidssave.com',
          auth: '4c9b7d21',
          domain: 'api-ak.vidssave.com',
          link: target,
          origin,
          source: origin,
        })
      );

    if (!response.ok()) {
      return { ok: false, status: response.status(), json: null, raw: null };
    }

    let json;
    try {
      json = await response.json();
    } catch {
      return { ok: false, status: response.status(), json: null, raw: null };
    }

    if (!json || json.status !== 1 || !json.data) {
      return { ok: false, status: response.status(), json, raw: null };
    }

    try {
      const raw = decodeApiData(json.data);
      return { ok: Boolean(raw), status: response.status(), json, raw };
    } catch {
      return { ok: false, status: response.status(), json, raw: null };
    }
  }
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

  const isYt = isYouTubeUrl(parsedUrl);
  const [sourceResult, cacheResult] = await Promise.all([
    requestParse(target, 'source'),
    isYt ? requestParse(target, 'cache').catch(() => null) : Promise.resolve(null),
  ]);

  let primaryResult = sourceResult;
  if (!primaryResult.ok && !cacheResult?.ok) {
    primaryResult = await requestParse(target, 'source');
  }

  const raw = primaryResult.raw || cacheResult?.raw;
  if (!raw) {
    if (primaryResult.status && primaryResult.status !== 200) {
      throw new Error(`Media parser responded with HTTP ${primaryResult.status}`);
    }
    throw new Error(
      parseFailureReason(primaryResult.json) ||
        'Unsupported or unavailable media URL'
    );
  }

  const resources = collectResources(raw, cacheResult?.raw);
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
    title: raw.title || cacheResult?.raw?.title || '',
    duration: Number(raw.duration || cacheResult?.raw?.duration) || 0,
    thumbnail: raw.thumbnail || cacheResult?.raw?.thumbnail || null,
    videos,
    audios,
    images,
  };
}

const PREFERRED_FORMATS = {
  video: ['mp4'],
  audio: ['mp3', 'm4a'],
};

/**
 * Pick the best matching resource for the requested type and quality.
 *
 * @param {MediaResource[]} resources
 * @param {'video' | 'audio' | 'image'} type
 * @param {string} [quality]
 * @returns {MediaResource | null}
 */
function pickResource(resources, type, quality) {
  if (!resources.length) return null;

  if (quality) {
    const wanted = String(quality).trim().toLowerCase();
    return (
      resources.find((item) => item.quality.toLowerCase() === wanted) || null
    );
  }

  const preferred = PREFERRED_FORMATS[type] || [];
  const formatMatches = preferred.length
    ? resources.filter((item) => preferred.includes(item.format))
    : [];
  const candidates = formatMatches.length ? formatMatches : resources;

  if (type !== 'video') {
    return (
      candidates.find((item) => Boolean(item.downloadUrl)) ||
      candidates[0] ||
      null
    );
  }

  const sizeSafe = candidates.filter(
    (item) => !item.sizeBytes || item.sizeBytes <= MAX_AUTO_VIDEO_BYTES
  );
  const pool = sizeSafe.length
    ? sizeSafe
    : [candidates[candidates.length - 1]];

  // Prefer already-cached direct URLs first, then <= 720p task-based merges
  const directCandidate = pool.find((item) => Boolean(item.downloadUrl));
  if (directCandidate) return directCandidate;

  const fastTaskCandidate = pool.find(
    (item) => qualityRank(item.quality) <= MAX_AUTO_TASK_VIDEO_RANK
  );

  return fastTaskCandidate || pool[0] || null;
}

/**
 * Resolve a signed download URL from `resourceContent` via VidsSave DownloaderSDK.
 *
 * @param {string} resourceContent
 * @returns {Promise<string>}
 */
async function resolveTaskDownloadUrl(resourceContent) {
  const sdk = await getDownloaderSdk();
  const created = await sdk.createDownload({ request: resourceContent });

  if (!created || created.status !== 1 || !created.data) {
    throw new Error(
      parseFailureReason(created) || 'Failed to create media download task'
    );
  }

  if (created.data.download_link) {
    return created.data.download_link;
  }

  const taskId = created.data.task_id;
  if (!taskId) {
    throw new Error('Media download task ID is missing');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TASK_TIMEOUT_MS);

  try {
    let resolvedLink = '';
    let failureMsg = '';

    await sdk.watchProgress(
      { task_id: taskId },
      (event) => {
        if (event?.status === 'success' && event?.download_link) {
          resolvedLink = event.download_link;
        } else if (event?.status === 'failed') {
          failureMsg = event?.msg || 'Media conversion task failed';
        }
      },
      { signal: controller.signal }
    );

    if (resolvedLink) {
      return resolvedLink;
    }
    if (failureMsg) {
      throw new Error(failureMsg);
    }
    throw new Error('Timed out waiting for media download link');
  } finally {
    clearTimeout(timer);
  }
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
 * Fetch the binary media file from a resolved download URL.
 *
 * @param {string} downloadUrl
 * @returns {Promise<import('@nakiri/core/utils/http').HttpResponse>}
 */
async function fetchMediaBinary(downloadUrl) {
  const host = new URL(downloadUrl).hostname;
  const isTwitterCdn = host === 'video.twimg.com';
  const isRedirectEndpoint = downloadUrl.includes('/redirect?');

  return await Http.withHeaders({
    'User-Agent': USER_AGENT,
    Accept: '*/*',
    ...(isTwitterCdn
      ? { Referer: 'https://x.com/', Origin: 'https://x.com' }
      : isRedirectEndpoint
        ? {}
        : { Referer: 'https://vidssave.com/' }),
  })
    .timeout(DOWNLOAD_TIMEOUT_MS)
    .get(downloadUrl);
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

  let finalDownloadUrl = resource.downloadUrl;
  let response = null;

  if (finalDownloadUrl) {
    try {
      response = await fetchMediaBinary(finalDownloadUrl);
      if (!response.ok() && resource.resourceContent) {
        response = null;
      }
    } catch (err) {
      if (!resource.resourceContent) throw err;
      response = null;
    }
  }

  if (!response) {
    if (!resource.resourceContent) {
      throw new Error('No valid download link available for this media');
    }
    finalDownloadUrl = await resolveTaskDownloadUrl(resource.resourceContent);
    response = await fetchMediaBinary(finalDownloadUrl);
  }

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
    downloadUrl: finalDownloadUrl,
    mime,
    filename,
    buffer,
  };
}

export default { parseMedia, downloadMedia };
