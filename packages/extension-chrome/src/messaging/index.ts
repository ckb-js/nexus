import { nanoid } from 'nanoid';

/**
 * webpage --NexusMessage--> contentScript
 * @param data
 */
export function sendToContent<Req, Res>(data: Req): Promise<Res> {
  const message = createNexusMessage(data, { target: TARGET_CONTENT });
  window.postMessage(message);

  return new Promise((resolve) => {
    window.addEventListener('message', (event) => {
      const eventData = event.data;
      if (!isNexusMessage(eventData)) return;

      const { id, target } = eventData;
      if (target !== TARGET_WEBPAGE) return;
      if (id !== message.id) return;

      resolve(eventData.data as Res);
    });
  });
}

/**
 * add an event listener in content script, return the response via `window.postMessage`
 * @param handle
 */
export function listenOnContent<Req, Res>(handle: (req: Req) => Promise<Res> | Res): void {
  window.addEventListener('message', async (event) => {
    const eventData = event.data;
    if (!isNexusMessage(eventData)) return;
    if (eventData.target !== TARGET_CONTENT) return;

    const handled = await handle(eventData.data as Req);
    const message = createNexusMessage(handled, { target: TARGET_WEBPAGE, id: eventData.id });
    window.postMessage(message);
  });
}

export interface NexusMessage<T> {
  id: string;
  type: string;
  target: string;
  data: T;
}

function isNexusMessage<T>(x: unknown): x is NexusMessage<T> {
  if (typeof x !== 'object') return false;
  if (x == null) return false;
  return 'type' in x && x.type === NEXUS_MESSAGE && 'id' in x && 'data' in x;
}

export const NEXUS_MESSAGE = '__NEXUS_MESSAGE__' as const;
export const TARGET_WEBPAGE = '__NEXUS_TARGET_WEBPAGE__' as const;
export const TARGET_CONTENT = '__NEXUS_TARGET_CONTENT__' as const;

function createNexusMessage<T>(data: T, options: { target: string; id?: string }): NexusMessage<T> {
  return {
    type: NEXUS_MESSAGE,
    id: options.id ?? nanoid(),
    target: options.target,
    data,
  };
}
