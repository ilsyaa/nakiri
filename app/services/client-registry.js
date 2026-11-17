import logger from '@nakiri/core/utils/logger';

const clients = new Map();

/**
 * Remember the live WhatsApp client for a session.
 *
 * @param {string} sessionId
 * @param {any} client
 */
export function rememberClient(sessionId, client) {
  if (!sessionId || !client) return;
  if (clients.get(sessionId) !== client) {
    logger.debug(
      '[CLIENT_REGISTRY]',
      `Captured client for session ${sessionId}`
    );
  }
  clients.set(sessionId, client);
}

/**
 * Forget a session client after a disconnect or logout.
 *
 * @param {string} sessionId
 */
export function forgetClient(sessionId) {
  if (!sessionId) return;
  clients.delete(sessionId);
}

/**
 * Get the last live client seen for a session.
 *
 * @param {string} sessionId
 * @returns {any | null}
 */
export function getRememberedClient(sessionId) {
  if (!sessionId) return null;
  return clients.get(sessionId) || null;
}

/**
 * List session ids with a remembered client.
 *
 * @returns {string[]}
 */
export function getRememberedSessions() {
  return Array.from(clients.keys());
}

export default {
  rememberClient,
  forgetClient,
  getRememberedClient,
  getRememberedSessions,
};
