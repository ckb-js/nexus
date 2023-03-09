/**
 * an error to make RPC could return a friendly error
 */
export class NexusError<T = unknown> extends Error {
  __NEXUS_ERROR__ = true;
  code: number;
  data?: unknown;

  constructor({ code = -1, message, data }: { code?: number; message?: string; data?: T }) {
    super(message);
    this.code = code;
    this.data = data;
  }

  static create<T>({ code = -1, message, data }: { code?: number; message?: string; data?: T }): NexusError<T> {
    return new NexusError({ code, message, data });
  }

  static isNexusError(error: unknown): error is NexusError {
    if (!error || typeof error !== 'object') return false;
    return '__NEXUS_ERROR__' in error && !!error.__NEXUS_ERROR__;
  }
}
