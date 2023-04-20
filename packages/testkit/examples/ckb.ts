import { mockInjectedCkb, randomBytes, randomScript } from '../src';
import { RpcMethods } from '@nexus-wallet/types';
import { generateCells } from '../src/generate';

const ckb = mockInjectedCkb<RpcMethods>()
  .addMethod('wallet_fullOwnership_getLiveCells', async () => ({
    cursor: randomBytes(32),
    objects: generateCells({ totalCapacity: BigInt(12345) * BigInt(10) ** BigInt(8), count: 11 }),
  }))
  .addMethod('wallet_fullOwnership_getOffChainLocks', async () => Array.from({ length: 20 }).map(randomScript));

async function getLiveCells() {
  const res = await ckb.request({ method: 'wallet_fullOwnership_getLiveCells' });
  const cells = res.objects.map((cell) => cell.cellOutput.capacity);
  console.log('getLiveCells with total 12345 CKB', cells);
}

void getLiveCells();
