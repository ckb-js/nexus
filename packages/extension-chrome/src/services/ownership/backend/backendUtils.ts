import { Cell, HexNumber, HexString, OutPoint, Script, utils } from '@ckb-lumos/lumos';
import { asserts } from '@nexus-wallet/utils';
import { ScriptConfig } from '@ckb-lumos/config-manager';
import { JSONRPCRequest, JSONRPCResponse } from 'json-rpc-2.0';
import { RPC as RpcType } from '@ckb-lumos/rpc/lib/types/rpc';
import { RequestOptions, requestWithOptions } from './request';
import { NexusCommonErrors } from '../../../errors';

type Order = 'asc' | 'desc';
type Limit = HexNumber;
type CursorType = HexString | null;
type RpcQueryType = [
  {
    script: RpcType.Script;
    script_type: 'lock' | 'type';
    search_type: 'exact' | 'prefix';
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
    search_type: 'exact',
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

function createRpcClient(url: string, options?: RequestOptions): RpcClient {
  // auto-increment id
  let jsonRpcId = 0;

  async function _request(body: JSONRPCRequest | JSONRPCRequest[]): Promise<JSONRPCResponse | JSONRPCResponse[]> {
    ++jsonRpcId;
    const fetchProvider = () =>
      fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });

    return requestWithOptions(fetchProvider, options);
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

export { createRpcClient, loadSecp256k1ScriptDep, toCell, toScript, toQueryParam };
