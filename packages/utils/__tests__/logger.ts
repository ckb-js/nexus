import { Logger, createLogger, setLogger, setLogLevel } from '../src/logger';

type MockedLog = jest.MockedFunction<(message?: string, ...args: unknown[]) => void>;

let trace: MockedLog;
let debug: MockedLog;
let info: MockedLog;
let warn: MockedLog;
let error: MockedLog;

let logger: Logger;

beforeEach(() => {
  trace = jest.fn();
  debug = jest.fn();
  info = jest.fn();
  warn = jest.fn();
  error = jest.fn();

  setLogger({ trace, debug, info, warn, error });

  logger = createLogger();
});

describe('logger', () => {
  it('should logged', () => {
    logger.info('hello %s', 'world');
    expect(info.mock.lastCall?.[0]).toMatch(/hello world/);
  });

  it('should logged with module', () => {
    const module = 'my-module';
    logger = createLogger(module);
    logger.info('message');
    expect(info.mock.lastCall?.[0]).toMatch(module);
  });

  it('should logged if loglevel <= target level', () => {
    logger.debug('debug message');
    expect(debug).not.toBeCalled();

    setLogLevel('trace');
    logger.debug('debug message');
    expect(debug).toBeCalled();
  });

  it('should not logged if loglevel > target level', () => {
    setLogLevel('error');
    logger.info('info message');
    expect(info).not.toBeCalled();
  });

  it('should log nothing if loglevel is too large', () => {
    setLogLevel(Infinity);
    logger.error('error message');
    expect(error).not.toBeCalled();
  });
});
