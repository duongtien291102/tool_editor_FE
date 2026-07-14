import { type ILoggerTransport, LogLevel } from './types';

export class ConsoleTransport implements ILoggerTransport {
  log(level: LogLevel, context: string, message: string, data?: unknown): void {
    const formattedMessage = `[${context}] ${message}`;
    /* eslint-disable no-console */
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, data ?? '');
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, data ?? '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, data ?? '');
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, data ?? '');
        break;
    }
    /* eslint-enable no-console */
  }
}
