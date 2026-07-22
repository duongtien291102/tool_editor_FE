import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Logger } from './Logger';
import { ConsoleTransport } from './ConsoleTransport';
import { MemoryTransport } from './MemoryTransport';
import { LogLevel } from './types';

describe('Logger', () => {
  let memoryTransport: MemoryTransport;
  let logger: Logger;

  beforeEach(() => {
    memoryTransport = new MemoryTransport();
    logger = new Logger('TestContext', LogLevel.DEBUG);
    logger.addTransport(memoryTransport);
  });

  it('should log messages to MemoryTransport', () => {
    logger.info('Test message', { key: 'value' });
    expect(memoryTransport.logs).toHaveLength(1);
    expect(memoryTransport.logs[0]?.level).toBe(LogLevel.INFO);
    expect(memoryTransport.logs[0]?.context).toBe('TestContext');
    expect(memoryTransport.logs[0]?.message).toBe('Test message');
    expect(memoryTransport.logs[0]?.data).toEqual({ key: 'value' });
  });

  it('should filter messages based on minimum log level', () => {
    const prodLogger = new Logger('ProdContext', LogLevel.WARN);
    prodLogger.addTransport(memoryTransport);

    prodLogger.debug('Debug msg');
    prodLogger.info('Info msg');
    prodLogger.warn('Warn msg');
    prodLogger.error('Error msg');

    expect(memoryTransport.logs).toHaveLength(2);
    expect(memoryTransport.logs[0]?.level).toBe(LogLevel.WARN);
    expect(memoryTransport.logs[1]?.level).toBe(LogLevel.ERROR);
  });

  it('should successfully switch transports and use ConsoleTransport', () => {
    const consoleTransport = new ConsoleTransport();
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const swappableLogger = new Logger('SwapContext', LogLevel.WARN);
    swappableLogger.addTransport(consoleTransport);

    swappableLogger.warn('Test warn');

    expect(consoleSpy).toHaveBeenCalledWith('[SwapContext] Test warn', '');
    consoleSpy.mockRestore();
  });
});
