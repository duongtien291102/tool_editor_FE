import type { ILoggerTransport, LogLevel } from './types';

/**
 * RemoteTransport (Interface/Stub)
 * Will be implemented in the future to send logs to a remote server (e.g., Datadog, Sentry, ELK).
 */
export class RemoteTransport implements ILoggerTransport {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  log(_level: LogLevel, _context: string, _message: string, _data?: unknown): void {
    // TODO: Implement remote logging logic (e.g., fetch POST to VITE_REMOTE_LOGGER_URL)
  }
}
