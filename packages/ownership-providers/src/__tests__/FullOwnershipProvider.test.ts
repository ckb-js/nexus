/* eslint-disable @typescript-eslint/no-explicit-any */
import { BI } from '@ckb-lumos/bi';
import { TransactionSkeleton, TransactionSkeletonType } from '@ckb-lumos/helpers';
import { common } from '@ckb-lumos/common-scripts';
import { Cell, Script } from '@nexus-wallet/protocol';
import { FullOwnershipProvider } from '..';

function getExpectedFee(txSkeleton: TransactionSkeletonType, feeRate = BI.from(1000)): BI {
  return BI.from(
    common.__tests__.calculateFeeCompatible(common.__tests__.getTransactionSize(txSkeleton), BI.from(feeRate)),
  );
}

function getTxSkeletonFee(txSkeleton: TransactionSkeletonType): BI {
  const inputsTotal = txSkeleton.get('inputs').reduce((acc, cur) => acc.add(cur.cellOutput.capacity), BI.from(0));
  const outputsTotal = txSkeleton.get('outputs').reduce((acc, cur) => acc.add(cur.cellOutput.capacity), BI.from(0));

  return inputsTotal.sub(outputsTotal);
}

const offChainLock1: Script = {
  codeHash: '0x79f90bb5e892d80dd213439eeab551120eb417678824f282b4ffb5f21bad2e1e',
  hashType: 'type',
  args: '0x11223344',
};

function createOnchainLock(args: string): Script {
  return {
    codeHash: '0x79f90bb5e892d80dd213439eeab551120eb417678824f282b4ffb5f21bad2e1e',
    hashType: 'type',
    args,
  };
}

const onChainLocks1: Script = createOnchainLock('0x441509af');

const onChainLocks2: Script = createOnchainLock('0x25061223');
const onChainLocks3: Script = createOnchainLock('0x25061224');

function createFakeCellWithCapacity(capacity: number, lock = offChainLock1) {
  return {
    cellOutput: {
      capacity: BI.from(capacity).toHexString(),
      lock: lock,
    },
    outPoint: {
      index: '0x1',
      txHash: '0xd2e09c658206d4d0d71c066c46eddaa568d49c09f76b7396ae803dad25850174',
    },
    data: '0x',
  } as Cell;
}

const receiverLock: Script = {
  codeHash: '0x79f90bb5e892d80dd213439eeab551120eb417678824f282b4ffb5f21bad2e1e',
  hashType: 'type',
  args: '0x55667788',
};

describe('class FullOwnershipProvider', () => {
  it('Should get live cells invoke `InjectedCkb#wallet_fullOwnership_getLiveCells`', async () => {
    // TODO:
    expect(1).toBe(1);
  });

  describe('#injectCapacity', () => {
    const emptyTxSkeleton = TransactionSkeleton();

    function initProviderWithCells(cells: Cell[], offChainLock = offChainLock1) {
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
        /No cell sufficient to inject/,
      );
    });

    it.skip('Should throw error when capacity is too small', async () => {
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
    function buildProvider(cells: Cell[], offChainLock = offChainLock1) {
      const provider = new FullOwnershipProvider({} as any);
      provider.getOffChainLocks = jest.fn().mockResolvedValue([offChainLock]);
      const getLiveCells = jest.fn().mockImplementation(({ cursor }: any) => {
        cursor = cursor || 0;
        return { objects: cells.slice(cursor, cursor + 4), cursor: cursor + 4 };
      });
      provider.getLiveCells = getLiveCells;
      return provider;
    }
    function createFakeSkeleton() {
      const txSkeleton = TransactionSkeleton();
      return txSkeleton
        .update('inputs', (inputs) => inputs.push(createFakeCellWithCapacity(100 * 1e8)))
        .update('outputs', (outputs) => outputs.push(createFakeCellWithCapacity(100 * 1e8, receiverLock)))
        .update('cellDeps', (cellDeps) =>
          cellDeps.push({
            outPoint: {
              txHash: '0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37',
              index: '0x0',
            },
            depType: 'code',
          }),
        );
    }

    it('Automatically inject capacity when `autoInject` is true', async () => {
      const provider = buildProvider([createFakeCellWithCapacity(100 * 1e8), createFakeCellWithCapacity(200 * 1e8)]);
      const txSkeleton = createFakeSkeleton();
      const withFee = await provider.payFee({ txSkeleton });

      expect(withFee.get('inputs').size).toBe(2);
      expect(withFee.get('outputs').size).toBe(2);
      expect(getTxSkeletonFee(withFee)).toEqual(getExpectedFee(withFee));
    });

    it('Should throw error when autoInject is true but cell is not available', async () => {
      const provider = buildProvider([]);
      const txSkeleton = createFakeSkeleton();

      await expect(provider.payFee({ txSkeleton })).rejects.toThrowError('No cell sufficient to inject');
    });

    it('Should use the provided payers lock for paying fee', async () => {
      const provider = buildProvider([
        createFakeCellWithCapacity(100 * 1e8, onChainLocks1),
        createFakeCellWithCapacity(200 * 1e8, onChainLocks2),
      ]);
      const txSkeleton = createFakeSkeleton();
      const withFee = await provider.payFee({ txSkeleton, options: { payers: [onChainLocks2] } });
      expect(withFee.inputs.size).toBe(2);
      expect(withFee.outputs.size).toBe(2);
      const payerCell = withFee.inputs.get(1);
      const changeCell = withFee.outputs.get(1);
      expect(payerCell?.cellOutput.lock).toEqual(onChainLocks2);
      expect(changeCell?.cellOutput.lock).toEqual(offChainLock1);

      expect(BI.from(payerCell?.cellOutput.capacity).sub(changeCell?.cellOutput.capacity!).toString()).toBe(
        getExpectedFee(withFee).toString(),
      );
    });

    it('Should throw error when payer lock is not provided and auto inject is false', async () => {
      const provider = buildProvider([
        createFakeCellWithCapacity(100 * 1e8, onChainLocks1),
        createFakeCellWithCapacity(200 * 1e8, onChainLocks2),
      ]);
      const txSkeleton = createFakeSkeleton();
      await expect(
        provider.payFee({ txSkeleton, options: { autoInject: false, payers: [] } }) as any,
      ).rejects.toThrowError('no payer is provided, but autoInject is `false`');
    });

    it('Should throw error when payer lock is not available and auto inject is false', async () => {
      const provider = buildProvider([
        createFakeCellWithCapacity(100 * 1e8, onChainLocks1),
        createFakeCellWithCapacity(200 * 1e8, onChainLocks2),
      ]);
      const txSkeleton = createFakeSkeleton();
      await expect(
        provider.payFee({ txSkeleton, options: { autoInject: false, payers: [onChainLocks3] } }) as any,
      ).rejects.toThrowError('No payer available to pay fee');
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

  describe('#collector', () => {
    function buildProvider(cells: any[], pageSize = 4) {
      const provider = new FullOwnershipProvider({} as any);
      provider.getLiveCells = jest.fn().mockImplementation(({ cursor = 0 }: any) => {
        cursor = cursor || 0;
        return {
          objects: cells.slice(cursor, cursor + pageSize),
          cursor: cursor + pageSize,
        };
      });

      return provider;
    }

    it('#should return paginated cell', async () => {
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

      const provider = buildProvider(cellLists);
      const getLiveCells = provider.getLiveCells as jest.Mock;

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

    it('Should return specific lock cells', async () => {
      const provider = buildProvider([
        {
          cellOutput: {
            lock: onChainLocks1,
          },
        },
        {
          cellOutput: {
            lock: onChainLocks1,
          },
        },
        {
          cellOutput: {
            lock: onChainLocks2,
          },
        },
      ]);

      let count = 0;

      for await (const cell of provider.collector({ lock: onChainLocks1 })) {
        count++;
        expect(cell.cellOutput.lock).toEqual(onChainLocks1);
      }

      expect(count).toBe(2);
    });
  });
});
