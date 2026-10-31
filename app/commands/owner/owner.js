import { defineCommand } from '#app/services/bot/index.js';
import db from '@nakiri/core/services/database';
import { isLidJid, toUserJid } from 'zapo-js';

const cleanDigits = (/** @type {string} */ val) =>
  val ? String(val).replace(/[^0-9]/g, '') : '';

const safeIsLid = (val) => typeof val === 'string' && isLidJid(val);

const getContactStore = (
  /** @type {import("zapo-js").WaClient<{}>} */ client
) => /** @type {any} */ (client)?.['stores']?.contacts;

/**
 * Resolve target identities (PN & LID) from quote, mention, or manual input.
 * @param {import("zapo-js").WaClient<{}>} client
 * @param {import("#app/services/bot/index.js").ParsedMessage} msg
 * @param {string} input
 */
async function resolveIdentities(client, msg, input) {
  let pn = null;
  let lid = null;

  // 1. From Quoted message
  if (msg.quoted?.sender) {
    pn = cleanDigits(msg.quoted.sender.pn);
    lid = cleanDigits(msg.quoted.sender.lid);
    if (!pn && !lid && msg.quoted.sender.id) {
      if (safeIsLid(msg.quoted.sender.id))
        lid = cleanDigits(msg.quoted.sender.id);
      else pn = cleanDigits(msg.quoted.sender.id);
    }
  }

  // 2. From Mention
  const mention = msg.body?.mentionedJid?.[0];
  if (!pn && !lid && mention) {
    if (safeIsLid(mention)) lid = cleanDigits(mention);
    else pn = cleanDigits(toUserJid(mention));
  }

  // 3. From Manual input
  if (!pn && !lid && input) {
    const raw = cleanDigits(input);
    if (safeIsLid(input)) lid = raw;
    else pn = raw;
  }

  // Query Zapo contact store or server for missing LID
  if (pn && !lid) {
    const contact = await getContactStore(client)
      ?.getByPhoneNumber?.(`${pn}@s.whatsapp.net`)
      .catch(() => null);

    const foundLid =
      contact?.lid || (safeIsLid(contact?.jid) ? contact.jid : null);

    if (foundLid) {
      lid = cleanDigits(foundLid);
    } else {
      const res = await client?.profile
        ?.getLidsByPhoneNumbers?.([pn])
        .catch(() => null);
      if (res?.[0]?.lidJid) {
        lid = cleanDigits(res[0].lidJid);
      }
    }
  }

  // Query Zapo contact store for missing PN
  if (lid && !pn) {
    const contact = await getContactStore(client)
      ?.getByJid?.(`${lid}@lid`)
      .catch(() => null);

    const foundPn =
      contact?.phoneNumber ||
      (contact?.jid && !safeIsLid(contact.jid) ? contact.jid : null);

    if (foundPn) {
      pn = cleanDigits(foundPn);
    }
  }

  return [pn, lid].filter(Boolean);
}

export default defineCommand({
  name: 'owner',
  aliases: ['owner'],
  category: 'owner',
  description: 'Manage bot owners (set, del, list)',
  middlewares: ['sender:isOwner'],

  async execute(payload, ctx) {
    const { client, msg, tableBot } = ctx;
    if (!msg) return;

    const [subcommand, ...rest] = msg.body?.args || [];
    const targetInput = rest.join(' ').trim();
    const prefix = msg.body?.prefix || '.';
    const owners = Array.isArray(tableBot?.owners)
      ? tableBot.owners.map(cleanDigits)
      : [];

    // 1. LIST
    if (subcommand === 'list') {
      if (owners.length === 0) return msg.reply('Belum ada owner terdaftar.');
      const list = owners
        .map(
          (/** @type {any} */ o, /** @type {number} */ i) =>
            `${i + 1}. \`${o}\``
        )
        .join('\n');
      return msg.reply(
        `👑 *DAFTAR BOT OWNER*\nTotal: *${owners.length}*\n\n${list}`
      );
    }

    // 2. SET / ADD
    if (subcommand === 'set' || subcommand === 'add') {
      const targets = await resolveIdentities(client, msg, targetInput);
      if (targets.length === 0) {
        return msg.reply(
          `Gunakan: reply chat, tag, atau \`${prefix}owner set <nomor/lid>\``
        );
      }

      const toAdd = targets.filter((t) => !owners.includes(t));
      if (toAdd.length === 0)
        return msg.reply('Target sudah terdaftar sebagai owner.');

      const newOwners = [...owners, ...toAdd];
      await db('bots').update({ owners: JSON.stringify(newOwners) });
      tableBot?.clearCache?.();

      const details = toAdd.map((t) => `• \`${t}\``).join('\n');
      return msg.reply(
        `✅ *Owner berhasil ditambahkan:*\n${details}\n\nTotal: *${newOwners.length}* owner.`
      );
    }

    // 3. DEL / REMOVE
    if (
      subcommand === 'del' ||
      subcommand === 'delete' ||
      subcommand === 'remove'
    ) {
      if (owners.length <= 1)
        return msg.reply('Gagal: Bot harus memiliki minimal 1 owner.');

      let toDel = [];
      const index = parseInt(targetInput, 10);
      if (
        !msg.quoted &&
        !msg.body?.mentionedJid?.[0] &&
        !isNaN(index) &&
        index >= 1 &&
        index <= owners.length
      ) {
        toDel = [owners[index - 1]];
      } else {
        const targets = await resolveIdentities(client, msg, targetInput);
        toDel = targets.length > 0 ? targets : [cleanDigits(targetInput)];
      }

      const newOwners = owners.filter(
        (/** @type {any} */ o) => !toDel.includes(o)
      );
      if (newOwners.length === owners.length)
        return msg.reply('Target tidak ditemukan di daftar owner.');
      if (newOwners.length === 0)
        return msg.reply('Gagal: Bot harus memiliki minimal 1 owner.');

      await db('bots').update({ owners: JSON.stringify(newOwners) });
      tableBot?.clearCache?.();

      return msg.reply(
        `🗑️ *Owner berhasil dihapus:*\n${toDel.map((t) => `• \`${t}\``).join('\n')}\n\nSisa: *${newOwners.length}* owner.`
      );
    }

    // Help
    return msg.reply(
      `👑 *PANDUAN OWNER*\n\n• \`${prefix}owner list\`\n• \`${prefix}owner set <target>\`\n• \`${prefix}owner del <target/index>\``
    );
  },
});
