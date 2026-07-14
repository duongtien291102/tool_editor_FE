export { Logger } from './Logger';
export { ConsoleTransport } from './ConsoleTransport';
export { FileTransport } from './FileTransport';
export { RemoteTransport } from './RemoteTransport';
export { MemoryTransport } from './MemoryTransport';
export { LogLevel } from './types';
export type { ILoggerTransport } from './types';

import { Logger } from './Logger';
import { ConsoleTransport } from './ConsoleTransport';
import { LogLevel } from './types';
import { configService } from '../config/ConfigService';

const isProd = configService.isProduction();
const defaultMinLevel = isProd ? LogLevel.WARN : LogLevel.DEBUG;

const defaultTransport = new ConsoleTransport();

export function createLogger(context: string, minLevel: LogLevel = defaultMinLevel): Logger {
  const logger = new Logger(context, minLevel);
  logger.addTransport(defaultTransport);
  return logger;
}

export const appLogger = createLogger('App');
