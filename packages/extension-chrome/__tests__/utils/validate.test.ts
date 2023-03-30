import { validateHost } from '../../src/utils/validate';

describe('validateHost', () => {
  it('should be valid', () => {
    expect(() => validateHost('localhost:1222')).not.toThrowError();
    expect(() => validateHost('localhost')).not.toThrowError();
    expect(() => validateHost('192.168.1.1')).not.toThrowError();
    expect(() => validateHost('127.0.0.1')).not.toThrowError();
    expect(() => validateHost('192.168.1.1:1233')).not.toThrowError();
    expect(() => validateHost('nexus.com')).not.toThrowError();
    expect(() => validateHost('nexus.com:1234')).not.toThrowError();
    expect(() => validateHost('test.nexus.com:1234')).not.toThrowError();
  });

  it('should be invalid', () => {
    expect(() => validateHost('')).toThrowError();
    expect(() => validateHost(' ')).toThrowError();
    expect(() => validateHost('localhost:')).toThrowError();
    expect(() => validateHost('localhost: ')).toThrowError();
    expect(() => validateHost('localhost: 1234')).toThrowError();
    expect(() => validateHost('localhost:1234 ')).toThrowError();
    // IP could not larger than 255
    expect(() => validateHost('256.1.1.1')).toThrowError();
    expect(() => validateHost('256.1.1.1:1234')).toThrowError();
    // Port could not larger than 65535
    expect(() => validateHost('nexus.com:65536')).toThrowError();
    // URL is not a valid host
    expect(() => validateHost('https://nexus.com')).toThrowError();
  });
});
