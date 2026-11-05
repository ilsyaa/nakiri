import ff from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { dirTemp, dirCore, dirStorage } from '@nakiri/core/utils/path';
import logger from '@nakiri/core/utils/logger';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const getTmp = (ext) => {
  return path.join(
    dirTemp(),
    `${crypto.randomBytes(16).toString('hex')}.${ext}`
  );
};

async function ffConvert(buffer, extIn, extOut, setup) {
  const tmpIn = getTmp(extIn);
  const tmpOut = getTmp(extOut);

  await fs.mkdir(dirTemp(), { recursive: true });
  await fs.writeFile(tmpIn, buffer);

  return new Promise((resolve, reject) => {
    const command = ff(tmpIn);
    setup(command);

    command
      .on('error', (err) => {
        fs.unlink(tmpIn).catch(() => {});
        reject(new Error(err.message));
      })
      .on('end', async () => {
        try {
          const res = await fs.readFile(tmpOut);
          resolve(res);
        } catch (e) {
          reject(e);
        } finally {
          fs.unlink(tmpIn).catch(() => {});
          fs.unlink(tmpOut).catch(() => {});
        }
      })
      .save(tmpOut);
  });
}

/**
 * @param {import('./converter.d.ts').WebpConvertOptions} [options]
 * @returns {string}
 */
function buildWebpFilter({ crop = true, memeText = '' } = {}) {
  let vf = crop
    ? 'scale=320:320:force_original_aspect_ratio=increase,crop=320:320,fps=15'
    : "scale='min(320,iw)':'min(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0";
  if (memeText) {
    const parts = memeText.split('|');
    const top = parts[0]?.trim() || '';
    const bottom = parts.length > 1 ? parts.slice(1).join('|').trim() : '';
    const escape = (t) => t.replace(/'/g, '\u2019').replace(/:/g, '\\:');
    const fontPath = path
      .join(dirStorage(), 'fonts/meme.ttf')
      .replace(/\\/g, '/')
      .replace(/:/g, '\\:');

    if (top) {
      vf += `, drawtext=fontfile='${fontPath}':text='${escape(top)}':fontcolor=white:fontsize=38:x=(w-text_w)/2:y=10:borderw=2:bordercolor=black`;
    }

    if (bottom) {
      vf += `, drawtext=fontfile='${fontPath}':text='${escape(bottom)}':fontcolor=white:fontsize=38:x=(w-text_w)/2:y=(h-text_h)-10:borderw=2:bordercolor=black`;
    }
  }

  vf +=
    ',split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse';

  return vf;
}

/**
 * @param {string | import('./converter.d.ts').WebpConvertOptions} [memeTextOrOptions]
 * @param {boolean | import('./converter.d.ts').WebpConvertOptions} [options]
 * @returns {import('./converter.d.ts').WebpConvertOptions}
 */
function resolveConverterOptions(memeTextOrOptions, options) {
  let memeText;
  let crop = true;
  if (typeof memeTextOrOptions === 'string') {
    memeText = memeTextOrOptions;
  } else if (memeTextOrOptions && typeof memeTextOrOptions === 'object') {
    memeText = memeTextOrOptions.memeText;
    if (typeof memeTextOrOptions.crop === 'boolean') {
      crop = memeTextOrOptions.crop;
    }
  }

  if (typeof options === 'boolean') {
    crop = options;
  } else if (options && typeof options === 'object') {
    if (typeof options.crop === 'boolean') {
      crop = options.crop;
    }
  }

  return { memeText, crop };
}

export async function imageToWebp(buffer, memeTextOrOptions, options) {
  const { memeText, crop } = resolveConverterOptions(
    memeTextOrOptions,
    options
  );
  return ffConvert(buffer, 'jpg', 'webp', (cmd) => {
    const vf = buildWebpFilter({ crop, memeText });
    cmd.videoCodec('libwebp').videoFilters(vf).toFormat('webp');
  });
}

export async function videoToWebp(buffer, memeTextOrOptions, options) {
  const { memeText, crop } = resolveConverterOptions(
    memeTextOrOptions,
    options
  );
  return ffConvert(buffer, 'mp4', 'webp', (cmd) => {
    const vf = buildWebpFilter({ crop, memeText });

    cmd
      .videoCodec('libwebp')
      .videoFilters(vf)
      .outputOptions([
        '-loop',
        '0',
        '-ss',
        '00:00:00',
        '-t',
        '00:00:05',
        '-preset',
        'default',
        '-an',
        '-vsync',
        '0',
      ])
      .toFormat('webp');
  });
}

export async function stickerToImage(buffer) {
  try {
    return await ffConvert(buffer, 'webp', 'png', (cmd) => {
      cmd.addOutputOptions(['-vframes', '1', '-vcodec', 'png']);
    });
  } catch (err) {
    // If FFmpeg fails on animated/extended WebP (code 69), fallback to ImageMagick
    const tmpIn = getTmp('webp');
    const tmpOut = getTmp('png');
    await fs.mkdir(dirTemp(), { recursive: true });
    await fs.writeFile(tmpIn, buffer);

    try {
      await execAsync(`convert ${tmpIn}[0] ${tmpOut}`);
      return await fs.readFile(tmpOut);
    } catch {
      throw err;
    } finally {
      fs.unlink(tmpIn).catch(() => {});
      fs.unlink(tmpOut).catch(() => {});
    }
  }
}

export async function stickerToVideo(buffer) {
  const tmpIn = getTmp('webp');
  await fs.writeFile(tmpIn, buffer);

  try {
    return await ffConvert(buffer, 'webp', 'mp4', (cmd) => {
      cmd.inputOptions(['-vcodec', 'libwebp_anim']);
      cmd
        .addOutputOptions([
          '-vf',
          'crop=trunc(iw/2)*2:trunc(ih/2)*2',
          '-b:v',
          '2M',
          '-vcodec',
          'libx264',
          '-pix_fmt',
          'yuv420p',
        ])
        .toFormat('mp4');
    });
  } catch (err) {
    logger.warn(
      '[CONVERTER]',
      'FFmpeg libwebp_anim missing, falling back to ImageMagick...'
    );

    const tmpGif = getTmp('gif');
    try {
      await execAsync(`convert ${tmpIn} ${tmpGif}`);
      const gifBuffer = await fs.readFile(tmpGif);

      return await ffConvert(gifBuffer, 'gif', 'mp4', (cmd) => {
        cmd
          .addOutputOptions([
            '-vf',
            'crop=trunc(iw/2)*2:trunc(ih/2)*2',
            '-b:v',
            '2M',
            '-vcodec',
            'libx264',
            '-pix_fmt',
            'yuv420p',
          ])
          .toFormat('mp4');
      });
    } catch (magickErr) {
      throw new Error(
        `Failed to convert animated WebP. Please install ImageMagick (convert). FFmpeg err: ${err.message}`
      );
    } finally {
      fs.unlink(tmpGif).catch(() => {});
    }
  } finally {
    fs.unlink(tmpIn).catch(() => {});
  }
}

export async function toAudio(buffer, ext = 'mp3') {
  return ffConvert(buffer, 'mp4', ext, (cmd) => {
    cmd.toFormat(ext);
  });
}

export async function toPTT(buffer) {
  return ffConvert(buffer, 'mp3', 'ogg', (cmd) => {
    cmd
      .audioCodec('libopus')
      .toFormat('ogg')
      .addOutputOptions([
        '-ac',
        '1',
        '-ar',
        '48000',
        '-b:a',
        '128k',
        '-map',
        'a',
      ]);
  });
}

export async function toVideo(buffer, ext = 'mp4') {
  return ffConvert(buffer, 'bin', ext, (cmd) => {
    cmd.toFormat(ext);
  });
}

export async function compressVideo(buffer) {
  return ffConvert(buffer, 'mp4', 'mp4', (cmd) => {
    cmd.addOutputOptions([
      '-vcodec',
      'libx264',
      '-crf',
      '28',
      '-preset',
      'faster',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-movflags',
      '+faststart',
    ]);
  });
}

export function toNumber(value, fallback = 0) {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
}

export function toBoolean(value) {
  if (typeof value === 'boolean') return value;

  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return ['true', '1', 'yes', 'y', 'on'].includes(lower);
  }

  if (typeof value === 'number') return value > 0;

  return !!value;
}

export function parseDurationToMs(timeStr) {
  if (!timeStr) return 0;

  const regex = /(\d+)\s*(d|h|m|s)/gi;
  let totalMs = 0;
  let match;

  while ((match = regex.exec(timeStr)) !== null) {
    const val = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    if (unit === 'd') totalMs += val * 24 * 60 * 60 * 1000;
    if (unit === 'h') totalMs += val * 60 * 60 * 1000;
    if (unit === 'm') totalMs += val * 60 * 1000;
    if (unit === 's') totalMs += val * 1000;
  }

  return totalMs;
}

export function formatMsToDuration(ms) {
  if (ms <= 0) return '0 detik';

  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const parts = [];

  if (days > 0) parts.push(`${days} hari`);
  if (hours > 0) parts.push(`${hours} jam`);
  if (minutes > 0) parts.push(`${minutes} menit`);
  if (seconds > 0) parts.push(`${seconds} detik`);

  return parts.join(' ');
}

export function toBase64(data) {
  return Buffer.isBuffer(data)
    ? data.toString('base64')
    : Buffer.from(String(data)).toString('base64');
}

export function fromBase64(base64) {
  return Buffer.from(base64, 'base64').toString('utf8');
}
