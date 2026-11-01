import { defineCommand } from '#app/services/bot/index.js';
import db from '@nakiri/core/services/database';
import logger from '@nakiri/core/utils/logger';
import chatBuffer from '#app/services/chat-buffer.js';
import { summarizeChat } from '#app/services/ai/summarizer.js';
import { DateTime } from 'luxon';

export default defineCommand({
  name: 'summary',
  aliases: ['summary', 'rangkum', 'rekap'],
  category: 'group',
  description: 'AI-powered group chat summary',
  middlewares: ['group', 'sender:admin,superAdmin,isOwner'],

  async execute(payload, ctx) {
    const { msg, tableGroup } = ctx;
    if (!msg || !tableGroup) return;

    const p = msg.body?.prefix || '.';
    const cmd = msg.body?.command || `${p}summary`;
    const args = (msg.body?.args || []).map((a) => a.trim().toLowerCase());
    const subCommand = args[0] || '';

    // Panduan jika tanpa argumen atau argumen tidak valid
    const sendGuide = () => {
      const isEnabled = Boolean(tableGroup.settings?.aiSummary);

      return msg.reply(
        [
          '｢ *panduan summary* ｣',
          `Status aktif: *${isEnabled ? 'Aktif' : 'Nonaktif'}*`,
          '',
          `• \`${cmd} now\` _(rangkum obrolan hari ini)_`,
          `• \`${cmd} 24h\` _(rangkum obrolan 24 jam terakhir)_`,
          `• \`${cmd} on\` _(aktifkan perekaman obrolan)_`,
          `• \`${cmd} off\` _(nonaktifkan & hapus riwayat obrolan)_`,
          `• \`${cmd} status\` _(lihat jumlah pesan tersimpan)_`,
        ].join('\n')
      );
    };

    if (!subCommand) {
      return sendGuide();
    }

    // ==========================================
    // 1. Sub-command: .summary on
    // ==========================================
    if (subCommand === 'on' || subCommand === 'enable') {
      const settings = { ...tableGroup.settings, aiSummary: true };
      await db('groups')
        .where({ id: msg.chat })
        .update({ settings: JSON.stringify(settings) });

      if (tableGroup.clearCache) tableGroup.clearCache();
      tableGroup.settings = settings;

      return msg.reply(
        [
          '｢ *perekaman rangkuman obrolan* ｣',
          '• Status: *Aktif*',
          '• Obrolan grup akan disimpan di buffer harian untuk rangkuman AI.',
        ].join('\n')
      );
    }

    // ==========================================
    // 2. Sub-command: .summary off
    // ==========================================
    if (subCommand === 'off' || subCommand === 'disable') {
      const settings = { ...tableGroup.settings, aiSummary: false };
      await db('groups')
        .where({ id: msg.chat })
        .update({ settings: JSON.stringify(settings) });

      if (tableGroup.clearCache) tableGroup.clearCache();
      tableGroup.settings = settings;

      // Also clean up stored daily chats for this group
      await db('group_daily_chats').where({ group_id: msg.chat }).delete();

      return msg.reply(
        [
          '｢ *perekaman rangkuman obrolan* ｣',
          '• Status: *Nonaktif*',
          '• Seluruh riwayat rekaman obrolan grup ini telah dibersihkan.',
        ].join('\n')
      );
    }

    // ==========================================
    // 3. Sub-command: .summary status
    // ==========================================
    if (subCommand === 'status' || subCommand === 'info') {
      const isEnabled = Boolean(tableGroup.settings?.aiSummary);
      const todayDate = DateTime.utc().toFormat('yyyy-MM-dd');

      const todayLog = await db('group_daily_chats')
        .where({ group_id: msg.chat, date: todayDate })
        .first();

      const memoryQueue = chatBuffer.buffers.get(msg.chat) || [];
      const totalMessagesToday =
        (todayLog?.message_count || 0) + memoryQueue.length;

      return msg.reply(
        [
          '｢ *status rangkuman ai* ｣',
          `• Fitur Perekaman: *${isEnabled ? 'Aktif' : 'Nonaktif'}*`,
          `• Pesan Hari Ini (UTC): *${totalMessagesToday}* pesan tersimpan`,
          `• Format AI Provider: OpenAI-compatible`,
        ].join('\n')
      );
    }

    // ==========================================
    // 4. Generate AI Summary (.summary now / generate / 24h)
    // ==========================================
    if (
      subCommand !== 'now' &&
      subCommand !== 'generate' &&
      subCommand !== 'today' &&
      subCommand !== '24h' &&
      subCommand !== 'yesterday'
    ) {
      return sendGuide();
    }

    const isEnabled = Boolean(tableGroup.settings?.aiSummary);
    if (!isEnabled) {
      return msg.reply(
        [
          '｢ *panduan summary* ｣',
          'Fitur perekaman obrolan belum aktif di grup ini.',
          '',
          `• Aktifkan: \`${cmd} on\``,
          `• Cek status: \`${cmd} status\``,
        ].join('\n')
      );
    }

    // Force flush memory buffer for this group so SQLite has latest messages
    await chatBuffer.flushGroup(msg.chat);

    // Fetch messages for today (and optionally yesterday if specified, e.g. .summary 24h)
    const todayDate = DateTime.utc().toFormat('yyyy-MM-dd');
    let logsToInclude = [todayDate];

    if (subCommand === '24h' || subCommand === 'yesterday') {
      const yesterdayDate = DateTime.utc()
        .minus({ days: 1 })
        .toFormat('yyyy-MM-dd');
      logsToInclude = [yesterdayDate, todayDate];
    }

    const dailyRows = await db('group_daily_chats')
      .where('group_id', msg.chat)
      .whereIn('date', logsToInclude)
      .orderBy('date', 'asc');

    const combinedTranscript = dailyRows
      .map((row) => row.messages)
      .filter(Boolean)
      .join('\n');

    if (!combinedTranscript || combinedTranscript.trim().length === 0) {
      return msg.reply(
        'Belum ada pesan yang tersimpan di buffer hari ini untuk dirangkum.'
      );
    }

    // Check API Key
    if (!process.env.AI_API_KEY) {
      return msg.reply(
        'AI API Key belum dikonfigurasi di file environment (.env).'
      );
    }

    await msg.reply('Sedang merangkum obrolan grup dengan AI...');

    try {
      const summaryResult = await summarizeChat(combinedTranscript);
      await msg.reply(summaryResult);
    } catch (err) {
      logger.error(
        '[SUMMARY_CMD]',
        `Failed to generate AI summary: ${err.message}`
      );
      await msg.reply(`Gagal merangkum obrolan: ${err.message}`);
    }
  },
});
