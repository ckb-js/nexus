import type { Provider } from '@nexus-wallet/types/lib/services/common';
import type { Promisable } from '@nexus-wallet/types';
import { bytes, BytesLike } from '@ckb-lumos/codec';

export function resolveProvider<T>(provider: Provider<T>): Promisable<T> {
  return provider instanceof Function ? provider() : provider;
}

function formatArgs(arg: unknown): string {
  if (typeof arg === 'string') {
    return arg;
  }

  try {
    // TODO check if arg is a valid BytesLike string first
    //  instead of just try to convert it
    return bytes.hexify(bytes.bytify(arg as BytesLike));
  } catch {
    return JSON.stringify(arg);
  }
}

/**
 * format message with args, the %s will be replaced with args in order
 * @example
 * ```js
 * formatMessage('hello %s', 'world') // => 'hello world'
 * ```
 * @param message
 * @param args
 */
export function formatMessage(message: string, ...args: unknown[]): string {
  let i = 0;
  return message.replace(/%s/g, () => formatArgs(args[i++]));
}
