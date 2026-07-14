import { type ILoggerTransport, LogLevel } from './types';

export class Logger {
  private transports: ILoggerTransport[] = [];
  private context: string;
  private minLevel: LogLevel;

  constructor(context: string, minLevel: LogLevel = LogLevel.INFO) {
    this.context = context;
    this.minLevel = minLevel;
  }

  addTransport(transport: ILoggerTransport) {
    this.transports.push(transport);
  }

  private log(level: LogLevel, message: string, data?: unknown) {
    if (level < this.minLevel) return;
    this.transports.forEach(t => t.log(level, this.context, message, data));
  }

  debug(message: string, data?: unknown) {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: unknown) {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: unknown) {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: unknown) {
    this.log(LogLevel.ERROR, message, data);
  }
}
