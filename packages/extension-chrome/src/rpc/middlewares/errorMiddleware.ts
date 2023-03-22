import { createJSONRPCErrorResponse, JSONRPCServerMiddleware } from 'json-rpc-2.0';
import { NexusError } from '../../errors';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorMiddleware: JSONRPCServerMiddleware<any> = async (next, request, serverParams) => {
  try {
    return await next(request, serverParams);
  } catch (e) {
    if (NexusError.isNexusError(e)) {
      return createJSONRPCErrorResponse(request.id!, e.code, e.message, e.data);
    }
    throw e;
  }
};
