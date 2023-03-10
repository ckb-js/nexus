/**
 * an error to make RPC could return a friendly error
 */
export class NexusError<T = unknown> extends Error {
  __NEXUS_ERROR__ = true;
  code: number;
  data?: unknown;

  private constructor({ code, message, data }: { code: number; message: string; data?: T }) {
    super(message);
    this.code = code;
    this.data = data;
  }

  static create<T>(opt: { code?: number; message: string; data?: T } | string): NexusError<T> {
    if (typeof opt === 'string') {
      return new NexusError({ code: -1, message: opt });
    }

    return new NexusError({ code: opt.code ?? -1, message: opt.message, data: opt.data });
  }

  static isNexusError(error: unknown): error is NexusError {
    if (!error || typeof error !== 'object') return false;
    return '__NEXUS_ERROR__' in error && !!error.__NEXUS_ERROR__;
  }
}
