import { createJSONRPCErrorResponse, JSONRPCErrorCode, JSONRPCServerMiddleware } from 'json-rpc-2.0';
import { ZodType } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { ServerParams } from '../types';

export function createParameterValidateMiddleware(
  validators: Record<string, ZodType<unknown>>,
): JSONRPCServerMiddleware<ServerParams> {
  const parameterValidateMiddleware: JSONRPCServerMiddleware<ServerParams> = async (next, request, serverParams) => {
    const { method, params } = request;
    const validator: ZodType<unknown> | undefined = validators[method];
    if (!validator) {
      return next(request, serverParams);
    }

    const validateResult = await validator.safeParseAsync(params);
    if (validateResult.success) {
      return next(request, serverParams);
    }
    const { error } = validateResult;

    return createJSONRPCErrorResponse(request.id!, JSONRPCErrorCode.InvalidParams, fromZodError(error).message, error);
  };
  return parameterValidateMiddleware;
}
