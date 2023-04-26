import { asyncSleep } from '@nexus-wallet/utils';
import { detectCkb } from '../src';

async function mockInjectCkb(delayTime = 0) {
  await asyncSleep(delayTime);
  if (typeof globalThis !== 'undefined') {
    Object.assign(globalThis, { ckb: {} });
  }
}

describe('detectCkb', () => {
  beforeEach(async () => {
    Object.assign(globalThis, { ckb: undefined });
  });

  it('should throw error if ckb object is not injected to global', async () => {
    await expect(detectCkb({})).rejects.toThrowError();
  });

  it('should return ckb object if ckb object is injected to global', async () => {
    const delayTime = 400;
    void mockInjectCkb(delayTime);
    await expect(detectCkb({ timeout: 500 })).resolves.not.toThrowError();
  });

  it('should throw error if timeout', async () => {
    const delayTime = 600;
    void mockInjectCkb(delayTime);
    await expect(detectCkb({ timeout: 500 })).rejects.toThrowError();
  });
});
