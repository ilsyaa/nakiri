import { WaClient } from 'zapo-js';

/**
 * Fatal disconnect reasons where automatic reconnection should NOT be attempted.
 * Based on official Zapo protocol error specifications.
 */
const FATAL_DISCONNECT_REASONS = new Set([
  'stream_error_replaced', // Same credentials connected elsewhere
  'stream_error_device_removed', // Device unlinked / logged out from phone
  'stream_error_force_logout', // Server forced logout (code 516)
  'failure_not_authorized', // 401: Invalid credentials
  'failure_banned', // 406: Account banned by WhatsApp
  'failure_locked', // 403: Account temporarily locked
  'failure_client_too_old', // 405: Advertised version rejected by WhatsApp
  'failure_bad_user_agent', // 409: Invalid user agent
  'primary_identity_key_change', // Identity changed, re-pairing required
]);

export class SessionManager {
  // Reconnection configuration
  static MAX_RECONNECT_ATTEMPTS = 5;
  static RECONNECT_BASE_DELAY_MS = 2000;
  static RECONNECT_BASE_MULTIPLIER = 1.5;
  static RECONNECT_MAX_DELAY_MS = 30000;

  // QR code configuration
  static MAX_QR_ROTATIONS = 6;

  // Pairing code configuration (WhatsApp pairing codes expire after 3 minutes)
  static PAIRING_CODE_EXPIRY_MS = 180000;

  clients = new Map();
  statusMap = new Map();
  qrMap = new Map();
  qrDataUrlMap = new Map();
  pairingCodeMap = new Map();
  reconnectTimers = new Map();
  pairingCodeTimers = new Map();
  reconnectAttempts = new Map();
  qrRotationCounts = new Map();
  explicitDisconnects = new Set();

  constructor(store, events, logger) {
    this.store = store;
    this.events = events;
    this.logger = logger;
  }

  hasSession(sessionId) {
    return this.clients.has(sessionId);
  }

  getActiveSessions() {
    return Array.from(this.clients.keys());
  }

  getClient(sessionId) {
    return this.clients.get(sessionId) ?? null;
  }

  getStatus(sessionId) {
    return this.statusMap.get(sessionId) ?? 'disconnected';
  }

  isReady(sessionId) {
    return this.getStatus(sessionId) === 'connected';
  }

  getQr(sessionId) {
    return this.qrMap.get(sessionId) ?? null;
  }

  getQrDataUrl(sessionId) {
    return this.qrDataUrlMap.get(sessionId) ?? null;
  }

  setQrDataUrl(sessionId, dataUrl) {
    this.qrDataUrlMap.set(sessionId, dataUrl);
  }

  getPairingCode(sessionId) {
    return this.pairingCodeMap.get(sessionId) ?? null;
  }

  setStatus(sessionId, status) {
    this.statusMap.set(sessionId, status);
    this.events.emitStatus(sessionId, status);
  }

  clearReconnectTimer(sessionId) {
    const timer = this.reconnectTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.reconnectTimers.delete(sessionId);
    }
  }

  clearPairingCodeTimer(sessionId) {
    const timer = this.pairingCodeTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.pairingCodeTimers.delete(sessionId);
    }
  }

  scheduleReconnect(sessionId) {
    if (this.explicitDisconnects.has(sessionId)) {
      return;
    }

    this.clearReconnectTimer(sessionId);

    const attempts = this.reconnectAttempts.get(sessionId) ?? 0;
    const maxAttempts = SessionManager.MAX_RECONNECT_ATTEMPTS;

    if (attempts >= maxAttempts) {
      this.logger.warn(
        sessionId,
        `Max automatic reconnection attempts reached (${maxAttempts}). Stopping reconnection cycle.`
      );
      this.setStatus(sessionId, 'disconnected');
      return;
    }

    this.reconnectAttempts.set(sessionId, attempts + 1);
    const delay = Math.min(
      SessionManager.RECONNECT_BASE_DELAY_MS *
        Math.pow(SessionManager.RECONNECT_BASE_MULTIPLIER, attempts),
      SessionManager.RECONNECT_MAX_DELAY_MS
    );

    this.logger.info(
      sessionId,
      `Scheduling reconnect in ${delay}ms (attempt ${attempts + 1}/${maxAttempts})`
    );

    const timer = setTimeout(() => {
      this.reconnectTimers.delete(sessionId);
      this.connect(sessionId).catch((err) => {
        this.logger.error(sessionId, `Reconnect failed: ${err.message}`);
      });
    }, delay);

    this.reconnectTimers.set(sessionId, timer);
  }

  async connect(sessionId, pairingNumber) {
    if (!sessionId || !sessionId.trim()) {
      throw new Error('Session ID must be a non-empty string');
    }

    const cleanPairingNumber = pairingNumber
      ? pairingNumber.replace(/[^0-9]/g, '')
      : undefined;

    if (pairingNumber !== undefined && !cleanPairingNumber) {
      throw new Error('Pairing phone number must contain valid digits');
    }

    this.explicitDisconnects.delete(sessionId);

    const existing = this.clients.get(sessionId);
    if (existing) {
      const currentStatus = this.getStatus(sessionId);
      if (
        currentStatus === 'connected' ||
        currentStatus === 'connecting' ||
        currentStatus === 'qr_ready' ||
        currentStatus === 'pairing_code_ready'
      ) {
        this.logger.info(
          sessionId,
          `Connection request ignored: session is already in active state "${currentStatus}"`
        );
        return;
      }
    }

    this.setStatus(sessionId, 'connecting');
    this.logger.info(
      sessionId,
      cleanPairingNumber
        ? `Initializing WhatsApp connection socket for Pairing Code (target: ${cleanPairingNumber})...`
        : 'Initializing WhatsApp connection socket for QR Code...'
    );

    const client = new WaClient(
      {
        store: this.store,
        sessionId,
        maxReconnectAttempts: 0, // Prevent WaComms internal reconnect loop; let SessionManager control lifecycle
        recoverFromClientTooOld: true, // Automatically handle HTTP 405 WA Web version bumps
      },
      this.logger.createZapoErrorLogger(sessionId)
    );

    // Dynamically forward all native Zapo events to EventBus with (payload, sessionId, client)
    /** @type {(keyof import('zapo-js').WaClientEventMap)[]} */
    const zapoEvents = [
      'message',
      'message_send',
      'message_addon',
      'message_bot_chunk',
      'message_protocol',
      'message_unavailable',
      'receipt',
      'newsletter',
      'newsletter_message_update',
      'presence',
      'chatstate',
      'call',
      'mex_notification',
      'group',
      'business',
      'picture',
      'privacy',
      'blocklist',
      'mutation',
      'mutation_send',
      'history_sync_chunk',
      'group_history_bundle',
      'mobile_registration_code',
      'mobile_account_takeover_notice',
    ];

    for (const eventName of zapoEvents) {
      client.on(eventName, (payload) => {
        this.events.emit(eventName, payload, sessionId, client);
      });
    }

    this.clients.set(sessionId, client);

    let pairingCodeRequested = false;
    const triggerPairingCode = async () => {
      if (!cleanPairingNumber || pairingCodeRequested) return;
      pairingCodeRequested = true;

      this.logger.info(
        sessionId,
        `Requesting 8-digit pairing code for: ${cleanPairingNumber}...`
      );

      try {
        const rawCode =
          await client.auth.requestPairingCode(cleanPairingNumber);
        const formatted = rawCode.match(/.{1,4}/g)?.join('-') ?? rawCode;

        this.pairingCodeMap.set(sessionId, formatted);
        this.qrMap.delete(sessionId);
        this.setStatus(sessionId, 'pairing_code_ready');

        this.logger.info(
          sessionId,
          `Pairing code issued successfully: ${formatted} (valid for 3 minutes). Please enter it on your phone.`
        );

        // WhatsApp pairing codes expire after 3 minutes
        this.clearPairingCodeTimer(sessionId);
        const expiryTimer = setTimeout(() => {
          this.pairingCodeTimers.delete(sessionId);
          if (this.getStatus(sessionId) === 'pairing_code_ready') {
            this.logger.warn(
              sessionId,
              'Pairing code expired after 3 minutes without authentication. Stopping session.'
            );
            void this.disconnect(sessionId);
          }
        }, SessionManager.PAIRING_CODE_EXPIRY_MS);

        this.pairingCodeTimers.set(sessionId, expiryTimer);
      } catch (err) {
        pairingCodeRequested = false;
        this.logger.error(
          sessionId,
          `Failed to request pairing code: ${err.message}`
        );
      }
    };

    this.qrRotationCounts.set(sessionId, 0);

    // QR Code emitted for authentication
    client.on('auth_qr', ({ qr }) => {
      if (cleanPairingNumber) {
        void triggerPairingCode();
        return;
      }

      const count = (this.qrRotationCounts.get(sessionId) ?? 0) + 1;
      this.qrRotationCounts.set(sessionId, count);

      if (count > SessionManager.MAX_QR_ROTATIONS) {
        this.logger.warn(
          sessionId,
          `QR pairing code expired after ${SessionManager.MAX_QR_ROTATIONS} rotations without being scanned. Stopping session.`
        );
        void this.disconnect(sessionId);
        return;
      }

      this.qrMap.set(sessionId, qr);
      this.qrDataUrlMap.delete(sessionId);
      this.setStatus(sessionId, 'qr_ready');

      this.logger.info(
        sessionId,
        `New pairing QR code generated (${count}/${SessionManager.MAX_QR_ROTATIONS}).`
      );
      this.events.emitQr(sessionId, qr);
    });

    client.on('auth_pairing_required', (event) => {
      if (cleanPairingNumber) {
        void triggerPairingCode();
      } else if (event?.forceManual) {
        this.logger.warn(
          sessionId,
          'QR refresh budget exhausted by WhatsApp server. Stopping pairing session.'
        );
        void this.disconnect(sessionId);
      }
    });

    client.on('auth_paired', () => {
      this.clearPairingCodeTimer(sessionId);
      this.qrMap.delete(sessionId);
      this.qrDataUrlMap.delete(sessionId);
      this.pairingCodeMap.delete(sessionId);
      this.reconnectAttempts.delete(sessionId);
      this.qrRotationCounts.delete(sessionId);
      this.setStatus(sessionId, 'connected');

      this.logger.info(
        sessionId,
        'Pairing completed successfully. Session authenticated.'
      );
    });

    client.on('auth_passkey_required', ({ hasSigner }) => {
      this.logger.warn(
        sessionId,
        `Passkey authentication required by server (hasSigner: ${hasSigner})`
      );
    });

    client.on('connection', (event) => {
      if (event.status === 'open') {
        this.clearPairingCodeTimer(sessionId);
        this.qrMap.delete(sessionId);
        this.qrDataUrlMap.delete(sessionId);
        this.pairingCodeMap.delete(sessionId);
        this.reconnectAttempts.delete(sessionId);
        this.qrRotationCounts.delete(sessionId);
        this.clearReconnectTimer(sessionId);
        this.setStatus(sessionId, 'connected');

        this.logger.info(
          sessionId,
          `Connection established (new login: ${event.isNewLogin}).`
        );
        return;
      }

      this.qrMap.delete(sessionId);
      this.qrDataUrlMap.delete(sessionId);
      this.logger.warn(
        sessionId,
        `Connection closed. Reason: "${event.reason}", Code: ${event.code}, isLogout: ${event.isLogout}`
      );

      if (event.isLogout || FATAL_DISCONNECT_REASONS.has(event.reason)) {
        this.logger.warn(
          sessionId,
          `Fatal disconnect condition detected (reason: "${event.reason}", isLogout: ${event.isLogout}). Session unlinked.`
        );
        this.clients.delete(sessionId);
        this.pairingCodeMap.delete(sessionId);
        this.reconnectAttempts.delete(sessionId);
        this.qrRotationCounts.delete(sessionId);
        this.clearReconnectTimer(sessionId);
        this.setStatus(sessionId, 'disconnected');
        return;
      }

      if (
        this.explicitDisconnects.has(sessionId) ||
        event.reason === 'client_disconnected'
      ) {
        this.logger.info(
          sessionId,
          'Disconnected explicitly by user request. Will not auto-reconnect.'
        );
        this.setStatus(sessionId, 'disconnected');
        return;
      }

      const isUnregistered = !client.getCredentials()?.meJid;
      const currentStatus = this.getStatus(sessionId);
      const isPairingState =
        currentStatus === 'qr_ready' ||
        currentStatus === 'pairing_code_ready' ||
        currentStatus === 'connecting';

      if (isUnregistered && isPairingState) {
        this.logger.warn(
          sessionId,
          'Pairing session socket closed before authentication completed. Stopping session.'
        );
        this.explicitDisconnects.add(sessionId);
        void client.disconnect().catch(() => {});
        this.clients.delete(sessionId);
        this.qrRotationCounts.delete(sessionId);
        this.clearReconnectTimer(sessionId);
        this.setStatus(sessionId, 'disconnected');
        return;
      }

      this.setStatus(sessionId, 'disconnected');
      this.scheduleReconnect(sessionId);
    });

    client.on('stream_failure', (event) => {
      this.logger.warn(
        sessionId,
        `Stream failure encountered: code ${event.failureCode}, reason: ${event.failureReason}, message: ${event.failureMessage}`
      );
    });

    client.on('stanza_error', (event) => {
      this.logger.warn(
        sessionId,
        `Stanza rejected by WhatsApp server: code ${event.code}, text: "${event.text}"`
      );
    });

    client.connect().catch((err) => {
      this.logger.error(
        sessionId,
        `Initial connection attempt failed: ${err.message}`
      );
      this.setStatus(sessionId, 'disconnected');
      if (!this.explicitDisconnects.has(sessionId)) {
        this.scheduleReconnect(sessionId);
      }
    });
  }

  async disconnect(sessionId) {
    if (!sessionId || !sessionId.trim()) {
      throw new Error('Session ID must be a non-empty string');
    }

    this.explicitDisconnects.add(sessionId);
    this.clearReconnectTimer(sessionId);
    this.clearPairingCodeTimer(sessionId);
    this.qrMap.delete(sessionId);
    this.qrDataUrlMap.delete(sessionId);
    this.pairingCodeMap.delete(sessionId);
    this.reconnectAttempts.delete(sessionId);
    this.qrRotationCounts.delete(sessionId);

    const client = this.clients.get(sessionId);
    if (client) {
      this.logger.info(sessionId, 'Closing socket connection gracefully...');
      await client.disconnect().catch((err) => {
        this.logger.warn(
          sessionId,
          `Error while closing socket: ${err.message}`
        );
      });
      this.clients.delete(sessionId);
      this.setStatus(sessionId, 'disconnected');
      this.logger.info(sessionId, 'Socket disconnected.');
    }
  }

  async logout(sessionId) {
    if (!sessionId || !sessionId.trim()) {
      throw new Error('Session ID must be a non-empty string');
    }

    this.explicitDisconnects.add(sessionId);
    this.clearReconnectTimer(sessionId);
    this.clearPairingCodeTimer(sessionId);
    this.qrMap.delete(sessionId);
    this.qrDataUrlMap.delete(sessionId);
    this.pairingCodeMap.delete(sessionId);
    this.reconnectAttempts.delete(sessionId);
    this.qrRotationCounts.delete(sessionId);

    const client = this.clients.get(sessionId);
    this.logger.info(
      sessionId,
      'Logging out session: unlinking from WhatsApp and clearing store credentials...'
    );

    if (client) {
      try {
        await client.logout();
      } catch (err) {
        this.logger.warn(sessionId, `Server logout warning: ${err.message}`);
      }
      this.clients.delete(sessionId);
    }

    try {
      const sessionStore = this.store.session(sessionId);
      await sessionStore.auth.clear();
      await sessionStore.destroy();
      this.logger.info(
        sessionId,
        'Session credentials deleted from persistent store.'
      );
    } catch (err) {
      this.logger.error(
        sessionId,
        `Failed to clean store credentials: ${err.message}`
      );
    }

    this.setStatus(sessionId, 'disconnected');
    this.logger.info(sessionId, 'Session logged out and wiped clean.');
  }

  async destroy() {
    const sessionIds = Array.from(this.clients.keys());
    for (const sessionId of sessionIds) {
      try {
        await this.disconnect(sessionId);
      } catch (err) {
        this.logger.warn(
          sessionId,
          `Error while disconnecting on shutdown: ${err.message}`
        );
      }
    }

    for (const timer of this.reconnectTimers.values()) {
      clearTimeout(timer);
    }
    this.reconnectTimers.clear();

    for (const timer of this.pairingCodeTimers.values()) {
      clearTimeout(timer);
    }
    this.pairingCodeTimers.clear();
  }
}

export default SessionManager;
