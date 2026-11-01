import chatBuffer from '#app/services/chat-buffer.js';
import logger from '@nakiri/core/utils/logger';

/**
 * Server startup initialization for chat buffer and flusher
 */
export default async function startChatBuffer() {
  chatBuffer.init();
  logger.info(
    '[STARTUP]',
    'Initialized ChatBuffer service with crash recovery'
  );
}
