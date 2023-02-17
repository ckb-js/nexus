import { LIB_VERSION } from './version';
import { formatMessage } from './internal';

export function makeError(message = 'Unknown error', ...args: unknown[]): Error {
  const formatted = formatMessage(message, ...args);
  return new Error(`[NexusWallet]: ${formatted}  (version=${LIB_VERSION})`);
}

export function throwError(message?: string, ...args: unknown[]): never {
  throw makeError(message, ...args);
}

export function unimplemented(): never {
  throwError('Unimplemented');
}
