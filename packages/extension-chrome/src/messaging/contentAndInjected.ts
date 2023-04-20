// communication between content script and injected script
// will keep a long-lived connection via window.postMessage and window.addEventListener('message')
// usually we will use this connection to relay message between injected script and background script
// we don't need to close this connection manually since it will be closed when the page is closed

import type { Context, GetCurrentContext } from './internal';
import { createNexusMessage, getCurrentContext, isNexusMessage, typeOfNexusMessage } from './internal';

export interface EventPosterAndListener {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postMessage(message: any): void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addEventListener(type: string, listener: (ev: MsgEvent) => any): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface MsgEvent<T = any> {
  data: T;
}

/**
 * <pre>
 * webpage <-> contentScript
 * </pre>
 * @param messageType
 * @param data
 * @param destination
 * @param options
 */
export function sendMessage<Req, Res>(
  messageType: string,
  data: Req,
  destination: Context,
  options?: {
    eventPosterAndListener?: EventPosterAndListener;
    getCurrentContext?: GetCurrentContext;
  },
): PromiseLike<Res> {
  /* istanbul ignore next */
  const currentContext = options?.getCurrentContext?.() || getCurrentContext();
  const sentMessage = createNexusMessage({ type: messageType, data, sender: currentContext, target: destination });
  /* istanbul ignore next */
  const posterAndListener = options?.eventPosterAndListener || window;

  posterAndListener.postMessage(sentMessage);

  return new Promise((resolve) => {
    posterAndListener.addEventListener('message', (event) => {
      const receivedMessage: unknown = event.data;
      if (!isNexusMessage(receivedMessage)) return;

      if (receivedMessage.target !== currentContext) return;
      if (receivedMessage.id !== sentMessage.id) return;

      resolve(receivedMessage.data as Res);
    });
  });
}

/**
 * add an event listener in content script, return the response via `window.postMessage`
 */
export function onMessage<Req, Res>(
  messageType: string,
  handle: (req: Req) => PromiseLike<Res> | Res,
  options?: {
    eventPosterAndListener?: EventPosterAndListener;
    getCurrentContext: GetCurrentContext;
  },
): void {
  /* istanbul ignore next */
  const currentContext = options?.getCurrentContext?.() || getCurrentContext();
  /* istanbul ignore next */
  const posterAndListener = options?.eventPosterAndListener || window;

  posterAndListener.addEventListener('message', async (event) => {
    const receivedMessage: unknown = event.data;
    if (!isNexusMessage(receivedMessage)) return;

    const receivedMessageType = typeOfNexusMessage(receivedMessage);
    if (receivedMessageType !== messageType) return;
    if (receivedMessage.target !== currentContext) return;

    const handled = await handle(receivedMessage.data as Req);
    // send the handled message back to the sender
    const handledMessage = createNexusMessage({
      data: handled,
      type: receivedMessageType,
      sender: currentContext,
      target: receivedMessage.sender,
      id: receivedMessage.id,
    });
    posterAndListener.postMessage(handledMessage);
  });
}
