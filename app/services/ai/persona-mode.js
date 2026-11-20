import cache from '@nakiri/core/services/cache';
import { resolveContactIdentities } from '#app/utils/target.js';
import {
  PERSONA_MODE_18,
  PERSONA_MODE_GIRLFRIEND,
} from './persona.js';

const identityCache = cache.namespace('persona_identity');

/**
 * Normalize a phone number, LID, or JID into digits.
 *
 * @param {string | number | null | undefined} value
 * @returns {string | null}
 */
export function normalizePersonaDigits(value) {
  if (value === null || value === undefined) return null;
  const raw = String(value).split('@')[0].split(':')[0];
  const digits = raw.replace(/[^0-9]/g, '');
  return digits || null;
}

/**
 * Normalize a JSON persona list into unique digit strings.
 *
 * @param {any} value
 * @returns {string[]}
 */
export function normalizePersonaList(value) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(value.map(normalizePersonaDigits).filter(Boolean))
  );
}

/**
 * Collect every identity digit for a sender.
 *
 * @param {{ id?: string | null, pn?: string | null, lid?: string | null }} [sender]
 * @returns {Set<string>}
 */
function collectSenderDigits(sender) {
  return new Set(
    [sender?.id, sender?.pn, sender?.lid]
      .map(normalizePersonaDigits)
      .filter(Boolean)
  );
}

/**
 * @param {Set<string>} candidates
 * @param {any} list
 * @returns {boolean}
 */
function listMatches(candidates, list) {
  if (candidates.size === 0) return false;

  return normalizePersonaList(list).some((digits) =>
    candidates.has(digits)
  );
}

/**
 * Resolve all persona modes for a set of identity digits.
 * Both modes can be active at once.
 *
 * @param {string[]} digits
 * @param {Record<string, any> | null | undefined} tableBot
 * @returns {string[]}
 */
export function resolvePersonaModesFromDigits(digits, tableBot) {
  if (!tableBot) return [];

  const candidates = new Set(
    digits.map(normalizePersonaDigits).filter(Boolean)
  );
  if (candidates.size === 0) return [];

  const modes = [];
  if (listMatches(candidates, tableBot.nakiri_girlfriend)) {
    modes.push(PERSONA_MODE_GIRLFRIEND);
  }
  if (listMatches(candidates, tableBot.nakiri_18)) {
    modes.push(PERSONA_MODE_18);
  }

  return modes;
}

/**
 * Resolve all persona modes for a sender.
 * Both modes can be active at once.
 *
 * @param {{ sender?: { id?: string | null, pn?: string | null, lid?: string | null } | null, tableBot?: Record<string, any> | null }} options
 * @returns {string[]}
 */
export function resolvePersonaModes({ sender, tableBot }) {
  return resolvePersonaModesFromDigits(
    [...collectSenderDigits(sender)],
    tableBot
  );
}

/**
 * Expand one identity into its PN and LID counterparts.
 * Cached briefly to avoid contact lookups on every message.
 *
 * @param {any} client
 * @param {string} digits
 * @returns {Promise<string[]>}
 */
async function resolveIdentityCandidates(client, digits) {
  if (!client) return [digits];

  const cached = await identityCache.get(digits);
  if (Array.isArray(cached) && cached.length > 0) return cached;

  const fromPn = await resolveContactIdentities(client, { pn: digits });
  const fromLid = await resolveContactIdentities(client, {
    lid: `${digits}@lid`,
  });

  const resolved = Array.from(
    new Set(
      [
        digits,
        fromPn.pn,
        fromPn.lid,
        fromLid.pn,
        fromLid.lid,
      ].filter(Boolean)
    )
  );

  identityCache.set(digits, resolved, '1h');
  return resolved;
}

/**
 * Resolve persona modes with a contact-store fallback.
 * Handles legacy entries that only stored one side of a PN/LID pair.
 *
 * @param {{ sender?: any, tableBot?: Record<string, any> | null, client?: any }} options
 * @returns {Promise<string[]>}
 */
export async function resolvePersonaModesWithClient({
  sender,
  tableBot,
  client,
}) {
  if (!tableBot) return [];

  const girlfriend = normalizePersonaList(tableBot.nakiri_girlfriend);
  const adult = normalizePersonaList(tableBot.nakiri_18);
  if (girlfriend.length === 0 && adult.length === 0) return [];

  const direct = resolvePersonaModes({ sender, tableBot });
  if (direct.length > 0) return direct;

  const digits = collectSenderDigits(sender);
  if (digits.size === 0) return [];

  const expanded = new Set(digits);
  for (const value of digits) {
    for (const candidate of await resolveIdentityCandidates(client, value)) {
      expanded.add(candidate);
    }
  }

  return resolvePersonaModesFromDigits([...expanded], tableBot);
}

/**
 * Resolve persona modes from stored reminder identities.
 *
 * @param {{ pn?: string | null, lid?: string | null, tableBot?: Record<string, any> | null }} options
 * @returns {string[]}
 */
export function resolvePersonaModesFromIdentities({ pn, lid, tableBot }) {
  return resolvePersonaModes({
    sender: { pn, lid },
    tableBot,
  });
}

export default {
  normalizePersonaDigits,
  normalizePersonaList,
  resolvePersonaModes,
  resolvePersonaModesFromDigits,
  resolvePersonaModesFromIdentities,
  resolvePersonaModesWithClient,
};
