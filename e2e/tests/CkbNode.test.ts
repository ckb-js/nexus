import hd from '@ckb-lumos/hd';
import { RPC } from '@ckb-lumos/rpc';
import { CkbNode } from '../helpers/CkbNode';
import { predefined } from '@ckb-lumos/config-manager';
import { Script } from '@nexus-wallet/protocol';

jest.setTimeout(200_000);

describe('CKB Node wrapper', () => {
  it('Should works well on default', async () => {
    const [node, anotherNode] = await Promise.all([CkbNode.create(), CkbNode.create()]);

    await Promise.all([node.start(), anotherNode.start()]);
    const rpc = new RPC(node.rpcUrl);
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
    await node.stop();
    await anotherNode.stop();
  });
});
