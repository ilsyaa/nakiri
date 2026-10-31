import ff from 'fluent-ffmpeg';
import webp from 'node-webpmux';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { dirTemp } from '@nakiri/core/utils/path';

const getTmp = (ext) => {
  return path.join(
    dirTemp(),
    `${crypto.randomBytes(16).toString('hex')}.${ext}`
  );
};

export async function writeExif(buffer, metadata) {
  const img = new webp.Image();
  const json = {
    'sticker-pack-id': 'com.lazybot.sticker',
    'sticker-pack-name': metadata.packname || '',
    'sticker-pack-publisher': metadata.author || '',
    emojis:
      metadata.categories && metadata.categories.length > 0
        ? metadata.categories
        : [''],
  };

  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
    0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
  ]);

  const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8');
  const exif = Buffer.concat([exifAttr, jsonBuff]);
  exif.writeUIntLE(jsonBuff.length, 14, 4);

  await img.load(buffer);
  img.exif = exif;

  return await img.save(null);
}

export async function extractMetadata(buffer, ext = 'mp4') {
  const tmpIn = getTmp(ext);
  await fs.mkdir(dirTemp(), { recursive: true });
  await fs.writeFile(tmpIn, buffer);

  return new Promise((resolve, reject) => {
    ff.ffprobe(tmpIn, (err, metadata) => {
      fs.unlink(tmpIn).catch(() => {});
      if (err) return reject(err);

      const stream =
        metadata.streams.find((s) => s.codec_type === 'video') ||
        metadata.streams[0];
      const format = metadata.format;

      resolve({
        duration: format?.duration,
        width: stream?.width,
        height: stream?.height,
        size: format?.size,
        bitrate: format?.bit_rate ? format.bit_rate / 1000 : undefined,
        format: format?.format_name,
      });
    });
  });
}
