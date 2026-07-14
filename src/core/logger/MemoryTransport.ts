import type { ILoggerTransport, LogLevel } from './types';

export interface MemoryLogEntry {
  level: LogLevel;
  context: string;
  message: string;
  data?: unknown;
}

/**
 * MemoryTransport
 * Used strictly for testing and verification purposes.
 */
export class MemoryTransport implements ILoggerTransport {
  public logs: MemoryLogEntry[] = [];

  log(level: LogLevel, context: string, message: string, data?: unknown): void {
    this.logs.push({ level, context, message, data });
  }

  clear(): void {
    this.logs = [];
  }
}
