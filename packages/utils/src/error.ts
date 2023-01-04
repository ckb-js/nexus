import { LIB_VERSION } from './version';

export function unimplemented(): never {
  throwError('unimplemented');
}

export function throwError(message = 'unknown'): never {
  throw new Error(`[NexusError]: ${message}\nversion=${LIB_VERSION}`);
}
