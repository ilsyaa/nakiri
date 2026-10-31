export declare class SessionLogger {
  info(sessionId: string, message: string): void
  warn(sessionId: string, message: string): void
  error(sessionId: string, message: string): void
  debug(sessionId: string, message: string): void
  createZapoErrorLogger(sessionId: string): any
}

export declare const sessionLogger: SessionLogger

export default sessionLogger
