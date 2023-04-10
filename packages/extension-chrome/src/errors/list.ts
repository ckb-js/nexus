import { OutPoint } from '@ckb-lumos/base';
import { NexusError } from './NexusError';

function prepareNexusError<T>(opts: {
  code?: number;
  reason: string;
  suggestion?: string;
}): (data?: T) => NexusError<T> {
  return (data?: T) => {
    const message = `${opts.reason}, ${opts.suggestion}`;
    return NexusError.create({ code: opts.code, message, data });
  };
}

/**
 * A list of errors that help to tell the end user what happened,
 * and provide some suggestions to resolve the problem.
 */
export const NexusCommonErrors = {
  DuplicateRequest: prepareNexusError({
    reason: 'A request is still in pending',
    suggestion: 'Please handle requests that are still pending first',
  }),
  ApproveRejected: prepareNexusError({
    reason: 'The approval was rejected',
  }),
  RequestTimeout: prepareNexusError({
    reason: 'The request was timeout',
    suggestion: 'Please try later',
  }),
  RequestCkbFailed: prepareNexusError({
    reason: 'Request CKB node failed, the connected node is not available now',
    suggestion: 'Please try later or switch to another node',
  }),
  CellNotFound: prepareNexusError<OutPoint>({
    reason: 'Cannot resolve the cell',
    suggestion: 'Please check if the selected network is correct or the cell is still live',
  }),
};
