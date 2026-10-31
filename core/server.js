import * as p from '@clack/prompts';
import qrcode from 'qrcode-terminal';
import env from '@nakiri/core/services/env';
import logger from '@nakiri/core/utils/logger';
import { Storage } from '@nakiri/core/utils/storage';
import { initDirectories } from '@nakiri/core/utils/path';
import {
  createWhatsAppStore,
  WhatsAppEventBus,
  sessionLogger,
  SessionManager,
} from '@nakiri/core/services/whatsapp';
import { initDatabase, closeDatabase } from '@nakiri/core/services/database';
import moduleLoader from '@nakiri/core/services/modules';

export const bootScreen = () => {
  console.clear();
};

/**
 * Start the Nakiri WhatsApp Bot server runtime.
 * @returns {Promise<{ sessionManager: SessionManager, store: any, events: WhatsAppEventBus }>}
 */
export const startServer = async () => {
  bootScreen();
  try {
    initDirectories();
    await Storage.clearTmp();
    logger.info('[SYSTEM]', 'Nakiri is starting...');

    // Initialize Database Connection
    await initDatabase();

    const store = createWhatsAppStore();
    const events = new WhatsAppEventBus();
    const sessionManager = new SessionManager(store, events, sessionLogger);

    // Load & bind native modules to EventBus
    await moduleLoader.load();
    await moduleLoader.boot({ store, events, sessionManager });
    moduleLoader.bind(events);

    const sessionId = env.SESSION_ID;

    // Event listener for connection status updates
    events.on('status', (sid, status) => {
      logger.info(`[${sid}]`, `Status: ${status}`);
    });

    // Event listener to render QR Code in terminal
    events.on('qr', (sid, qr) => {
      logger.info(`[${sid}]`, 'Scan the QR code below to link WhatsApp:');
      qrcode.generate(qr, { small: true });
    });

    // Check for existing saved sessions
    const registeredSessions = await store.getRegisteredSessions();
    const existingSession = registeredSessions.find(
      (s) => s.sessionId === sessionId
    );

    if (existingSession) {
      logger.info(
        '[AUTH]',
        `Found saved session "${existingSession.sessionId}" (${existingSession.meJid}). Connecting...`
      );
      await sessionManager.connect(existingSession.sessionId);
    } else {
      logger.info(
        '[AUTH]',
        `No saved credentials found for session "${sessionId}".`
      );

      if (process.stdin.isTTY) {
        p.intro(`WhatsApp Authentication (Session: ${sessionId})`);

        const method = await p.select({
          message: 'Select login method:',
          options: [
            {
              value: 'qr',
              label: 'QR Code',
              hint: 'Scan QR code with your phone camera',
            },
            {
              value: 'pairing',
              label: 'Pairing Code',
              hint: 'Enter 8-digit code in WhatsApp linked devices',
            },
          ],
        });

        if (p.isCancel(method)) {
          p.cancel('Authentication cancelled.');
          process.exit(0);
        }

        if (method === 'pairing') {
          const phoneNumber = await p.text({
            message: 'Enter WhatsApp phone number with country code:',
            placeholder: '628xxxx',
            validate(value) {
              if (!value || !value.trim()) return 'Phone number is required!';
              const digits = value.replace(/[^0-9]/g, '');
              if (digits.length < 8 || digits.length > 16) {
                return 'Please enter a valid phone number (e.g. 628xxxxx)';
              }
            },
          });

          if (p.isCancel(phoneNumber)) {
            p.cancel('Authentication cancelled.');
            process.exit(0);
          }

          await sessionManager.connect(sessionId, String(phoneNumber));
        } else {
          await sessionManager.connect(sessionId);
        }
      } else {
        logger.info(
          '[AUTH]',
          'Non-interactive environment detected, falling back to QR Code...'
        );
        await sessionManager.connect(sessionId);
      }
    }

    // Graceful shutdown
    const handleShutdown = async () => {
      logger.info('[SYSTEM]', 'Shutting down Nakiri...');
      await sessionManager.destroy();
      await closeDatabase();
      process.exit(0);
    };

    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);

    return { sessionManager, store, events };
  } catch (error) {
    const err = /** @type {any} */ (error);
    logger.fatal('[SYSTEM]', err?.message ?? error);
    process.exit(1);
  }
};

// Auto-start server if executed directly via node core/server.js
const isDirectExecution = process.argv[1]
  ?.replace(/\\/g, '/')
  .endsWith('core/server.js');
if (isDirectExecution) {
  startServer();
}

export default startServer;
