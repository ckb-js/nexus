import { JSONRPCResponse } from 'json-rpc-2.0';
import { NexusCommonErrors } from '../../../errors';
import pRetry from './thirdpartyLib/p-retry';
import pTimeout from './thirdpartyLib/p-timeout';

export type RequestOptions = {
  timeout?: number; // in milliseconds
  maxRetries?: number;
};

export const requestWithOptions = async (
  promiseCtor: () => Promise<Response>,
  options?: RequestOptions,
): Promise<JSONRPCResponse | JSONRPCResponse[]> => {
  const retryRunner = async () => {
    const res = await promiseCtor();
    // Abort retrying if the resource doesn't exist
    if (res.status >= 300) {
      /* istanbul ignore next */
      throw NexusCommonErrors.RequestCkbFailed(res);
    }
    return res.json();
  };

  const retryPromise = pRetry(retryRunner, { retries: options?.maxRetries || 5 });
  const res = await pTimeout(retryPromise, {
    milliseconds: options?.timeout || 5_000,
  });

  return res as Promise<JSONRPCResponse | JSONRPCResponse[]>;
};
