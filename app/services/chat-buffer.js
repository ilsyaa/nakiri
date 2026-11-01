import fs from 'node:fs';
import path from 'node:path';
import db from '@nakiri/core/services/database';
import logger from '@nakiri/core/utils/logger';
import { DateTime } from 'luxon';

const WAL_FILE = path.resolve('storage/temp/chat_buffer.wal');
const FLUSH_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
const MAX_BUFFER_COUNT = 30; // Auto-flush when group buffer reaches 30 messages

class ChatBufferService {
  constructor() {
    /** @type {Map<string, Array<{ text: string, date: string }>>} */
    this.buffers = new Map();
    this.timer = null;
    this.isFlushing = false;
    this.shutdownRegistered = false;
  }

  /**
   * Initialize WAL file and timer
   */
  init() {
    try {
      const dir = path.dirname(WAL_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (!fs.existsSync(WAL_FILE)) {
        fs.writeFileSync(WAL_FILE, '', 'utf8');
      }
    } catch (err) {
      logger.error(
        '[CHAT_BUFFER]',
        `Failed to initialize WAL file: ${err.message}`
      );
    }

    // Auto-recover any leftover logs from previous abnormal termination
    this.recover();

    // Start periodic background flusher
    if (!this.timer) {
      this.timer = setInterval(() => {
        this.flush().catch((err) => {
          logger.error('[CHAT_BUFFER]', `Periodic flush error: ${err.message}`);
        });
      }, FLUSH_INTERVAL_MS);
      if (this.timer.unref) this.timer.unref();
    }

    this.registerShutdownHooks();
  }

  /**
   * Buffer a group message
   * @param {string} groupId
   * @param {{ senderName: string, text: string, timestamp?: number }} param1
   */
  bufferMessage(groupId, { senderName, text, timestamp }) {
    if (!groupId || !text) return;

    const dt = timestamp
      ? DateTime.fromMillis(timestamp, { zone: 'utc' })
      : DateTime.utc();
    const timeStr = dt.toFormat('HH:mm');
    const dateStr = dt.toFormat('yyyy-MM-dd');
    const cleanSender = (senderName || 'Member').replace(/[\r\n]/g, ' ').trim();
    const cleanText = text.replace(/[\r\n]+/g, ' ').trim();

    const logLine = `[${timeStr}] ${cleanSender}: ${cleanText}`;

    // 1. In-Memory buffer
    if (!this.buffers.has(groupId)) {
      this.buffers.set(groupId, []);
    }
    const groupQueue = this.buffers.get(groupId);
    groupQueue.push({ text: logLine, date: dateStr });

    // 2. Micro WAL append (resilience against crash)
    try {
      const walEntry =
        JSON.stringify({ groupId, date: dateStr, line: logLine }) + '\n';
      fs.appendFileSync(WAL_FILE, walEntry, 'utf8');
    } catch (err) {
      logger.debug(
        '[CHAT_BUFFER]',
        `Failed to append to WAL file: ${err.message}`
      );
    }

    // Check size trigger
    if (groupQueue.length >= MAX_BUFFER_COUNT) {
      this.flushGroup(groupId).catch((err) => {
        logger.error(
          '[CHAT_BUFFER]',
          `Immediate flush error for ${groupId}: ${err.message}`
        );
      });
    }
  }

  /**
   * Flush all group buffers to SQLite
   */
  async flush() {
    if (this.isFlushing) return;
    this.isFlushing = true;

    try {
      const groupIds = Array.from(this.buffers.keys());
      for (const groupId of groupIds) {
        await this.flushGroup(groupId);
      }

      // Truncate WAL file after successful flush
      try {
        if (fs.existsSync(WAL_FILE)) {
          fs.writeFileSync(WAL_FILE, '', 'utf8');
        }
      } catch {}

      // Auto-purge logs older than 7 days
      await this.cleanupOldLogs();
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Flush specific group buffer to SQLite
   * @param {string} groupId
   */
  async flushGroup(groupId) {
    const queue = this.buffers.get(groupId);
    if (!queue || queue.length === 0) return;

    // Group messages by date
    const byDate = new Map();
    for (const item of queue) {
      if (!byDate.has(item.date)) {
        byDate.set(item.date, []);
      }
      byDate.get(item.date).push(item.text);
    }

    // Clear memory buffer for this group
    this.buffers.delete(groupId);

    for (const [date, lines] of byDate.entries()) {
      if (lines.length === 0) continue;
      const combinedText = lines.join('\n');
      const count = lines.length;

      try {
        const existing = await db('group_daily_chats')
          .where({ group_id: groupId, date })
          .first();

        if (existing) {
          await db('group_daily_chats')
            .where({ id: existing.id })
            .update({
              messages: db.raw("messages || '\\n' || ?", [combinedText]),
              message_count: db.raw('COALESCE(message_count, 0) + ?', [count]),
              updated_at: db.fn.now(),
            });
        } else {
          await db('group_daily_chats').insert({
            group_id: groupId,
            date,
            messages: combinedText,
            message_count: count,
            updated_at: db.fn.now(),
          });
        }
      } catch (err) {
        logger.error(
          '[CHAT_BUFFER]',
          `Failed to persist chat logs for ${groupId} (${date}): ${err.message}`
        );
      }
    }
  }

  /**
   * Synchronous flush for graceful process shutdown
   */
  flushSync() {
    try {
      const groupIds = Array.from(this.buffers.keys());
      if (groupIds.length === 0) return;

      logger.info(
        '[CHAT_BUFFER]',
        `Gracefully flushing ${groupIds.length} chat group buffer(s)...`
      );

      for (const groupId of groupIds) {
        const queue = this.buffers.get(groupId);
        if (!queue || queue.length === 0) continue;

        const byDate = new Map();
        for (const item of queue) {
          if (!byDate.has(item.date)) {
            byDate.set(item.date, []);
          }
          byDate.get(item.date).push(item.text);
        }
        this.buffers.delete(groupId);

        for (const [date, lines] of byDate.entries()) {
          const combinedText = lines.join('\n');
          const count = lines.length;

          // Attempt raw insert or append via Knex client connection
          const existing = db('group_daily_chats')
            .where({ group_id: groupId, date })
            .first();

          // Wait or promise-based sync
          existing
            .then(async (row) => {
              if (row) {
                await db('group_daily_chats')
                  .where({ id: row.id })
                  .update({
                    messages: db.raw("messages || '\\n' || ?", [combinedText]),
                    message_count: db.raw('COALESCE(message_count, 0) + ?', [
                      count,
                    ]),
                    updated_at: db.fn.now(),
                  });
              } else {
                await db('group_daily_chats').insert({
                  group_id: groupId,
                  date,
                  messages: combinedText,
                  message_count: count,
                  updated_at: db.fn.now(),
                });
              }
            })
            .catch(() => {});
        }
      }

      if (fs.existsSync(WAL_FILE)) {
        fs.writeFileSync(WAL_FILE, '', 'utf8');
      }
    } catch (err) {
      logger.error('[CHAT_BUFFER]', `Sync flush exception: ${err.message}`);
    }
  }

  /**
   * Recover WAL file contents if bot previously crashed
   */
  recover() {
    try {
      if (!fs.existsSync(WAL_FILE)) return;
      const content = fs.readFileSync(WAL_FILE, 'utf8').trim();
      if (!content) return;

      const lines = content.split('\n').filter(Boolean);
      if (lines.length === 0) return;

      logger.info(
        '[CHAT_BUFFER]',
        `Recovering ${lines.length} unpersisted message(s) from WAL...`
      );

      for (const line of lines) {
        try {
          const { groupId, date, line: textLine } = JSON.parse(line);
          if (groupId && textLine) {
            if (!this.buffers.has(groupId)) {
              this.buffers.set(groupId, []);
            }
            this.buffers.get(groupId).push({ text: textLine, date });
          }
        } catch {}
      }

      // Flush recovered data to DB
      this.flush().catch((err) => {
        logger.error(
          '[CHAT_BUFFER]',
          `Failed to flush recovered data: ${err.message}`
        );
      });
    } catch (err) {
      logger.error('[CHAT_BUFFER]', `Recovery failed: ${err.message}`);
    }
  }

  /**
   * Delete logs older than 7 days
   */
  async cleanupOldLogs() {
    try {
      const cutoffDate = DateTime.utc()
        .minus({ days: 7 })
        .toFormat('yyyy-MM-dd');
      const deleted = await db('group_daily_chats')
        .where('date', '<', cutoffDate)
        .delete();
      if (deleted > 0) {
        logger.info(
          '[CHAT_BUFFER]',
          `Cleaned up ${deleted} expired daily chat records`
        );
      }
    } catch {}
  }

  /**
   * Hook graceful shutdown
   */
  registerShutdownHooks() {
    if (this.shutdownRegistered) return;
    this.shutdownRegistered = true;

    const onExit = () => {
      this.flushSync();
    };

    process.once('SIGINT', onExit);
    process.once('SIGTERM', onExit);
    process.once('beforeExit', onExit);
  }
}

export const chatBuffer = new ChatBufferService();
export default chatBuffer;
