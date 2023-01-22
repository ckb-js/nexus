interface RpcCall<Params, Result> {
  params: Params;
  result: Result;
}

export interface RpcMethods {
  wallet_enable: RpcCall<void, void>;
  wallet_isEnabled: RpcCall<void, boolean>;
  wallet_getNetworkName: RpcCall<void, string>;
  wallet_getRandomMnemonic: RpcCall<void, string[]>;
}

/**
 * the RPC server handler second params
 */
export interface ServerParams {
  getRequesterAppInfo(): Promise<{ url: string; favIconUrl: string }>;
}
