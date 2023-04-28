import hd from '@ckb-lumos/hd';
import { RPC as Rpc } from '@ckb-lumos/rpc';
import { CkbNode } from '../helpers';
import { predefined } from '@ckb-lumos/config-manager';
import { Script } from '@nexus-wallet/protocol';
import { common } from '@ckb-lumos/common-scripts';
import { parseUnit } from '@ckb-lumos/bi';
import { encodeToAddress, sealTransaction, TransactionSkeleton } from '@ckb-lumos/helpers';
import { Indexer } from '@ckb-lumos/ckb-indexer';
import { randomBytes } from '@nexus-wallet/testkit';
import { asyncSleep } from '@nexus-wallet/utils';

describe('CKB Node wrapper', () => {
  let node: CkbNode;
  let node2: CkbNode;

  beforeAll(async () => {
    const nodes = await Promise.all([CkbNode.create(), CkbNode.create()]);
    node = nodes[0];
    node2 = nodes[1];

    await node.start();
    await node2.start();
  });

  afterAll(async () => {
    await node.stop();
    await node2.stop();
  });

  it('Should works well on default', async () => {
    const rpc = new Rpc(node.rpcUrl);
    const [privateKey] = node.issuedCellPrivateKeys;
    const tpl = predefined.AGGRON4.SCRIPTS.SECP256K1_BLAKE160;
    const lock: Script = {
      codeHash: tpl.CODE_HASH,
      hashType: tpl.HASH_TYPE,
      args: hd.key.privateKeyToBlake160(privateKey),
    };
    const {
      objects: [cell],
    } = await rpc.getCells({ script: lock, scriptType: 'lock' }, 'asc', 10n);
    expect(cell.output.lock.args).toEqual(lock.args);
  });

  it('Should transfer success in Devnet', async () => {
    const rpc = new Rpc(node.rpcUrl);
    const indexer = new Indexer(node.rpcUrl);

    const template = predefined.AGGRON4.SCRIPTS.SECP256K1_BLAKE160;
    const fromLock: Script = {
      codeHash: template.CODE_HASH,
      hashType: template.HASH_TYPE,
      args: hd.key.privateKeyToBlake160(node.issuedCellPrivateKeys[0]),
    };
    const fromAddr = encodeToAddress(fromLock);
    const toLock: Script = {
      codeHash: template.CODE_HASH,
      hashType: template.HASH_TYPE,
      args: hd.key.privateKeyToBlake160(randomBytes(32)),
    };
    const toAddr = encodeToAddress(toLock);

    const genesisBlock = await rpc.getBlockByNumber('0x0');
    const config = {
      config: {
        PREFIX: 'ckb',
        SCRIPTS: {
          ...predefined.AGGRON4.SCRIPTS,
          SECP256K1_BLAKE160: {
            ...predefined.AGGRON4.SCRIPTS.SECP256K1_BLAKE160,
            TX_HASH: genesisBlock.transactions[1].hash!,
          },
        },
      },
    };

    let txSkeleton = TransactionSkeleton({ cellProvider: indexer });
    const _10000Ckb = parseUnit('10000', 'ckb');

    txSkeleton = await common.transfer(txSkeleton, [fromAddr], toAddr, _10000Ckb, undefined, undefined, config);
    txSkeleton = await common.payFee(txSkeleton, [fromAddr], parseUnit('0.01', 'ckb'), undefined, config);
    txSkeleton = await common.prepareSigningEntries(txSkeleton, config);
    const signatures = txSkeleton
      .get('signingEntries')
      .toArray()
      .map(({ message }) => {
        return hd.key.signRecoverable(message, node.issuedCellPrivateKeys[0]);
      });

    const tx = sealTransaction(txSkeleton, signatures);
    const txHash = await rpc.sendTransaction(tx);

    while (true) {
      const tx = await rpc.getTransaction(txHash);
      if (tx.txStatus.status === 'committed') break;
      await asyncSleep(1000);
    }

    const res = await rpc.getCells({ script: toLock, scriptType: 'lock' }, 'asc', '0x64');
    expect(res.objects[0].output.capacity).toBe(_10000Ckb.toHexString());
  }, 20_000);
});
