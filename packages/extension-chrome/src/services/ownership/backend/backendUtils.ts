import { Cell, HexNumber, HexString, OutPoint, Script, Transaction, utils } from '@ckb-lumos/lumos';
import { asserts } from '@nexus-wallet/utils';
import { ScriptConfig } from '@ckb-lumos/config-manager';
import { JSONRPCRequest, JSONRPCResponse } from 'json-rpc-2.0';
import { RPC as RpcType } from '@ckb-lumos/rpc/lib/types/rpc';
import { NexusCommonErrors } from '../../../errors';
import pTimeout from './thirdpartyLib/p-timeout';
import pRetry from './thirdpartyLib/p-retry';
import snakeCase from 'lodash.snakecase';
type Order = 'asc' | 'desc';
type Limit = HexNumber;
type CursorType = HexString | null;
type RpcQueryType = [
  {
    script: RpcType.Script;
    script_type: 'lock' | 'type';
    script_search_mode: 'exact' | 'prefix';
  },
  Order,
  Limit,
  CursorType?,
];

const toQueryParam = (payload: {
  lock: Script;
  cursor?: CursorType;
  order?: Order;
  limit?: HexNumber;
}): RpcQueryType => [
  {
    script: {
      code_hash: payload.lock.codeHash,
      hash_type: payload.lock.hashType,
      args: payload.lock.args,
    },
    script_type: 'lock',
    script_search_mode: 'exact',
  },
  payload.order ?? 'asc',
  payload.limit ?? '0x64',
  payload.cursor || null,
];

const toScript = (rpcScript: RpcType.Script): Script => ({
  codeHash: rpcScript.code_hash,
  hashType: rpcScript.hash_type,
  args: rpcScript.args,
});

const toOutPoint = (rpcOutPoint: RpcType.OutPoint): OutPoint => ({
  txHash: rpcOutPoint.tx_hash,
  index: rpcOutPoint.index,
});

const toCell = (rpcIndexerCell: RpcType.IndexerCell): Cell => ({
  cellOutput: {
    capacity: rpcIndexerCell.output.capacity,
    lock: toScript(rpcIndexerCell.output.lock),
    type: rpcIndexerCell.output.type ? toScript(rpcIndexerCell.output.type) : undefined,
  },
  data: rpcIndexerCell.output_data,
  outPoint: toOutPoint(rpcIndexerCell.out_point),
  blockNumber: rpcIndexerCell.block_number,
});

async function loadSecp256k1ScriptDep(payload: { nodeUrl: string }): Promise<ScriptConfig> {
  const genesisBlock = await createRpcClient(payload.nodeUrl).request<RpcType.Block>('get_block_by_number', ['0x0']);
  if (!genesisBlock) throw new Error("can't load genesis block");
  const secp256k1DepTxHash = genesisBlock.transactions[1].hash;
  asserts.asserts(secp256k1DepTxHash, "can't load secp256k1 transaction");
  const rawTypeScript = genesisBlock.transactions[0].outputs[1].type;
  asserts.asserts(rawTypeScript, "can't load secp256k1 type script");
  const typeScript: Script = {
    codeHash: rawTypeScript.code_hash,
    hashType: rawTypeScript.hash_type,
    args: rawTypeScript.args,
  };
  const secp256k1TypeHash = utils.computeScriptHash(typeScript);

  return {
    HASH_TYPE: 'type',
    CODE_HASH: secp256k1TypeHash,
    INDEX: '0x0',
    TX_HASH: secp256k1DepTxHash,
    DEP_TYPE: 'depGroup',
  };
}

type RpcClient = {
  request: <Result = unknown, Params = unknown>(method: string, params: Params) => Promise<Result>;
  batchRequest: <Result = unknown, Params = unknown>(method: string, batchParams: Params[]) => Promise<Result[]>;
};

type RpcClientOptions = {
  timeout?: number; // in milliseconds
  maxRetries?: number;
};

function createRpcClient(url: string, options?: RpcClientOptions): RpcClient {
  // auto-increment id
  let jsonRpcId = 0;

  async function _request(body: JSONRPCRequest | JSONRPCRequest[]): Promise<JSONRPCResponse | JSONRPCResponse[]> {
    ++jsonRpcId;
    const retryRunner = async () => {
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // Abort retrying if the resource doesn't exist
      if (res.status >= 300) {
        /* istanbul ignore next */
        throw NexusCommonErrors.RequestCkbFailed(res);
      }
      return res.json();
    };

    const retryPromise = pRetry(retryRunner, { retries: options?.maxRetries || 5 });
    const res = await pTimeout(retryPromise, {
      milliseconds: options?.timeout || 5_000,
    });

    return res as Promise<JSONRPCResponse | JSONRPCResponse[]>;
  }

  async function request<Result = unknown, Params = unknown>(method: string, params: Params): Promise<Result> {
    const res = await _request({ jsonrpc: '2.0', id: jsonRpcId, method: method, params: params });
    asserts.asserts(!Array.isArray(res));
    if (res.error !== undefined) {
      throw NexusCommonErrors.RequestCkbFailed(res);
    }
    return res.result;
  }

  async function batchRequest<Result = unknown, Params = unknown>(
    method: string,
    batchParams: Params[],
  ): Promise<Result[]> {
    const res = await _request(
      batchParams.map((params) => ({
        jsonrpc: '2.0',
        id: jsonRpcId,
        method,
        params: params,
      })),
    );
    asserts.asserts(Array.isArray(res));

    return res.map<Result>((res) => {
      /* istanbul ignore if */
      if (res.error !== undefined) {
        throw NexusCommonErrors.RequestCkbFailed(res);
      }
      return res.result;
    });
  }

  return { request, batchRequest };
}

export function toRpcTransaction({
  version,
  cellDeps,
  headerDeps,
  inputs,
  outputs,
  witnesses,
  outputsData,
}: Transaction): RpcType.RawTransaction {
  function fromOutpoint(outPoint: OutPoint) {
    return {
      tx_hash: outPoint.txHash,
      index: outPoint.index,
    };
  }

  function fromScript(script: Script) {
    return {
      code_hash: script.codeHash,
      hash_type: script.hashType,
      args: script.args,
    };
  }
  return {
    version,
    cell_deps: cellDeps.map(({ outPoint, depType }) => ({
      out_point: fromOutpoint(outPoint),
      dep_type: snakeCase(depType) as 'code' | 'dep_group',
    })),
    header_deps: headerDeps,
    inputs: inputs.map(({ previousOutput, since }) => ({ previous_output: fromOutpoint(previousOutput), since })),
    outputs: outputs.map(({ capacity, lock, type }) => ({
      capacity,
      lock: fromScript(lock),
      type: type && fromScript(type),
    })),
    witnesses,
    outputs_data: outputsData,
  };
}

export { createRpcClient, loadSecp256k1ScriptDep, toCell, toScript, toQueryParam };
