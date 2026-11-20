import { toUserJid, splitJid, isLidJid } from 'zapo-js';

/**
 * Normalize JID, PN, LID or raw string using native zapo functions with raw digit fallback.
 * @param {string | null | undefined} input
 * @returns {{ id: string, server: string | null, isLid: boolean } | null}
 */
export function normalizeIdentity(input) {
  if (!input || typeof input !== 'string') return null;
  const raw = input.trim();

  // 1. WhatsApp JID format (@s.whatsapp.net, @lid, etc.)
  if (raw.includes('@')) {
    const userJid = toUserJid(raw);
    const { user, server } = splitJid(userJid);
    return {
      id: user,
      server,
      isLid: isLidJid(userJid),
    };
  }

  // 2. Raw digits from user manual text input (e.g. +62 812-xxxx)
  const digits = raw.replace(/[^0-9]/g, '');
  if (digits.length >= 5) {
    return {
      id: digits,
      server: null,
      isLid: false,
    };
  }

  return null;
}

/**
 * Resolve target user identities (PN, LID, and candidate IDs) from a WhatsApp message context.
 * Inspects: Quoted message -> Mentions -> Raw manual input -> Fallback to sender (optional).
 *
 * @param {import('#app/services/bot/message.d.ts').ParsedMessage} msg - Parsed message object
 * @param {string} [input] - Optional raw input string (e.g. phone number or LID)
 * @param {object} [options]
 * @param {boolean} [options.allowSelf=true] - Whether to fallback to msg.sender if no target is found
 * @returns {{
 *   pn: string | null,
 *   lid: string | null,
 *   name: string | null,
 *   jids: string[],
 *   raw: string | null
 * }}
 */
export function resolveTarget(msg, input = '', { allowSelf = true } = {}) {
  let pn = null;
  let lid = null;
  let name = null;
  const candidateJids = new Set();

  if (!msg) {
    return { pn: null, lid: null, name: null, jids: [], raw: null };
  }

  // 1. Quoted Message
  if (msg.quoted?.sender) {
    const q = msg.quoted.sender;
    const normalizedPn = normalizeIdentity(q.pn);
    const normalizedLid = normalizeIdentity(q.lid);
    const normalizedId = normalizeIdentity(q.id);

    if (normalizedPn?.id) pn = normalizedPn.id;
    if (normalizedLid?.id) lid = normalizedLid.id;

    if (!pn && !lid && normalizedId?.id) {
      if (normalizedId.isLid) lid = normalizedId.id;
      else pn = normalizedId.id;
    }

    if (q.id) candidateJids.add(q.id);
    if (q.pn) candidateJids.add(q.pn);
    if (q.lid) candidateJids.add(q.lid);
  }

  // 2. Mention / Tagged users
  const mentions = msg.body?.mentionedJid;
  if (!pn && !lid && Array.isArray(mentions) && mentions.length > 0) {
    for (const mention of mentions) {
      candidateJids.add(mention);
      if (!pn && !lid) {
        const norm = normalizeIdentity(mention);
        if (norm?.id) {
          if (norm.isLid) lid = norm.id;
          else pn = norm.id;
        }
      }
    }
  }

  // 3. Raw Input (Manual phone number or LID from args)
  const trimmedInput = typeof input === 'string' ? input.trim() : '';
  if (!pn && !lid && trimmedInput) {
    const norm = normalizeIdentity(trimmedInput);
    if (norm?.id) {
      if (norm.isLid) lid = norm.id;
      else pn = norm.id;
      candidateJids.add(trimmedInput);
    }
  }

  // 4. Fallback to sender
  if (!pn && !lid && allowSelf && msg.sender) {
    const s = msg.sender;
    const normalizedPn = normalizeIdentity(s.pn);
    const normalizedLid = normalizeIdentity(s.lid);
    const normalizedId = normalizeIdentity(s.id);

    if (normalizedPn?.id) pn = normalizedPn.id;
    if (normalizedLid?.id) lid = normalizedLid.id;
    name = s.name || null;

    if (!pn && !lid && normalizedId?.id) {
      if (normalizedId.isLid) lid = normalizedId.id;
      else pn = normalizedId.id;
    }

    if (s.id) candidateJids.add(s.id);
    if (s.pn) candidateJids.add(s.pn);
    if (s.lid) candidateJids.add(s.lid);
  }

  return {
    pn,
    lid,
    name,
    jids: Array.from(candidateJids),
    raw:
      pn ||
      lid ||
      (candidateJids.size > 0 ? Array.from(candidateJids)[0] : null),
  };
}

/**
 * Resolve the PN and LID counterparts for a target when possible.
 *
 * @param {any} client
 * @param {{ pn?: string | null, lid?: string | null }} options
 * @returns {Promise<{ pn: string | null, lid: string | null }>}
 */
export async function resolveContactIdentities(
  client,
  { pn = null, lid = null } = {}
) {
  let resolvedPn = null;
  let resolvedLid = null;

  const normalizedPn = normalizeIdentity(pn);
  if (normalizedPn?.id) {
    if (normalizedPn.isLid) resolvedLid = normalizedPn.id;
    else resolvedPn = normalizedPn.id;
  }

  const normalizedLid = normalizeIdentity(lid);
  if (normalizedLid?.id) {
    if (normalizedLid.isLid) resolvedLid = normalizedLid.id;
    else resolvedPn = normalizedLid.id;
  }

  const contactStore = client?.['stores']?.contacts;

  if (resolvedPn && !resolvedLid) {
    try {
      const contact = await contactStore?.getByPhoneNumber?.(
        `${resolvedPn}@s.whatsapp.net`
      );
      const foundLid =
        contact?.lid ||
        (contact?.jid && isLidJid(contact.jid) ? contact.jid : null);

      if (foundLid) {
        resolvedLid = normalizeIdentity(foundLid)?.id || null;
      } else {
        const response = await client?.profile?.getLidsByPhoneNumbers?.([
          resolvedPn,
        ]);
        const lidJid = response?.[0]?.lidJid;
        if (lidJid) {
          resolvedLid = normalizeIdentity(lidJid)?.id || null;
        }
      }
    } catch {}
  }

  if (resolvedLid && !resolvedPn) {
    try {
      const contact = await contactStore?.getByJid?.(`${resolvedLid}@lid`);
      const foundPn =
        contact?.phoneNumber ||
        (contact?.jid && !isLidJid(contact.jid) ? contact.jid : null);

      if (foundPn) {
        resolvedPn = normalizeIdentity(foundPn)?.id || null;
      }
    } catch {}
  }

  return { pn: resolvedPn, lid: resolvedLid };
}

export default {
  normalizeIdentity,
  resolveTarget,
  resolveContactIdentities,
};
