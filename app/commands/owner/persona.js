import { defineCommand } from '#app/services/bot/index.js';
import db from '@nakiri/core/services/database';
import {
  normalizePersonaDigits,
  normalizePersonaList,
} from '#app/services/ai/persona-mode.js';
import {
  PERSONA_MODE_18,
  PERSONA_MODE_GIRLFRIEND,
} from '#app/services/ai/persona.js';
import { resolveContactIdentities } from '#app/utils/target.js';

const MODE_LABELS = {
  [PERSONA_MODE_GIRLFRIEND]: 'girlfriend',
  [PERSONA_MODE_18]: '18+',
};

/**
 * @param {string} value
 * @returns {'girlfriend' | '18' | null}
 */
function resolveMode(value) {
  const mode = String(value || '')
    .trim()
    .toLowerCase();

  if (['girlfriend', 'gf', 'pacar'].includes(mode)) {
    return PERSONA_MODE_GIRLFRIEND;
  }
  if (['18', '18+', 'adult', 'vulgar'].includes(mode)) {
    return PERSONA_MODE_18;
  }

  return null;
}

/**
 * Collect target digits from a reply, mentions, and manual input.
 * Tries to resolve both PN and LID so the persona matches in any chat type.
 *
 * @param {any} client
 * @param {any} msg
 * @param {string} input
 * @returns {Promise<string[]>}
 */
async function collectTargets(client, msg, input = '') {
  const sources = new Set();

  const add = (value) => {
    const digits = normalizePersonaDigits(value);
    if (digits) sources.add(digits);
  };

  if (msg.quoted?.sender) {
    add(msg.quoted.sender.pn);
    add(msg.quoted.sender.lid);
    add(msg.quoted.sender.id);
  }

  for (const mention of msg.body?.mentionedJid || []) {
    add(mention);
  }

  for (const part of String(input || '')
    .split(/[\s,]+/)
    .filter(Boolean)) {
    add(part);
  }

  const targets = new Set(sources);

  if (client) {
    for (const digits of sources) {
      const fromPn = await resolveContactIdentities(client, { pn: digits });
      const fromLid = await resolveContactIdentities(client, {
        lid: `${digits}@lid`,
      });

      for (const identity of [
        fromPn.pn,
        fromPn.lid,
        fromLid.pn,
        fromLid.lid,
      ]) {
        if (identity) targets.add(identity);
      }
    }
  }

  return [...targets];
}

export default defineCommand({
  name: 'persona',
  aliases: ['persona'],
  category: 'owner',
  middlewares: ['sender:isOwner'],

  async execute(payload, ctx) {
    const { msg, tableBot } = ctx;
    if (!msg) return;

    const cmd = msg.body?.command || 'persona';
    const [subcommandRaw, modeRaw, ...targetParts] = msg.body?.args || [];
    const subcommand = (subcommandRaw || '').toLowerCase();
    const targetInput = targetParts.join(' ').trim();

    const girlfriend = normalizePersonaList(tableBot?.nakiri_girlfriend);
    const adult = normalizePersonaList(tableBot?.nakiri_18);

    const sendGuide = () =>
      msg.reply(
        [
          '｢ *persona mode* ｣',
          `• \`${cmd} set girlfriend <nomor>\``,
          `• \`${cmd} set 18 <nomor>\``,
          `• \`${cmd} del <nomor>\``,
          `• \`${cmd} list\``,
          '',
          '_Target bisa dari reply, mention, atau nomor manual._',
        ].join('\n')
      );

    const save = async (nextGirlfriend, nextAdult) => {
      await db('bots').update({
        nakiri_girlfriend: JSON.stringify(nextGirlfriend),
        nakiri_18: JSON.stringify(nextAdult),
      });
      tableBot?.clearCache?.();
    };

    if (!subcommand) {
      return sendGuide();
    }

    if (subcommand === 'list') {
      const lines = [
        '｢ *persona mode* ｣',
        `• Girlfriend: *${girlfriend.length}* nomor`,
        `• 18+: *${adult.length}* nomor`,
      ];

      if (msg.flags?.isGroup) {
        lines.push('', '_Detail nomor hanya ditampilkan di private chat._');
        return msg.reply(lines.join('\n'));
      }

      if (girlfriend.length > 0) {
        lines.push(
          '',
          '*Girlfriend*',
          ...girlfriend.map((digits) => `• \`${digits}\``)
        );
      }

      if (adult.length > 0) {
        lines.push(
          '',
          '*18+*',
          ...adult.map((digits) => `• \`${digits}\``)
        );
      }

      return msg.reply(lines.join('\n'));
    }

    if (subcommand === 'set' || subcommand === 'add') {
      const mode = resolveMode(modeRaw);
      if (!mode) {
        return sendGuide();
      }

      const targets = await collectTargets(ctx.client, msg, targetInput);
      if (targets.length === 0) {
        return msg.reply(
          'Target tidak ditemukan. Reply pesan, tag member, atau masukkan nomor.'
        );
      }

      const nextGirlfriend = girlfriend.filter(
        (digits) => !targets.includes(digits)
      );
      const nextAdult = adult.filter((digits) => !targets.includes(digits));

      if (mode === PERSONA_MODE_GIRLFRIEND) {
        nextGirlfriend.push(...targets);
      } else {
        nextAdult.push(...targets);
      }

      await save(
        [...new Set(nextGirlfriend)],
        [...new Set(nextAdult)]
      );

      return msg.reply(
        [
          `｢ *persona ${MODE_LABELS[mode]}* ｣`,
          `• ${targets.length} nomor disimpan.`,
        ].join('\n')
      );
    }

    if (
      subcommand === 'del' ||
      subcommand === 'delete' ||
      subcommand === 'remove'
    ) {
      const deleteInput = [modeRaw, ...targetParts]
        .filter(Boolean)
        .join(' ')
        .trim();
      const targets = await collectTargets(ctx.client, msg, deleteInput);
      if (targets.length === 0) {
        return msg.reply(
          'Target tidak ditemukan. Reply pesan, tag member, atau masukkan nomor.'
        );
      }

      const nextGirlfriend = girlfriend.filter(
        (digits) => !targets.includes(digits)
      );
      const nextAdult = adult.filter((digits) => !targets.includes(digits));
      const removed =
        girlfriend.length +
        adult.length -
        nextGirlfriend.length -
        nextAdult.length;

      if (removed === 0) {
        return msg.reply('Nomor tidak terdaftar di persona mode.');
      }

      await save(nextGirlfriend, nextAdult);
      return msg.reply(`Nomor dihapus dari persona mode: *${removed}*.`);
    }

    return sendGuide();
  },
});
