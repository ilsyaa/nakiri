import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { dirStorage, dirTemp } from '@nakiri/core/utils/path';

export class Storage {
  static async save(buffer, options = {}) {
    const targetDir = dirStorage(options.subDir || '');
    await fs.mkdir(targetDir, { recursive: true });

    const finalName =
      options.filename || `${crypto.randomBytes(16).toString('hex')}.bin`;
    const filePath = path.join(targetDir, finalName);
    await fs.writeFile(filePath, buffer);

    return filePath;
  }

  static async saveTmp(buffer, options = {}) {
    const targetDir = dirTemp();
    await fs.mkdir(targetDir, { recursive: true });

    const finalName =
      options.filename || `${crypto.randomBytes(16).toString('hex')}.tmp`;
    const filePath = path.join(targetDir, finalName);
    await fs.writeFile(filePath, buffer);

    const ttl = options.ttlMs !== undefined ? options.ttlMs : 5 * 60 * 1000;
    if (ttl > 0) {
      setTimeout(() => {
        fs.unlink(filePath).catch(() => {});
      }, ttl).unref();
    }

    return filePath;
  }

  static async clearTmp() {
    const targetDir = dirTemp();
    try {
      const files = await fs.readdir(targetDir);
      await Promise.all(
        files.map((file) =>
          fs.unlink(path.join(targetDir, file)).catch(() => {})
        )
      );
    } catch {}
  }

  static async getBuffer(filepath) {
    try {
      return await fs.readFile(filepath);
    } catch {
      return null;
    }
  }

  static async exists(filepath) {
    try {
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  static async delete(filepath) {
    try {
      await fs.unlink(filepath);
      return true;
    } catch {
      return false;
    }
  }
}

export default Storage;
