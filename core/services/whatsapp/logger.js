import logger from '@nakiri/core/utils/logger';

export class SessionLogger {
  info(sessionId, message) {
    logger.info(`[${sessionId}]`, message);
  }

  warn(sessionId, message) {
    logger.warn(`[${sessionId}]`, message);
  }

  error(sessionId, message) {
    logger.error(`[${sessionId}]`, message);
  }

  debug(sessionId, message) {
    logger.debug(`[${sessionId}]`, message);
  }

  createZapoErrorLogger(sessionId) {
    return {
      level: 'error',
      trace: () => {},
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: (message, context) => {
        const details =
          context && Object.keys(context).length > 0
            ? ` ${JSON.stringify(context)}`
            : '';
        logger.error(`[ZAPO:${sessionId}]`, `${message}${details}`);
      },
      child: () => this.createZapoErrorLogger(sessionId),
    };
  }
}

export const sessionLogger = new SessionLogger();

export default sessionLogger;
