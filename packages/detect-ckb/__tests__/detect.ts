import { detectCkb } from '../src';

describe('detectCkb', () => {
  it('should throw error if ckb object is not injected to global', async () => {
    await expect(await detectCkb({ detectScope: {} })).rejects.toThrowError();
  });

  it.todo('should return ckb object if ckb object is injected to global', async () => {});
  it.todo('should throw error if timeout', async () => {});
});
