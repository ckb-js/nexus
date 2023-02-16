import { EventEmitter } from 'events';
import { Call, createSessionMessenger, MessengerAdapter } from '../../src/messaging/session';

// an adapter based on EventEmitter
let adapter: MessengerAdapter;
let ee: EventEmitter;

beforeEach(() => {
  ee = new EventEmitter();

  adapter = {
    send: (message) => ee.emit('message', message),
    receive: (handler) => ee.addListener('message', handler),
    dispose: (handler) => ee.removeListener('message', handler),
  };
});

test('ping-pong example', async () => {
  type Map = { ping: Call<void, 'pong'> };

  const server = createSessionMessenger<Map>({ adapter });
  server.register('ping', () => 'pong');
  // there should be a receiver in server
  expect(ee.listeners('message')).toHaveLength(1);

  const client = createSessionMessenger<Map>({ adapter, sessionId: server.sessionId() });
  await expect(client.send('ping')).resolves.toBe('pong');

  // there should be no receiver in server after calling destroy()
  server.destroy();
  expect(ee.listeners('message')).toHaveLength(0);
});

it('should ignore when received unknown message in a server', async () => {
  const messenger = createSessionMessenger({ adapter });

  const emit = jest.spyOn(ee, 'emit');

  messenger.register('ping', () => 'pong');
  await messenger.send('ping');

  // messenger will emit a 'ping' request to itself
  // then it will receive the ping and emit a pong response
  // so the emit function will be called twice
  expect(emit.mock.calls).toHaveLength(2);

  // no await here because unknown message will never be resolved
  void messenger.send('unknown message');
  // wait for 100ms to make sure the unknown message is sent
  await new Promise((resolve) => setTimeout(resolve, 100));
  // messenger will post a 'unknown message' message to itself
  // then it will receive the unknown message and do nothing
  expect(emit.mock.calls).toHaveLength(3);
});

it('should should ignore when received message from different messages in a server', async () => {
  const server = createSessionMessenger({ adapter });
  server.register('ping', () => 'pong');

  const client = createSessionMessenger({ adapter, sessionId: 'another-session-id' });

  const emit = jest.spyOn(ee, 'emit');

  // no await here because unknown message will never be resolved
  void client.send('ping'); // emit time = 1
  expect(emit.mock.calls).toHaveLength(1);

  await new Promise((resolve) => setTimeout(resolve, 100));
  expect(emit.mock.calls).toHaveLength(1);
});

it('should throw an error in client when server handler throws an error', async () => {
  const server = createSessionMessenger({ adapter });
  server.register('ping', () => {
    throw new Error('server error');
  });

  const client = createSessionMessenger({ adapter, sessionId: server.sessionId() });
  await expect(client.send('ping')).rejects.not.toBeFalsy();
});

it('should works with more than one client', async () => {
  const server = createSessionMessenger({ adapter });
  server.register('ping', () => 'pong');

  const client1 = createSessionMessenger({ adapter, sessionId: server.sessionId() });
  const client2 = createSessionMessenger({ adapter, sessionId: server.sessionId() });

  await expect(client1.send('ping')).resolves.toBe('pong');
  await expect(client2.send('ping')).resolves.toBe('pong');
});
