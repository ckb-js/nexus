import { nanoid } from 'nanoid';
import { CallMap, CallParam, CallResult, Promisable } from '@nexus-wallet/types';
import {
  createJSONRPCErrorResponse,
  createJSONRPCRequest,
  createJSONRPCSuccessResponse,
  isJSONRPCRequest,
  isJSONRPCResponse,
  JSONRPCErrorCode,
  JSONRPCRequest,
  JSONRPCResponse,
} from 'json-rpc-2.0';
import { asserts } from '@nexus-wallet/utils';

export interface SessionMessenger<Map extends CallMap = CallMap> {
  sessionId(): string;
  send<T extends keyof Map>(method: T, params?: CallParam<Map[T]>): Promise<CallResult<Map[T]>>;
  register<T extends keyof Map>(method: T, handler: (data: CallParam<Map[T]>) => Promisable<CallResult<Map[T]>>): void;
  destroy(): void;
}

export const SESSION_MESSAGE_SYMBOL = '__SESSION_MESSAGE_SYMBOL__' as const;

export type SessionMessage = {
  [SESSION_MESSAGE_SYMBOL]: true;
  rpc: JSONRPCRequest | JSONRPCResponse;
};

export interface MessengerAdapter {
  send(message: SessionMessage): void;
  receive(handler: MessageReceiver): void;
  dispose(handler: MessageReceiver): void;
}

export type MessageReceiver = (message: SessionMessage) => void;

export type CreateSessionMessengerConfig = {
  sessionId?: string;
  adapter: MessengerAdapter;
};

/**
 * a two-way JSON-RPC 2.0 messenger wrapper for communication between two parties
 * @param config
 * @example
 * ```ts
 * type Map = {
 *   ping: Call<void, 'pong'>;
 * }
 *
 * const server = createSessionMessenger<Map>({ adapter });
 * server.receive('ping', () => 'pong');
 *
 * const client = createSessionMessenger<Map>({ adapter, sessionId: server.sessionId() });
 * await client.send('ping'); // 'pong'
 * ```
 */
export function createSessionMessenger<Map extends CallMap>(
  config: CreateSessionMessengerConfig,
): SessionMessenger<Map> {
  const { sessionId = nanoid(), adapter } = config;

  // a set of JSONRPC request handlers,
  // used to handle incoming JSONRPC requests
  // and these handlers will be removed after calling destroy()
  let handlers = new Set<MessageReceiver>();
  let reqId = 1;

  const genJsonRpcRequestId = () => `${sessionId}:${reqId++}`;
  const isCurrentSessionMessage = (message: SessionMessage) => {
    return typeof message.rpc.id === 'string' && message.rpc.id.startsWith(sessionId);
  };

  return {
    sessionId: () => sessionId,
    send: <T extends keyof Map>(type: T, param?: CallParam<Map[T]>) => {
      const currentReqId = genJsonRpcRequestId();

      const requestMessage = createSessionMessage(createJSONRPCRequest(currentReqId, String(type), param));
      adapter.send(requestMessage);

      return new Promise((resolve, reject) => {
        adapter.receive(function handleResponse(unknownMessage) {
          if (!isSessionMessage(unknownMessage)) {
            return;
          }

          const res = unknownMessage.rpc;
          if (!isJSONRPCResponse(res) || res.id !== currentReqId) return;

          adapter.dispose(handleResponse);

          if (res.error) {
            reject(res.error);
          } else {
            resolve(res.result as CallResult<Map[T]>);
          }
        });
      });
    },
    register: (method, handler) => {
      adapter.receive(async function handleRequest(unknownMessage) {
        if (!isSessionMessage(unknownMessage)) {
          return;
        }

        if (!isCurrentSessionMessage(unknownMessage)) return;

        const req = unknownMessage.rpc;
        if (!isJSONRPCRequest(req) || req.method !== method) return;

        const res: JSONRPCResponse = await (async () => {
          asserts.asserts(req.id, `request id is required`);
          try {
            return createJSONRPCSuccessResponse(req.id, await handler(req.params as never));
          } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Internal Error';
            return createJSONRPCErrorResponse(req.id, JSONRPCErrorCode.InternalError, errorMessage, e);
          }
        })();

        adapter.send(createSessionMessage(res));
        handlers.add(handleRequest);
      });
    },
    destroy: () => {
      handlers.forEach((handler) => adapter.dispose(handler));
    },
  };
}

export function createSessionMessage(data: JSONRPCResponse | JSONRPCRequest): SessionMessage {
  return {
    [SESSION_MESSAGE_SYMBOL]: true,
    rpc: data,
  };
}

export function isSessionMessage(x: unknown): x is SessionMessage {
  if (!x || typeof x !== 'object') return false;
  return SESSION_MESSAGE_SYMBOL in x;
}
