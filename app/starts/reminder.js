import logger from '@nakiri/core/utils/logger';
import {
  forgetClient,
  getRememberedClient,
  rememberClient,
} from '#app/services/client-registry.js';
import {
  processDueReminders,
  startReminderScheduler,
} from '#app/services/reminder.js';

/**
 * Server startup initialization for the reminder scheduler.
 *
 * @param {{ sessionManager?: any, events?: any }} context
 */
export default async function startReminders(context = {}) {
  const { sessionManager, events } = context;

  if (!sessionManager) {
    logger.warn(
      '[STARTUP]',
      'Reminder scheduler disabled: sessionManager is unavailable'
    );
    return;
  }

  if (events?.on) {
    // The event bus carries the live client with every incoming event.
    const clientEvents = [
      'message',
      'message_send',
      'receipt',
      'presence',
      'chatstate',
      'group',
      'call',
      'mex_notification',
    ];
    for (const eventName of clientEvents) {
      events.on(eventName, (event, sessionId, client) => {
        rememberClient(sessionId, client);
      });
    }
    events.on('status', (sessionId, status) => {
      if (status === 'disconnected' || status === 'logged_out') {
        forgetClient(sessionId);
      }
    });
  }

  startReminderScheduler({ sessionManager });

  if (events?.on) {
    events.on('status', (sessionId, status) => {
      if (status !== 'connected') return;
      processDueReminders({ sessionManager }).catch((err) => {
        logger.error(
          '[REMINDER]',
          `Failed to process reminders after connect: ${err.message}`
        );
      });
    });
  }

  logger.info('[STARTUP]', 'Initialized reminder scheduler');
}
