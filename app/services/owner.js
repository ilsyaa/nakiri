import fs from 'fs';
import Database from 'better-sqlite3';
import db from '@nakiri/core/services/database';
import env from '@nakiri/core/services/env';
import { dirStorage } from '@nakiri/core/utils/path';
import {
  clearBotSettingsCache,
  getGroupMetadata,
} from '#app/services/bot/index.js';
import {
  parsePhoneJid,
  toUserJid,
  splitJid,
  isUserJid,
  isLidJid,
} from 'zapo-js';

/**
 * Validate whether an input string is a valid E.164 phone number.
 * Must be 7-15 digits, numeric only, and cannot start with '0'.
 *
 * @param {string | null | undefined} input
 * @returns {boolean}
 */
export function isValidPn(input) {
  if (!input || typeof input !== 'string') return false;
  return /^[1-9]\d{6,14}$/.test(input.trim());
}

/**
 * Validate whether an input string is a valid WhatsApp LID.
 * WhatsApp LIDs are 14-18 digits numeric identifiers.
 *
 * @param {string | null | undefined} input
 * @returns {boolean}
 */
export function isValidLid(input) {
  if (!input || typeof input !== 'string') return false;
  return /^\d{14,18}$/.test(input.trim());
}

/**
 * Extract clean user identity digits using Zapo's built-in JID and phone helpers.
 *
 * @param {string | null | undefined} input
 * @returns {string | null} Clean numeric digits or null if invalid
 */
export function cleanDigits(input) {
  if (!input || typeof input !== 'string') return null;

  try {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // If input already contains '@', use Zapo's toUserJid and splitJid
    if (trimmed.includes('@')) {
      const canonical = toUserJid(trimmed);
      const { user } = splitJid(canonical);
      return user && /^\d+$/.test(user) ? user : null;
    }

    // Parse phone numbers via Zapo's parsePhoneJid (handles '+', '-', spaces, etc.)
    const phoneJid = parsePhoneJid(trimmed);
    const { user } = splitJid(phoneJid);
    if (!user || user.startsWith('0') || user.length < 7 || user.length > 18) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

/**
 * Look up contact details in Zapo's store (SQLite or MySQL) and client store.
 * Finds bidirectional mapping between LID and Phone Number (PN).
 *
 * @param {string | null | undefined} target
 * @param {any} [client]
 * @returns {Promise<{ pn: string | null, lid: string | null, pushName?: string | null, displayName?: string | null } | null>}
 */
export async function lookupContactInStore(target, client = null) {
  const digits = cleanDigits(target);
  if (!digits) return null;

  // 1. Try active client store if available
  if (client?.stores?.contacts) {
    try {
      // Check as LID
      const byLid = await client.stores.contacts.getByJid(`${digits}@lid`);
      if (byLid?.phoneNumber) {
        return {
          pn: cleanDigits(byLid.phoneNumber),
          lid: cleanDigits(byLid.jid || byLid.lid) || digits,
          pushName: byLid.pushName || null,
          displayName: byLid.displayName || null,
        };
      }
    } catch {}

    try {
      // Check as Phone Number
      const byPn = await client.stores.contacts.getByPhoneNumber(
        `${digits}@s.whatsapp.net`
      );
      if (byPn?.jid || byPn?.lid) {
        return {
          pn: cleanDigits(byPn.phoneNumber) || digits,
          lid: cleanDigits(byPn.lid || byPn.jid),
          pushName: byPn.pushName || null,
          displayName: byPn.displayName || null,
        };
      }
    } catch {}
  }

  // 2. MySQL store query
  if (env.DB_CONNECTION === 'mysql') {
    try {
      const row = await db('zapo_mailbox_contacts')
        .where(function () {
          this.where('jid', 'like', `%${digits}%`)
            .orWhere('lid', 'like', `%${digits}%`)
            .orWhere('phone_number', 'like', `%${digits}%`);
        })
        .orderByRaw(
          "CASE WHEN phone_number IS NOT NULL AND (lid IS NOT NULL OR jid LIKE '%@lid') THEN 1 ELSE 2 END"
        )
        .orderBy('last_updated_ms', 'desc')
        .first();

      if (row) {
        return {
          pn: cleanDigits(row.phone_number),
          lid: cleanDigits(row.lid || row.jid),
          pushName: row.push_name || null,
          displayName: row.display_name || null,
        };
      }
    } catch {}
    return null;
  }

  // 3. SQLite store query
  const dbPath = dirStorage('zapo_auth.sqlite');
  if (!fs.existsSync(dbPath)) return null;

  let authDb;
  try {
    authDb = new Database(dbPath, { readonly: true });
    const row = authDb
      .prepare(
        `
        SELECT * FROM mailbox_contacts
        WHERE (
          jid = ? OR jid = ? OR
          lid = ? OR lid = ? OR
          phone_number = ? OR phone_number = ?
        )
        ORDER BY 
          CASE WHEN phone_number IS NOT NULL AND (lid IS NOT NULL OR jid LIKE '%@lid') THEN 1 ELSE 2 END,
          last_updated_ms DESC
        LIMIT 1
      `
      )
      .get(
        digits,
        `${digits}@lid`,
        digits,
        `${digits}@lid`,
        digits,
        `${digits}@s.whatsapp.net`
      );

    if (row) {
      return {
        pn: cleanDigits(row.phone_number),
        lid: cleanDigits(row.lid || row.jid),
        pushName: row.push_name || null,
        displayName: row.display_name || null,
      };
    }
  } catch {
    return null;
  } finally {
    if (authDb) {
      try {
        authDb.close();
      } catch {}
    }
  }

  return null;
}

/**
 * Get phone number (PN) from LID across contact stores, group_members, and group metadata.
 * Never returns LID digits as PN.
 *
 * @param {any} client
 * @param {string | null} [chatJid]
 * @param {string} lid
 * @returns {Promise<string | null>}
 */
export async function getPnFromLid(client, chatJid, lid) {
  const digits = cleanDigits(lid);
  if (!digits) return null;

  // 1. Query contact store (client store + mailbox_contacts)
  const contact = await lookupContactInStore(digits, client);
  if (contact?.pn && contact.pn !== digits) {
    return contact.pn;
  }

  // 2. Check Knex group_members
  try {
    const member = await db('group_members')
      .where(function () {
        this.where('user_lid', 'like', `%${digits}%`).orWhere(
          'user_lid',
          `${digits}@lid`
        );
      })
      .whereNotNull('user_pn')
      .first();
    if (member?.user_pn) {
      const pn = cleanDigits(member.user_pn);
      if (pn && pn !== digits) return pn;
    }
  } catch {}

  // 3. Check live group metadata in current chatJid
  if (client && chatJid && chatJid.endsWith('@g.us')) {
    try {
      const metadata = await getGroupMetadata(client, chatJid);
      const participants = metadata?.participants || [];
      for (const p of participants) {
        const pLid = cleanDigits(p.lid);
        if (pLid === digits && (p.phoneNumber || p.jid)) {
          const pn = cleanDigits(p.phoneNumber || p.jid);
          if (pn && pn !== digits) return pn;
        }
      }
    } catch {}
  }

  // 4. Fallback across other known groups in db('groups')
  if (client) {
    try {
      const groups = await db('groups').select('id').limit(10);
      for (const g of groups) {
        if (g.id === chatJid) continue;
        const metadata = await getGroupMetadata(client, g.id);
        const participants = metadata?.participants || [];
        for (const p of participants) {
          const pLid = cleanDigits(p.lid);
          if (pLid === digits && (p.phoneNumber || p.jid)) {
            const pn = cleanDigits(p.phoneNumber || p.jid);
            if (pn && pn !== digits) return pn;
          }
        }
      }
    } catch {}
  }

  return null;
}

/**
 * Get LID from phone number (PN) using Zapo profile API, local DB, and group metadata.
 *
 * @param {any} client
 * @param {string | null} [chatJid]
 * @param {string} pn
 * @returns {Promise<string | null>}
 */
export async function getLidFromPn(client, chatJid, pn) {
  const digits = cleanDigits(pn);
  if (!digits) return null;

  // 1. Check official Zapo profile API (queries WhatsApp MEX / USYNC server)
  if (client?.profile?.getLidsByPhoneNumbers) {
    try {
      const results = await client.profile.getLidsByPhoneNumbers([digits]);
      const match = results?.[0];
      if (match?.lidJid) {
        const found = cleanDigits(match.lidJid);
        if (found && found !== digits) return found;
      }
    } catch {}
  }

  // 2. Query contact store (client store + mailbox_contacts)
  const contact = await lookupContactInStore(digits, client);
  if (contact?.lid && contact.lid !== digits) {
    return contact.lid;
  }

  // 3. Check Knex group_members
  try {
    const member = await db('group_members')
      .where(function () {
        this.where('user_pn', 'like', `%${digits}%`).orWhere(
          'user_pn',
          `${digits}@s.whatsapp.net`
        );
      })
      .whereNotNull('user_lid')
      .first();
    if (member?.user_lid) {
      const lid = cleanDigits(member.user_lid);
      if (lid && lid !== digits) return lid;
    }
  } catch {}

  // 4. Check live group metadata in current chatJid
  if (client && chatJid && chatJid.endsWith('@g.us')) {
    try {
      const metadata = await getGroupMetadata(client, chatJid);
      const participants = metadata?.participants || [];
      for (const p of participants) {
        const pPn = cleanDigits(p.phoneNumber || p.jid);
        if (pPn === digits && p.lid) {
          const lid = cleanDigits(p.lid);
          if (lid && lid !== digits) return lid;
        }
      }
    } catch {}
  }

  // 5. Fallback across other known groups in db('groups')
  if (client) {
    try {
      const groups = await db('groups').select('id').limit(10);
      for (const g of groups) {
        if (g.id === chatJid) continue;
        const metadata = await getGroupMetadata(client, g.id);
        const participants = metadata?.participants || [];
        for (const p of participants) {
          const pPn = cleanDigits(p.phoneNumber || p.jid);
          if (pPn === digits && p.lid) {
            const lid = cleanDigits(p.lid);
            if (lid && lid !== digits) return lid;
          }
        }
      }
    } catch {}
  }

  return null;
}

/**
 * Resolve paired PN and LID identities across sender objects, database, and auth store.
 *
 * @param {object} params
 * @param {string | null} [params.targetDigits]
 * @param {string | null} [params.targetJid]
 * @param {any} [params.senderRef]
 * @param {any} [params.client]
 * @param {string | null} [params.chatJid]
 * @returns {Promise<{ pn: string | null, lid: string | null }>}
 */
export async function resolveDualIdentities({
  targetDigits,
  targetJid,
  senderRef,
  client,
  chatJid,
}) {
  let pn = null;
  let lid = null;

  // 1. Direct resolution from senderRef (e.g. quoted message or msg.sender)
  if (senderRef) {
    if (senderRef.pn) pn = cleanDigits(senderRef.pn);
    if (senderRef.lid) lid = cleanDigits(senderRef.lid);
    if (!pn && !lid && senderRef.id) {
      const canonical = toUserJid(senderRef.id);
      if (isUserJid(canonical)) {
        pn = cleanDigits(canonical);
      } else if (isLidJid(canonical)) {
        lid = cleanDigits(canonical);
      }
    }
  }

  // 2. Direct resolution from targetJid
  if (targetJid) {
    try {
      const canonical = toUserJid(targetJid);
      if (isLidJid(canonical)) {
        if (!lid) lid = cleanDigits(canonical);
      } else if (isUserJid(canonical)) {
        if (!pn) pn = cleanDigits(canonical);
      }
    } catch {}
  }

  // 3. If targetDigits is provided and identities are still missing
  const cleanInput = targetDigits ? cleanDigits(targetDigits) : null;
  if (cleanInput && (!pn || !lid)) {
    // If targetDigits was given with no explicit domain from targetJid or senderRef:
    if (!pn && !lid) {
      // First, try contact store lookup to see if the digits are known as either LID or PN
      const contact = await lookupContactInStore(cleanInput, client);
      if (contact) {
        if (contact.lid === cleanInput) {
          lid = cleanInput;
          pn = contact.pn || null;
        } else if (contact.pn === cleanInput) {
          pn = cleanInput;
          lid = contact.lid || null;
        } else {
          pn = contact.pn;
          lid = contact.lid;
        }
      }

      if (!pn && !lid) {
        if (cleanInput.length <= 13) {
          // Almost certainly a phone number (E.164)
          pn = cleanInput;
          lid = await getLidFromPn(client, chatJid, cleanInput);
        } else if (cleanInput.length >= 16) {
          // Exceeds E.164 max length; must be an LID
          lid = cleanInput;
          pn = await getPnFromLid(client, chatJid, cleanInput);
        } else {
          // 14 or 15 digits: could be LID or phone number
          const foundPn = await getPnFromLid(client, chatJid, cleanInput);
          if (foundPn) {
            lid = cleanInput;
            pn = foundPn;
          } else {
            const foundLid = await getLidFromPn(client, chatJid, cleanInput);
            if (foundLid) {
              pn = cleanInput;
              lid = foundLid;
            } else if (cleanInput.length >= 15) {
              // WhatsApp LIDs are 15 digits. Never treat raw 15-digit unidentified numbers as PN.
              lid = cleanInput;
              pn = null;
            } else {
              pn = cleanInput;
              lid = null;
            }
          }
        }
      }
    }
  }

  // 4. Complete cross lookup if one was found but not the other
  if (pn && !lid) {
    lid = await getLidFromPn(client, chatJid, pn);
  } else if (lid && !pn) {
    pn = await getPnFromLid(client, chatJid, lid);
  }

  // 5. Strict validation: discard any invalid PN or LID format
  if (pn && !isValidPn(pn)) pn = null;
  if (lid && !isValidLid(lid)) lid = null;

  // 6. Safety guard: PN and LID can NEVER be identical
  if (pn && lid && pn === lid) {
    if (pn.length >= 14) {
      pn = null; // An LID identifier was mistakenly passed as PN
    } else {
      lid = null; // A phone number was mistakenly passed as LID
    }
  }

  return { pn, lid };
}

/**
 * Fetch bot configuration and owner list from the database.
 *
 * @returns {Promise<{ row: any, owners: string[] }>}
 */
export async function getOwnersFromDb() {
  const row = await db('bots').first();
  if (!row || !row.owners) return { row, owners: [] };

  let parsed = row.owners;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      parsed = [];
    }
  }

  const rawList = Array.isArray(parsed) ? parsed : [];
  const cleanList = rawList
    .map((o) => cleanDigits(String(o)))
    .filter((digits) => digits && (isValidPn(digits) || isValidLid(digits)));

  return { row, owners: [...new Set(cleanList)] };
}

/**
 * Group raw owners by owner entity (pairing corresponding PN and LID)
 *
 * @param {string[]} owners
 * @param {any} [client]
 * @param {string | null} [chatJid]
 * @returns {Promise<Array<{ pn: string | null, lid: string | null, all: string[] }>>}
 */
export async function groupOwners(owners, client = null, chatJid = null) {
  const groups = [];
  const handled = new Set();
  const allResolvedOwners = new Set(owners);

  for (const item of owners) {
    if (handled.has(item)) continue;
    const { pn, lid } = await resolveDualIdentities({
      targetDigits: item,
      client,
      chatJid,
    });

    // Only assign identities that pass strict validation
    const groupPn =
      pn && isValidPn(pn)
        ? pn
        : item.length <= 13 && isValidPn(item)
        ? item
        : null;
    const groupLid =
      lid && isValidLid(lid)
        ? lid
        : item.length >= 14 && isValidLid(item)
        ? item
        : null;

    const group = {
      pn: groupPn,
      lid: groupLid,
      all: [item],
    };

    handled.add(item);
    if (groupPn) {
      if (!group.all.includes(groupPn)) group.all.push(groupPn);
      handled.add(groupPn);
      allResolvedOwners.add(groupPn);
    }
    if (groupLid && groupLid !== groupPn) {
      if (!group.all.includes(groupLid)) group.all.push(groupLid);
      handled.add(groupLid);
      allResolvedOwners.add(groupLid);
    }

    groups.push(group);
  }

  // Auto-sync discovered pairings to DB only with strictly validated identities
  if (allResolvedOwners.size > owners.length) {
    try {
      const validCleanOwners = [...allResolvedOwners].filter(
        (id) => isValidPn(id) || isValidLid(id)
      );
      const row = await db('bots').first();
      await saveOwnersToDb(row, validCleanOwners);
    } catch {}
  }

  return groups;
}

/**
 * Persist updated owner list to the database as raw numbers and invalidate cache.
 *
 * @param {any} row
 * @param {string[]} owners
 */
export async function saveOwnersToDb(row, owners) {
  const jsonOwners = JSON.stringify(owners);
  if (!row) {
    await db('bots').insert({
      id: 1,
      owners: jsonOwners,
      prefixes: JSON.stringify(['!', '.', '#']),
      self: false,
    });
  } else {
    await db('bots')
      .where({ id: row.id || 1 })
      .update({ owners: jsonOwners });
  }

  clearBotSettingsCache();
}

/**
 * High-level service method to add a new owner.
 * Strictly validates targets: if PN or LID does not exist, only inserts what actually exists ("yang ada aja").
 *
 * @param {object} params
 * @param {string | null} [params.targetDigits]
 * @param {string | null} [params.targetJid]
 * @param {any} [params.senderRef]
 * @param {any} [params.client]
 * @param {string | null} [params.chatJid]
 * @returns {Promise<{ success: boolean, reason?: string, pn?: string | null, lid?: string | null, displayId?: string }>}
 */
export async function addOwner({
  targetDigits,
  targetJid,
  senderRef,
  client,
  chatJid,
}) {
  const { pn, lid } = await resolveDualIdentities({
    targetDigits,
    targetJid,
    senderRef,
    client,
    chatJid,
  });

  // Strict validation: ONLY insert identities that genuinely exist and are valid.
  // Never insert guessed, fabricated, or non-existent identities.
  const toAdd = [];
  if (pn && isValidPn(pn)) {
    toAdd.push(pn);
  }
  if (lid && isValidLid(lid) && lid !== pn) {
    toAdd.push(lid);
  }

  if (toAdd.length === 0) {
    return { success: false, reason: 'INVALID_TARGET' };
  }

  const { row, owners } = await getOwnersFromDb();
  const alreadyOwner = toAdd.some((id) => owners.includes(id));
  const displayId = pn || lid || toAdd[0];

  if (alreadyOwner) {
    return { success: false, reason: 'ALREADY_OWNER', pn, lid, displayId };
  }

  const newOwners = [...new Set([...owners, ...toAdd])];
  await saveOwnersToDb(row, newOwners);

  return { success: true, pn, lid, displayId };
}

/**
 * High-level service method to remove an owner by index, target digits, or sender reference.
 *
 * @param {object} params
 * @param {string | null} [params.rawInput]
 * @param {string | null} [params.targetJid]
 * @param {any} [params.senderRef]
 * @param {any} [params.client]
 * @param {string | null} [params.chatJid]
 * @returns {Promise<{ success: boolean, reason?: string, targetDisplay?: string, pn?: string | null, lid?: string | null }>}
 */
export async function removeOwner({
  rawInput,
  targetJid,
  senderRef,
  client,
  chatJid,
}) {
  const { row, owners } = await getOwnersFromDb();
  if (owners.length === 0) {
    return { success: false, reason: 'EMPTY' };
  }

  const groups = await groupOwners(owners, client, chatJid);
  const toRemove = new Set();
  let targetDisplay = null;
  let pn = null;
  let lid = null;

  // Case A: Delete by numeric index (e.g. .owner -del 1)
  if (rawInput && /^[0-9]{1,3}$/.test(rawInput)) {
    const idx = parseInt(rawInput, 10);
    if (idx >= 1 && idx <= groups.length) {
      const targetGroup = groups[idx - 1];
      targetGroup.all.forEach((id) => toRemove.add(id));
      pn = targetGroup.pn;
      lid = targetGroup.lid;
      targetDisplay = targetGroup.pn || targetGroup.lid || targetGroup.all[0];
    }
  }

  // Case B: Delete by target (PN, LID, mention, or quoted message)
  if (toRemove.size === 0) {
    const inputDigits = rawInput ? cleanDigits(rawInput) : null;
    if (!inputDigits && !targetJid && !senderRef) {
      return { success: false, reason: 'NO_TARGET' };
    }

    const resolved = await resolveDualIdentities({
      targetDigits: inputDigits,
      targetJid,
      senderRef,
      client,
      chatJid,
    });

    pn = resolved.pn;
    lid = resolved.lid;

    const candidates = [inputDigits, pn, lid].filter(Boolean);
    for (const cand of candidates) {
      if (owners.includes(cand)) {
        toRemove.add(cand);
      }
    }

    if (pn && owners.includes(pn)) toRemove.add(pn);
    if (lid && owners.includes(lid)) toRemove.add(lid);

    targetDisplay = pn || inputDigits || lid || [...toRemove][0];
  }

  if (toRemove.size === 0) {
    return { success: false, reason: 'NOT_FOUND' };
  }

  const newOwners = owners.filter((id) => !toRemove.has(id));
  await saveOwnersToDb(row, newOwners);

  return { success: true, targetDisplay, pn, lid };
}

export default {
  isValidPn,
  isValidLid,
  cleanDigits,
  lookupContactInStore,
  getLidFromPn,
  getPnFromLid,
  resolveDualIdentities,
  getOwnersFromDb,
  groupOwners,
  saveOwnersToDb,
  addOwner,
  removeOwner,
};
