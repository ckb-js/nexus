import { RpcMethods, ServerParams } from './types';
import { ModulesFactory } from '../services';
import { JSONRPCRequest, JSONRPCResponse, JSONRPCServer } from 'json-rpc-2.0';
import { whitelistMiddleware } from './middlewares/whitelistMiddleware';
import { createLogger } from '@nexus-wallet/utils';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { z, ZodType } from 'zod';
import { createParameterValidateMiddleware } from './middlewares/parameterValidateMiddleware';

export const methods: Record<string, (...args: unknown[]) => unknown> = {};
export const validators: Record<string, ZodType<unknown>> = {};
const parameterValidateMiddleware = createParameterValidateMiddleware(validators);

export const logger = createLogger();

export function addMethod<K extends keyof RpcMethods>(method: K, handler: RPCMethodHandler<K>): void {
  Object.assign(methods, { [method]: handler });
}

type ObjectEquals<X, Y> = X extends Y ? (Y extends X ? true : false) : false;
/**
 * add a zod schema to validate the method's arguments
 * @param method the method name, must be the key of {@link RpcMethods}
 * @param argSchema the schema of the method's first argument.When it's type is `never`, it means the schema is not same as `RpcMethods[TKey]['params']`
 */
export function addMethodValidator<TKey extends keyof RpcMethods, TArg extends ZodType>(
  method: TKey,
  argSchema: ObjectEquals<RpcMethods[TKey]['params'], z.infer<TArg>> extends true ? TArg : never,
): void {
  if (!methods[method as string]) {
    logger.error(
      `Method ${method} is not registered yet. Please call \`addMethod\` first. This addMethodValidator call will be ignored.`,
    );
    return;
  }
  if (validators[method as string]) {
    logger.warn(`Method ${method} is already registered with a schema. The new schema will override it`);
  }

  Object.assign(validators, {
    [method]: argSchema,
  });
}

interface NexusRpcServer<Sender> {
  handleRequest: (payload: { request: JSONRPCRequest; sender: Sender }) => PromiseLike<JSONRPCResponse | null>;
}

/**
 * this method should be called after all methods has been registered
 * so if you want to createServer, you should call {@link addMethod} first.
 * Checkout {@link PlatformService.getRequesterAppInfo} for more details about the <Sender>
 * @see {@link PlatformService.getRequesterAppInfo}
 * @param factory
 */
export function createServer<Sender>(factory: ModulesFactory): NexusRpcServer<Sender> {
  const server = new JSONRPCServer<ServerParams>();
  server.applyMiddleware(errorMiddleware);
  server.applyMiddleware(whitelistMiddleware);
  server.applyMiddleware(parameterValidateMiddleware);

  const registered = Object.keys(methods);
  logger.info('Methods has been registered: ', registered);
  /* istanbul ignore if */
  if (registered.length === 0) {
    logger.warn(
      'No methods has been registered, please check if you have imported rpc implementation modules, e.g. walletImpl, debugImpl, etc.',
    );
  }
  Object.entries(methods).forEach(([method, handler]) => server.addMethod(method, handler));

  return {
    handleRequest: ({ request, sender }) => server.receive(request, createRpcServerParams({ sender, factory })),
  };
}

export function createRpcServerParams<Sender>({
  sender,
  factory,
}: {
  sender: Sender;
  factory: ModulesFactory;
}): ServerParams {
  return {
    getRequesterAppInfo: async () => {
      const platform = factory.get('platformService');
      return platform.getRequesterAppInfo(sender);
    },

    resolveService: (k) => factory.get(k),
  };
}
