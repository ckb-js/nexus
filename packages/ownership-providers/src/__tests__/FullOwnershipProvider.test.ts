/* eslint-disable @typescript-eslint/no-explicit-any */
import { BI } from '@ckb-lumos/bi';
import { TransactionSkeleton } from '@ckb-lumos/helpers';
import { Cell, Script } from '@nexus-wallet/protocol';
import { FullOwnershipProvider } from '..';

describe('class FullOwnershipProvider', () => {
  it('Should get live cells invoke `InjectedCkb#wallet_fullOwnership_getLiveCells`', async () => {
    // TODO:
    expect(1).toBe(1);
  });

  describe('#injectCapacity', () => {
    const emptyTxSkeleton = TransactionSkeleton();
    function createFakeCellWithCapacity(capacity: number) {
      return {
        cellOutput: {
          capacity: BI.from(capacity).toHexString(),
        },
      } as Cell;
    }

    const fakeOffChainLock: Script = {
      codeHash: '0x79f90bb5e892d80dd213439eeab551120eb417678824f282b4ffb5f21bad2e1e',
      hashType: 'type',
      args: '0x11223344',
    };
    function initProviderWithCells(cells: Cell[], offChainLock = fakeOffChainLock) {
      const provider = new FullOwnershipProvider({} as any);
      provider.collector = jest.fn().mockImplementation(async function* mock() {
        for (const cell of cells) {
          yield cell;
        }
      });
      provider.getOffChainLocks = jest.fn().mockResolvedValue([offChainLock]);
      return provider;
    }

    it('Should throw error when all cells capacity is not enough', async () => {
      const provider = initProviderWithCells([createFakeCellWithCapacity(100 * 1e8), createFakeCellWithCapacity(200)]);

      await expect(provider.injectCapacity(emptyTxSkeleton, { amount: 400 * 1e8 })).rejects.toThrowError(
        /Not enough capacity/,
      );
    });

    it('Should throw error when capacity is too small', async () => {
      const provider = initProviderWithCells([
        createFakeCellWithCapacity(100 * 1e8),
        createFakeCellWithCapacity(200 * 1e8),
      ]);
      await expect(provider.injectCapacity(emptyTxSkeleton, { amount: 1 })).rejects.toThrowError(
        /The amount is too small to pay the minimal change cell capacity/,
      );

      await expect(provider.injectCapacity(emptyTxSkeleton, { amount: 100 * 1e8 })).resolves.toBeTruthy();
    });

    it('Should pick one cell when capacity is enough', async () => {
      const provider = initProviderWithCells([
        createFakeCellWithCapacity(500 * 1e8),
        createFakeCellWithCapacity(200 * 1e8),
      ]);
      const skeleton = await provider.injectCapacity(emptyTxSkeleton, { amount: 144 * 1e8 });
      expect(skeleton.get('inputs').size).toBe(1);
      expect(skeleton.get('inputs').get(0)?.cellOutput.capacity).toBe(BI.from(500 * 1e8).toHexString());
      expect(skeleton.get('outputs').size).toBe(1);
      expect(skeleton.get('outputs').get(0)?.cellOutput.capacity).toBe(BI.from(500 * 1e8 - 144 * 1e8).toHexString());
    });

    it('Should pick multiple cells when single cell capacity is not enough', async () => {
      const provider = initProviderWithCells([
        createFakeCellWithCapacity(100 * 1e8),
        createFakeCellWithCapacity(100 * 1e8),
        createFakeCellWithCapacity(300 * 1e8),
      ]);
      const skeleton = await provider.injectCapacity(emptyTxSkeleton, { amount: 250 * 1e8 });
      expect(skeleton.get('inputs').size).toBe(3);
      expect(skeleton.get('outputs').size).toBe(1);
      expect(skeleton.get('outputs').get(0)?.cellOutput.capacity).toBe(BI.from(500 * 1e8 - 250 * 1e8).toHexString());
    });
  });

  describe('#payFee', () => {
    it('Automatically inject capacity when `autoInject` is true', async () => {
      expect(1).toBe(1);
    });

    it('Should throw error when autoInject is true but cell is not available', async () => {
      expect(1).toBe(1);
    });

    it('Should inject capacity when autoInject is true and cell is available', async () => {
      expect(1).toBe(1);
    });

    it('Should use the provided payer lock for paying fee', () => {
      expect(1).toBe(1);
    });

    it('Should throw error when payer lock is not provided', () => {});

    it('Should throw error when payer lock is not owned', () => {
      //
    });
  });

  it('#getLiveCells', async () => {
    const fakeCKB = { request: jest.fn().mockResolvedValue([]) };

    const provider = new FullOwnershipProvider({ ckb: fakeCKB as any });
    const params: any = { cursor: '0x', change: 'external' };
    expect(await provider.getLiveCells(params)).toEqual([]);
    expect(fakeCKB.request).toBeCalledWith({
      method: 'wallet_fullOwnership_getLiveCells',
      params,
    });
  });

  it('#collector', async () => {
    const provider = new FullOwnershipProvider({} as any);
    const cellLists = [
      'cell1',
      'cell2',
      'cell3',
      'cell4',
      'cell5',
      'cell6',
      'cell7',
      'cell8',
      'cell9',
      'cell10',
      'cell11',
      'cell12',
    ];

    const getLiveCells = jest.fn().mockImplementation(({ cursor }: any) => {
      cursor = cursor || 0;
      return { objects: cellLists.slice(cursor, cursor + 4), cursor: cursor + 4 };
    });

    provider.getLiveCells = getLiveCells;

    let index = 0;
    for await (const cell of provider.collector()) {
      expect(cell).toEqual(`cell${index + 1}`);
      index++;
    }

    expect(getLiveCells).toBeCalledTimes(4);
    expect(getLiveCells).nthCalledWith(1, { cursor: '' });
    expect(getLiveCells).nthCalledWith(2, { cursor: 4 });
    expect(getLiveCells).nthCalledWith(3, { cursor: 8 });
    expect(getLiveCells).nthCalledWith(4, { cursor: 12 });
  });
});
