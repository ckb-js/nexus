import { LIB_VERSION } from './version';
import { bytes, BytesLike } from '@ckb-lumos/codec';

function formatArgs(arg: unknown): string {
  if (typeof arg === 'string') {
    return arg;
  }

  try {
    return bytes.hexify(bytes.bytify(arg as BytesLike));
  } catch {
    return JSON.stringify(arg);
  }
}

export function makeError(message = 'Unknown error', ...args: unknown[]): Error {
  let i = 0;
  const formatted = message.replace(/%s/g, () => formatArgs(args[i++]));
  return new Error(`[NexusWallet]: ${formatted}  (version=${LIB_VERSION})`);
}

export function throwError(message?: string, ...args: unknown[]): never {
  throw makeError(message, ...args);
}

export function unimplemented(): never {
  throwError('Unimplemented');
}
