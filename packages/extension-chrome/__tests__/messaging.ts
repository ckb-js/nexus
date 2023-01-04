import { EventEmitter } from 'events';
import { listenOnContent, NEXUS_MESSAGE, sendToContent } from '../src/messaging';

global.window = global.window || {};

const ee = new EventEmitter();
Object.assign(window, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postMessage(data: any) {
    ee.emit('message', { data });
  },
  addEventListener(eventName: string, listener: (event: MessageEvent) => void) {
    ee.addListener(eventName, listener);
  },
});

it('messaging#simulate RPC', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listenOnContent((payload: { method: string; params: any }) => {
    if (payload.method === 'ping') return 'pong';
    if (payload.method === 'sum') return payload.params[0] + payload.params[1];
  });

  const pingPong = await sendToContent({ method: 'ping' });
  expect(pingPong).toBe('pong');

  const sum = await sendToContent({ method: 'sum', params: [1, 1] });
  expect(sum).toBe(1 + 1);

  window.postMessage(null);
  window.postMessage(undefined);
  window.postMessage({ type: 'NOT_NEXUS_MESSAGE' });
  window.postMessage({ type: NEXUS_MESSAGE, id: '1', data: {}, sender: 'UNIDENTIFIED' });
});
