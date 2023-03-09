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

  if (arg instanceof Error) {
    return `${arg.name}: ${arg.message} (${arg.stack})`;
  }

  if (arg instanceof Uint8Array) {
    return bytes.hexify(bytes.bytify(arg as BytesLike));
  }

  return JSON.stringify(arg);
}

/**
 * format message with args, the %s will be replaced with args in order
 * @example
 * ```js
 * formatMessage('hello %s', 'world') // => 'hello world'
 * ```
 * @param args
 */
export function formatMessage(...args: unknown[]): string {
  if (args.length === 0) {
    return '';
  }

  const message = args[0];
  if (typeof message !== 'string') {
    return args.map(formatArgs).join(' ');
  }

  let replaced = 1;
  let formatted = message.replace(/%s/g, () => formatArgs(args[replaced++]));
  if (replaced < args.length) {
    formatted += ' ' + args.slice(replaced).map(formatArgs).join(' ');
  }
  return formatted;
}

export function formatMessageWithPrefix(prefix: string, ...args: unknown[]): string {
  const firstArg = args[0];
  if (typeof firstArg === 'string') {
    return formatMessage(prefix + firstArg, ...args.slice(1));
  }
  return formatMessage(prefix, ...args);
}
