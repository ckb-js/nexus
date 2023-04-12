import { LIB_VERSION } from './env';
import { formatMessage } from './internal';

export function makeError(...args: unknown[]): Error {
  const formatted = formatMessage(...args);
  return new Error(`${formatted}\t(version=${LIB_VERSION})`);
}

export function throwError(...args: unknown[]): never {
  throw makeError(...args);
}

export function unimplemented(): never {
  throwError('Unimplemented');
}
