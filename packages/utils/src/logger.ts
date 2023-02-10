import { formatMessage } from './internal';

let adapter: Logger = console;
let loglevel: LogLevel = 'info';

export function createLogger(module = 'nexus'): Logger {
  const log =
    (method: keyof Logger) =>
    (message?: string, ...args: unknown[]) => {
      const currentLogLevel = typeof loglevel === 'string' ? LOG_LEVELS[loglevel] : loglevel;
      if (LOG_LEVELS[method] < currentLogLevel || !message) return;
      adapter[method](formatMessage(`${module}  ${message}`, ...args));
    };

  return {
    trace: log('trace'),
    debug: log('debug'),
    info: log('info'),
    warn: log('warn'),
    error: log('error'),
  };
}

export function setLogLevel(level: LogLevel): void {
  loglevel = level;
}

export function setLogger(newAdapter: Logger): void {
  adapter = newAdapter;
}

export interface Logger {
  trace(message?: string, ...args: unknown[]): void;
  debug(message?: string, ...args: unknown[]): void;
  info(message?: string, ...args: unknown[]): void;
  warn(message?: string, ...args: unknown[]): void;
  error(message?: string, ...args: unknown[]): void;
}

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | number;

const LOG_LEVELS = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
};
