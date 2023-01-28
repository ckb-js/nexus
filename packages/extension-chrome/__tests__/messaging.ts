import { EventEmitter } from 'events';
import { EventPosterAndListener, onMessage, sendMessage } from '../src/messaging/contentAndInjected';
import { createNexusMessage } from '../src/messaging/internal';

function mockPosterAndListener(): EventPosterAndListener {
  const ee = new EventEmitter();
  return {
    postMessage: (message) => ee.emit('message', { data: message }),
    addEventListener: (type, listener) => {
      ee.on(type, listener);
    },
  };
}

it('messaging#contentAndInjected ping pong', async () => {
  const _window = mockPosterAndListener();
  // listening message in content script

  const handler = jest.fn((received) => {
    if (received === 'ping') return 'pong';
  });

  onMessage('ping-pong', handler, { eventPosterAndListener: _window, getCurrentContext: () => 'content-script' });

  // sending message from website to content script
  const received = sendMessage('ping-pong', 'ping', 'content-script', {
    getCurrentContext: () => 'website',
    eventPosterAndListener: _window,
  });

  // a non-NexusMessage should not be received
  _window.postMessage('NoNexusMessage');

  // unknown target message should not be received
  _window.postMessage(
    createNexusMessage({
      data: 'pong',
      // @ts-ignore
      target: 'unknown',
      // @ts-ignore
      sender: 'unknown',
      type: 'ping-pong',
    }),
  );
  // an interference message should not be received
  _window.postMessage(
    createNexusMessage({
      data: 'Interference message',
      type: 'unknown',
      target: 'website',
      sender: 'content-script',
    }),
  );
  // a wrong id will not be received by sender
  _window.postMessage(
    createNexusMessage({
      type: 'ping-pong',
      target: 'website',
      sender: 'content-script',
      id: 'wrong-id',
      data: 'ping',
    }),
  );

  expect(await received).toBe('pong');
  expect(handler.mock.calls).toHaveLength(1);
});
