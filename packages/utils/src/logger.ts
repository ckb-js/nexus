import { formatMessageWithPrefix } from './internal';

let adapter: Logger = console;
let loglevel: LogLevel = 'info';

export function createLogger(module = 'Nexus'): Logger {
  const log =
    (method: keyof Logger) =>
    (...args: unknown[]) => {
      const currentLogLevel = typeof loglevel === 'string' ? LOG_LEVELS[loglevel] : loglevel;
      if (LOG_LEVELS[method] < currentLogLevel || !args.length) return;

      const log = adapter[method];

      const level = method.toUpperCase();
      const prefix = `[${module}]\t[${level}]\t`;

      log(formatMessageWithPrefix(prefix, ...args));
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
  trace(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | number;

const LOG_LEVELS = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
};
