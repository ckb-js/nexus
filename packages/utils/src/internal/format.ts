function hexify(x: Uint8Array): string {
  return (
    '0x' +
    Array.from(x)
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
  );
}

function formatArgs(arg: unknown): string {
  if (typeof arg === 'string') {
    return arg;
  }

  if (arg instanceof Error) {
    return `${arg.name}: ${arg.message} (${arg.stack})`;
  }

  if (arg instanceof Uint8Array) {
    return hexify(arg);
  }

  return JSON.stringify(arg);
}

/**
 * format message with args, the %s will be replaced with args in order
 * @example
 *   formatMessage('hello %s', 'world') // => 'hello world'
 *   formatMessage(Buffer.from([1,2,3,4])) // => '0x01020304'
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
