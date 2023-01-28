import { LIB_VERSION } from './version';

export function makeError(message = 'Unknown error'): Error {
  return new Error(`[NexusWallet]: ${message}  (version=${LIB_VERSION})`);
}

export function throwError(message?: string): never {
  throw makeError(message);
}

export function unimplemented(): never {
  throwError('Unimplemented');
}
