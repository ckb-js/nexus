import { Script, Transaction } from '@ckb-lumos/lumos';
import { createBackend } from '../../../../src/services/ownership/backend';
import fetchMock from 'jest-fetch-mock';
import { ScriptConfig, predefined } from '@ckb-lumos/config-manager/lib';
import { toQueryParam } from '../../../../src/services/ownership/backend/backendUtils';
import { createTransactionFromSkeleton, TransactionSkeleton } from '@ckb-lumos/helpers';

describe('Query Param', () => {
  beforeEach(() => {
    fetchMock.disableMocks();
  });
  it('should get correct query params', async () => {
    const lock: Script = {
      codeHash: '0x1234',
      hashType: 'type',
      args: '0x5678',
    };
    const queryParam = toQueryParam({ lock });

    expect(queryParam).toEqual([
      {
        script: {
          code_hash: lock.codeHash,
          hash_type: lock.hashType,
          args: lock.args,
        },
        script_type: 'lock',
        script_search_mode: 'exact',
      },
      'asc',
      '0x64',
      null,
    ]);
  });
});

// TODO: replace it with an internal server
const SNAPSHOT_CKB_RPC = 'https://testnet.ckb.dev';

describe('load secp256k1 cellDeps', () => {
  beforeEach(() => {
    fetchMock.disableMocks();
  });
  it('should backendUtils.loadSecp256k1ScriptDep return expected config', async () => {
    const backend = createBackend({ nodeUrl: SNAPSHOT_CKB_RPC });

    const res = await backend.getSecp256k1Blake160ScriptConfig({ networkId: 'someId' });

    expect(res).toMatchSnapshot();
    const predefinedConfig = predefined.AGGRON4.SCRIPTS.SECP256K1_BLAKE160;
    expect(res).toEqual({ ...predefinedConfig, SHORT_ID: undefined } as ScriptConfig);
    // this test case will actually fetch on-chain data, so we increase the timeout
  }, 5000);
});

describe('getBlockchainInfo', () => {
  beforeEach(() => {
    fetchMock.disableMocks();
  });

  it('should backend fetch expected blockchain info', async () => {
    const backend = createBackend({ nodeUrl: SNAPSHOT_CKB_RPC });
    const res = await backend.getBlockchainInfo();

    expect(res.chain).toBe('ckb_testnet');
  }, 5000);
});

describe('sendTransaction', () => {
  beforeAll(() => {
    fetchMock.enableMocks();
  });
  it('should send transaction', async () => {
    const txHash = '';
    fetchMock.mockResponse(
      JSON.stringify({
        jsonrpc: '2.0',
        result: txHash,
        id: 0,
      }),
    );
    const tx = createTransactionFromSkeleton(TransactionSkeleton());
    const backend = createBackend({ nodeUrl: '' });
    const result = await backend.sendTransaction(tx, 'passthrough');
    expect(result).toBe(txHash);
    const params = JSON.parse(fetchMock.mock.calls?.[0][1]?.body as any).params;
    expect(params[1]).toBe('passthrough');
  });
  it('default second parameter', async () => {
    fetchMock.mockResponse(
      JSON.stringify({
        jsonrpc: '2.0',
        result: '',
        id: 0,
      }),
    );
    const tx = createTransactionFromSkeleton(TransactionSkeleton());
    const backend = createBackend({ nodeUrl: '' });
    await backend.sendTransaction(tx);
    const params = JSON.parse(fetchMock.mock.calls?.[0][1]?.body as any).params;
    expect(params[1]).toBe('passthrough');
  });
});

describe('hasHistory', () => {
  beforeAll(() => {
    fetchMock.enableMocks();
  });
  afterEach(() => {
    fetchMock.resetMocks();
  });
  it('should get history by lock list', async () => {
    fetchMock.mockResponse(mockFetchTransactionsResp);
    const backend = createBackend({ nodeUrl: '' });
    const results = await backend.hasHistories({
      locks: [createLock(0), createLock(1), createLock(2)],
    });
    expect(results).toEqual([false, true, false]);
  });
});

describe('resolveTx', () => {
  beforeAll(() => {
    fetchMock.enableMocks();
  });
  afterEach(() => {
    fetchMock.resetMocks();
  });
  it('should resolve tx to txSkeleton', async () => {
    fetchMock.mockResponse(getMockFetchLiveCellResp(createLock(1)));
    const backend = createBackend({ nodeUrl: '' });
    const tx = getMockTx();
    const results = await backend.resolveTx(tx);
    expect(results.get('inputs').toArray()).toHaveLength(1);
    expect(results.get('inputs').toArray()[0].cellOutput.lock).toEqual(createLock(1));
  });
});

describe('getLiveCells', () => {
  beforeAll(() => {
    fetchMock.enableMocks();
  });
  afterEach(() => {
    fetchMock.resetMocks();
  });
  it('should get no live cells if no lock is provided', async () => {
    const backend = createBackend({ nodeUrl: '' });
    const { objects, cursor } = await backend.getLiveCellsByLocks({
      locks: [],
      cursor: '',
    });
    expect(objects).toHaveLength(0);
    expect(cursor).toBe('');
  });
  it('should get no live cells if rpc returns nothing', async () => {
    fetchMock.mockResponse(JSON.stringify([createMockResponseOfGetCells(createLock(1), 0, 0)]));
    const backend = createBackend({ nodeUrl: '' });
    const { objects, cursor } = await backend.getLiveCellsByLocks({
      locks: [createLock(1)],
      cursor: '',
    });
    expect(objects).toHaveLength(0);
    expect(cursor).toBe('');
  });
  it('should get some live cells if rpc returns cells', async () => {
    fetchMock.mockResponse(JSON.stringify([createMockResponseOfGetCells(createLock(1), 0, 1)]));
    const backend = createBackend({ nodeUrl: '' });
    const { objects, cursor } = await backend.getLiveCellsByLocks({
      locks: [createLock(1)],
      cursor: '',
    });
    expect(objects).toHaveLength(1);
    expect(objects[0].outPoint?.txHash).toEqual('0x01:0x00');
    expect(cursor).toBe('0x01:0x00');
  });

  it('should get limited live cells if rpc returns too many cells', async () => {
    const { scenario, scenarioAnswer, locks } = getSimpleScenario();
    fetchMock.mockResponse(getMockFetchLiveCellsResp(scenario));
    const backend = createBackend({ nodeUrl: '' });
    const { objects, cursor } = await backend.getLiveCellsByLocks({
      locks,
      cursor: '',
    });
    expect(objects).toHaveLength(20);
    expect(objects[0].outPoint?.txHash).toEqual('0x00:0x00');
    expect(objects[objects.length - 1].outPoint?.txHash).toEqual(scenarioAnswer);
    expect(cursor).toBe(scenarioAnswer); // 19
  });

  it('should get limited live cells in complecated scenario situation', async () => {
    const { scenario, scenarioAnswer, locks } = getScenario();
    fetchMock.mockResponse(getMockFetchLiveCellsResp(scenario));
    const backend = createBackend({ nodeUrl: '' });
    const { objects, cursor } = await backend.getLiveCellsByLocks({
      locks,
      cursor: '',
    });
    expect(objects).toHaveLength(20);
    expect(objects[0].outPoint?.txHash).toEqual('0x00:0x00');
    expect(objects[objects.length - 1].outPoint?.txHash).toEqual(scenarioAnswer);
    expect(cursor).toBe(scenarioAnswer);
  });

  it('should get limited live cells with cursor on last non-empty lock', async () => {
    const { scenario, scenarioAnswer, locks } = getEmptyEndScenario();
    fetchMock.mockResponse(getMockFetchLiveCellsResp(scenario));
    const backend = createBackend({ nodeUrl: '' });
    const { objects, cursor } = await backend.getLiveCellsByLocks({
      locks,
      cursor: '',
    });
    expect(objects).toHaveLength(18);
    expect(objects[0].outPoint?.txHash).toEqual('0x00:0x00');
    expect(objects[objects.length - 1].outPoint?.txHash).toEqual(scenarioAnswer);
    expect(cursor).toBe(scenarioAnswer);
  });
});

function createLock(i: number): Script {
  return {
    codeHash: '0x',
    hashType: 'type',
    args: `0x${i.toString(16).padStart(2, '0')}`,
  };
}

/**
 *
 * @param lock
 * @param startIndex
 * @param endIndex
 * @param order
 * @returns cursor is at `lock.args:cellIndex`
 */
function createMockResponseOfGetCells(
  lock: Script,
  startIndex: number,
  endIndex: number,
  order: 'asc' | 'desc' = 'asc',
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const objects: any = [];
  for (let i = startIndex; i < endIndex; i++) {
    const hexIndex = i.toString(16).padStart(2, '0');
    const hexIndexString = `0x${hexIndex}`;
    objects.push({
      block_number: hexIndexString,
      out_point: {
        index: '0x0',
        tx_hash: lock.args + ':' + hexIndexString,
      },
      output: {
        capacity: '0x1234',
        lock,
        type: null,
      },
      output_data: '0x',
      tx_index: '0x0',
    });
  }
  if (order === 'desc') {
    objects.reverse();
  }
  return {
    jsonrpc: '2.0',
    result: {
      last_cursor: endIndex > startIndex ? lock.args + ':' + objects[objects.length - 1].block_number : '',
      objects,
    },
    id: 0,
  };
}

const getMockTx = () => {
  const tx: Transaction = {
    version: '0x0',
    cellDeps: [],
    headerDeps: [],
    inputs: [
      {
        previousOutput: {
          txHash: '0x',
          index: '0x0',
        },
        since: '0x0',
      },
    ],
    outputs: [],
    witnesses: [],
    outputsData: [],
  };
  return tx;
};

type LockIndex = number;
type FetchedCellCount = number;
type Scenario = Record<LockIndex, FetchedCellCount>;

// key: lock index
// value: lock index has x live cells
function getScenario(): { scenario: Scenario; scenarioAnswer: string; locks: Script[] } {
  const scenario: Scenario = {
    0: 3,
    1: 1,
    19: 1,
    20: 3,
    21: 4,
    31: 4,
    32: 10,
    41: 2,
  };
  const locks = new Array(42).fill(null).map((_, i) => createLock(i));
  // according to the scenario, finding 20 live cells, the cursor should be at 32th(0x20) lock, 4th(0x03) cell
  return { scenario, scenarioAnswer: '0x20:0x03', locks };
}

function getEmptyEndScenario(): { scenario: Scenario; scenarioAnswer: string; locks: Script[] } {
  const scenario: Scenario = {
    0: 9,
    1: 9,
    2: 0,
    3: 0,
  };
  const locks = new Array(4).fill(null).map((_, i) => createLock(i));
  return { scenario, scenarioAnswer: '0x01:0x08', locks };
}

function getSimpleScenario(): { scenario: Scenario; scenarioAnswer: string; locks: Script[] } {
  const scenario: Scenario = {
    0: 22,
  };
  const locks = [createLock(0)];
  return { scenario, scenarioAnswer: '0x00:0x13', locks };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getMockFetchLiveCellsResp = (scenario: any) => (req: Request) => {
  const reqBody = JSON.parse(req.body!.toString());
  if (Array.isArray(reqBody)) {
    const batchReqLen = reqBody.length;
    return Promise.resolve(
      JSON.stringify(
        new Array(batchReqLen).fill(null).map((_, i) => {
          const currentReqBody = reqBody[i];
          const options = currentReqBody.params[0];
          const lock = {
            codeHash: options.script.code_hash,
            hashType: options.script.hash_type,
            args: options.script.args,
          };
          const liveCellCount = scenario[Number(lock.args)] || 0;
          return createMockResponseOfGetCells(lock, 0, liveCellCount);
        }),
      ),
    );
  } else {
    const cursor = reqBody.params[3];
    const cursorNumber = Number(cursor.split(':')[1]);
    const limit = Number(reqBody.params[2]);
    const order = reqBody.params[1];
    const lock = {
      codeHash: reqBody.params[0].script.code_hash,
      hashType: reqBody.params[0].script.hash_type,
      args: reqBody.params[0].script.args,
    };

    return Promise.resolve(
      JSON.stringify(createMockResponseOfGetCells(lock, cursorNumber - limit, cursorNumber, order)),
    );
  }
};

const mockFetchTransactionsResp = (req: Request) => {
  const reqBody = JSON.parse(req.body!.toString());
  const batchReqLen = reqBody.length;
  return Promise.resolve(
    JSON.stringify(
      new Array(batchReqLen).fill(null).map((_, i) => {
        return {
          result: {
            last_cursor: '',
            objects: i % 2 === 0 ? [] : [{}],
          },
        };
      }),
    ),
  );
};

const getMockFetchLiveCellResp = (lock: Script) => () => {
  return Promise.resolve(
    JSON.stringify({
      jsonrpc: '2.0',
      result: {
        cell: {
          data: {
            content: '0x',
            hash: '0x',
          },
          output: {
            capacity: '0x1234',
            lock: {
              code_hash: lock.codeHash,
              hash_type: lock.hashType,
              args: lock.args,
            },
            type: null,
          },
        },
        status: 'live',
      },
      id: 1,
    }),
  );
};
