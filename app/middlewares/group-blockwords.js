import db from '@nakiri/core/services/database';
import logger from '@nakiri/core/utils/logger';
import { matchBlockedPatterns } from '#app/utils/pattern.js';
import { composeWarningMessage } from '#app/services/ai/group.js';

/**
 * Group blocked words & link pattern guard middleware.
 * Intercepts offending messages from non-admin participants, deletes the message (if bot is admin),
 * increments member warning count, and halts pipeline execution.
 *
 * @type {import('@nakiri/core/services/modules').EventMiddleware<'message'>}
 */
export default async function groupBlockwordsMiddleware(payload, ctx) {
  const { client, msg, tableGroup, tableGroupMember } = ctx;

  // Only active in group chats where bot is an admin and has configured blockedWords
  if (!msg?.flags?.isGroup || !tableGroup?.settings) return;

  const isBotAdmin = Boolean(
    msg.permissions?.bot?.admin || msg.permissions?.bot?.superAdmin
  );
  if (!isBotAdmin) return;

  const blockedWords = tableGroup.settings.blockedWords;
  if (!Array.isArray(blockedWords) || blockedWords.length === 0) return;

  // Bypass for bot itself, group admins, and bot owners
  const isSenderAdmin = Boolean(
    msg.permissions?.sender?.admin ||
    msg.permissions?.sender?.superAdmin ||
    msg.permissions?.sender?.isOwner
  );

  if (isSenderAdmin || msg.flags.fromMe) return;

  // Extract all text candidates (text body or media caption)
  const textContent = (msg.body?.rawText || '').trim();
  if (!textContent) return;

  // Test patterns
  const { matched, pattern } = matchBlockedPatterns(textContent, blockedWords);
  if (!matched) return;

  logger.warn(
    '[MODERATION]',
    `Blocked word match in group ${msg.chat} from ${msg.sender?.id}: pattern '${pattern}'`
  );

  // 1. Delete / Revoke offending message via Zapo
  try {
    const rawKey = payload?.key;
    if (
      rawKey &&
      client?.message &&
      typeof client.message.send === 'function'
    ) {
      await client.message.send(msg.chat, {
        type: 'revoke',
        target: {
          remoteJid: rawKey.remoteJid,
          id: rawKey.id,
          fromMe: false,
          participant: rawKey.participant,
        },
      });
    }
  } catch (err) {
    logger.debug('[MODERATION]', `Failed to revoke message: ${err.message}`);
  }

  // 2. Increment member warning in database
  let currentWarnings = 1;
  const maxWarn = tableGroup.settings?.maxWarn || 3;

  if (tableGroupMember?.id) {
    try {
      await db('group_members')
        .where({ id: tableGroupMember.id })
        .update({
          warnings: db.raw('COALESCE(warnings, 0) + 1'),
          last_warned_at: db.fn.now(),
        });

      currentWarnings = (tableGroupMember.warnings || 0) + 1;
      tableGroupMember.warnings = currentWarnings;
    } catch {}
  }

  const targetJid =
    tableGroupMember?.user_pn ||
    tableGroupMember?.user_lid ||
    msg.sender?.pn ||
    msg.sender?.lid ||
    msg.sender?.id;

  const mentionNum = targetJid ? targetJid.split('@')[0] : '';
  const targetTag = mentionNum ? `@${mentionNum}` : null;
  const useAi = Boolean(tableGroup.settings?.warnAi);

  // 3. Check if member reached or exceeded max warnings
  if (currentWarnings >= maxWarn) {
    // Delete record from database
    if (tableGroupMember?.id) {
      try {
        await db('group_members').where({ id: tableGroupMember.id }).delete();
      } catch (err) {
        logger.error(
          '[MODERATION]',
          `Failed to delete kicked member ${tableGroupMember.id} from database: ${err.message}`
        );
      }
    }

    // Kick member from WhatsApp group
    const kickTarget = targetJid || msg.sender?.id;
    let kicked = false;
    try {
      await client.group.removeParticipants(msg.chat, [kickTarget]);
      kicked = true;
      logger.info(
        '[MODERATION]',
        `Kicked member ${kickTarget} in ${msg.chat} for exceeding max warnings (${currentWarnings}/${maxWarn}) via blockwords`
      );
    } catch (err) {
      logger.error(
        '[MODERATION]',
        `Failed to kick member in ${msg.chat}: ${err.message}`
      );
    }

    // Send max warning kick notification
    const fallbackText = [
      '*Pesan dihapus:* Memuat konten terlarang.',
      `• Pengirim: @${mentionNum}`,
      `• Pelanggaran: \`${pattern}\``,
      `• Tindakan: *Dikeluarkan* (mencapai batas ${currentWarnings}/${maxWarn})`,
    ].join('\n');

    try {
      const text = useAi
        ? await composeWarningMessage({
            currentWarn: currentWarnings,
            maxWarn,
            kicked,
            kickFailed: !kicked,
            reason: `konten terlarang (${pattern})`,
            targetTag,
            fallbackText,
          })
        : fallbackText;

      await msg.reply(text, {
        mentions: targetJid ? [targetJid] : undefined,
      });
    } catch {}
  } else {
    // Send standard warning notification
    const fallbackText = [
      '*Pesan dihapus:* Memuat konten terlarang.',
      `• Pengirim: @${mentionNum}`,
      `• Pelanggaran: \`${pattern}\``,
      `• Peringatan: *${currentWarnings}* / ${maxWarn}`,
    ].join('\n');

    try {
      const text = useAi
        ? await composeWarningMessage({
            currentWarn: currentWarnings,
            maxWarn,
            reason: `konten terlarang (${pattern})`,
            targetTag,
            fallbackText,
          })
        : fallbackText;

      await msg.reply(text, {
        mentions: targetJid ? [targetJid] : undefined,
      });
    } catch {}
  }

  // 4. Halt further pipeline processing
  return ctx.stop();
}
