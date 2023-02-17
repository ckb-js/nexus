import { createJSONRPCErrorResponse, JSONRPCErrorCode, JSONRPCServerMiddleware } from 'json-rpc-2.0';
import { formatMessage } from '@nexus-wallet/utils';
import { ServerParams } from '../types';

/**
 * a JSON-RPC middleware to check
 *  1. if the wallet is initialized
 *  2. if the host is in the whitelist
 * @param next
 * @param request
 * @param serverParams
 */
export const whitelistMiddleware: JSONRPCServerMiddleware<ServerParams> = async (next, request, serverParams) => {
  const { method } = request;

  // allow all debug methods
  if (method.startsWith('debug')) {
    return next(request, serverParams);
  }

  // reject all methods if nexus is not initialized
  const internalService = serverParams.resolveService('internalService');
  const initialized = await internalService.isInitialized();
  if (!initialized) {
    void internalService.startInitIfNotInitialized();
    return createJSONRPCErrorResponse(
      request.id!,
      JSONRPCErrorCode.InternalError,
      `Nexus is not initialized yet, please initialize it first`,
    );
  }

  // reject methods if the host is not in the whitelist except wallet_enable
  if (method !== 'wallet_enable') {
    const configService = serverParams.resolveService('configService');
    const whitelist = await configService.getWhitelist();
    const { url } = await serverParams.getRequesterAppInfo();
    const requesterHost = new URL(url).host;
    const inWhitelist = whitelist.find((item) => item.host === requesterHost);
    if (!inWhitelist) {
      return createJSONRPCErrorResponse(
        request.id!,
        JSONRPCErrorCode.InternalError,
        formatMessage(`host "%s" is not in the whitelist, please call "wallet_enable first"`, requesterHost),
      );
    }
  }

  return next(request, serverParams);
};
