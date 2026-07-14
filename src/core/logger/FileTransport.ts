import type { ILoggerTransport, LogLevel } from './types';

/**
 * FileTransport (Interface/Stub)
 * Will be implemented in the future to write logs to the local file system (e.g., via Electron or Node.js FS).
 */
export class FileTransport implements ILoggerTransport {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  log(_level: LogLevel, _context: string, _message: string, _data?: unknown): void {
    // TODO: Implement file writing logic (e.g., append to app.log)
  }
}
