/* eslint-disable @typescript-eslint/no-explicit-any */
import { OutPoint } from '@ckb-lumos/base';
import { NexusError } from './NexusError';

export function prepareNexusError<T>(opts: { code?: number; message: string }): (data?: T) => NexusError<T> {
  return (data?: T) => NexusError.create({ code: opts.code, message: opts.message, data });
}

export const ErrorProducers = {
  RequestCkbFailed: prepareNexusError({
    message: 'Request CKB node failed, maybe the node is not available now, please try again later',
  }),
  CellNotFound: prepareNexusError<OutPoint>({
    message: `Cannot resolve the cell, please check if the network is correct or if the cell is still live`,
  }),
  Unknown: prepareNexusError({ message: 'Unknown error' }),
};

type CreateError = typeof ErrorProducers;
type NexusErrorTypes = keyof CreateError;

type DataOfNexusError<T> = T extends (...args: any[]) => NexusError<infer E> ? E : number;

export function throwNexusError<E extends NexusErrorTypes>(type: E, data: DataOfNexusError<CreateError[E]>): never;
export function throwNexusError<E extends string>(message: E extends NexusErrorTypes ? never : E, data: unknown): never;
export function throwNexusError(error: string, data?: unknown): never {
  if (error in ErrorProducers) {
    throw ErrorProducers[error as NexusErrorTypes](data as any);
  }

  throw new NexusError({ message: error, data });
}
