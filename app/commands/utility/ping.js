import os from 'os';
import { defineCommand } from '#app/services/bot/index.js';
import { formatFileSize } from '@nakiri/core/utils/common';

/**
 * Format duration in seconds to human readable string (e.g. 1d 2h 30m 15s)
 * @param {number} seconds
 * @returns {string}
 */
function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

export default defineCommand({
  name: 'ping',
  aliases: ['speed'],
  category: 'utility',
  description: 'Check bot responsiveness and server specifications',
  prefix: 'optional',

  async execute(payload, ctx) {
    const msg = ctx.msg;
    if (!msg) return;

    const start = performance.now();

    // Calculate latency from WhatsApp message timestamp
    const msgTimestamp = Number(payload.timestampSeconds || 0);
    const networkLatency =
      msgTimestamp > 0 ? Math.max(0, Date.now() - msgTimestamp * 1000) : null;

    // Server specs
    const cpus = os.cpus() || [];
    const cpuModel = cpus[0]?.model?.trim() || 'Unknown CPU';
    const cpuCores = cpus.length;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercentage = Math.round((usedMem / totalMem) * 100);
    const procMem = process.memoryUsage().rss;

    const botUptime = formatUptime(process.uptime());
    const osUptime = formatUptime(os.uptime());
    const osPlatform = `${os.type()} (${os.arch()})`;
    const nodeVersion = process.version;

    const processLatency = Math.max(1, Math.round(performance.now() - start));
    const latencyText =
      networkLatency !== null ? `${networkLatency} ms` : `${processLatency} ms`;

    const lines = [
      `• *Speed:* \`${latencyText}\``,
      `• *Uptime:* \`${botUptime}\``,
      '',
      `｢ *SERVER INFO* ｣`,
      `• *CPU:* ${cpuModel} (${cpuCores} cores)`,
      `• *RAM System:* ${formatFileSize(usedMem)} / ${formatFileSize(totalMem)} (${memPercentage}%)`,
      `• *RAM Bot:* ${formatFileSize(procMem)}`,
      `• *OS:* ${osPlatform}`,
      `• *OS Uptime:* ${osUptime}`,
      `• *Node.js:* ${nodeVersion}`,
    ];

    await msg.reply(lines.join('\n'));
  },
});
