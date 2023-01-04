export function hasProp<K extends string>(obj: unknown, key: K): obj is Record<K, unknown> {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  return key in obj;
}

export function propStr(obj: unknown, key: string): string {
  if (hasProp(obj, key) && typeof obj[key] === 'string') {
    return obj[key] as string;
  }

  throw new Error(`no key ${key} in obj ${obj}`);
}

// function buildMv3Entry(entry: string | string[], name: string): string[] {
//   return (Array.isArray(entry) ? entry : [entry]).concat(`mv3-hot-reload/${name}`);
// }
