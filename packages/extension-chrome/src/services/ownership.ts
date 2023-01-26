import { Script } from '@ckb-lumos/base';
import { Keychain } from '@ckb-lumos/hd';
import { publicKeyToBlake160 } from '@ckb-lumos/hd/lib/key';
import { OwnershipService, Paginate, GetUsedLocksPayload } from '@nexus-wallet/types';
import { errors } from '@nexus-wallet/utils';
import { config } from '@ckb-lumos/lumos';
import { Backend } from './backend';

const MAX_ADDRESS_GAP = 20;

export function createOwnershipService(keychain: Keychain, backend: Backend): OwnershipService {
  return {
    getLiveCells: () => {
      errors.unimplemented();
    },
    getUnusedLocks: () => {
      errors.unimplemented();
    },
    getUsedLocks: async (payload: GetUsedLocksPayload): Promise<Paginate<Script>> => {
      // refer to bip-44-account-discovery https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#account-discovery
      // 1. derive the first account's node (index = 0)
      // 2. derive the external chain node of this account
      // 3. scan addresses of the external chain; respect the gap limit (20)

      // keychain for path: `m/44'/309'/0'/0`, parent keychain for first address path: `m/44'/309'/0'/0/0`
      const masterKeyChain = keychain.derivePath(`m/44'/309'/0'/0`);
      const externalScripts: Script[] = [];
      const changeScripts: Script[] = [];
      let currentGap = 0;
      for (let index = 0; ; index++) {
        const childScript: Script = generateChildScript(masterKeyChain, index);
        const childScriptTxCount = await backend.countTx(childScript);
        if (childScriptTxCount > 0) {
          externalScripts.push(childScript);
          currentGap = 0;
          // if this external address is used, detect if there is a corresponding change address used also.
          const changeScript: Script = generateChildScript(masterKeyChain, index);
          const changeScriptTxCount = await backend.countTx(changeScript);
          !!changeScriptTxCount && changeScripts.push(changeScript);
        } else {
          currentGap++;
          if (currentGap >= MAX_ADDRESS_GAP) {
            return payload.change
              ? {
                  cursor: '',
                  objects: changeScripts,
                }
              : {
                  cursor: '',
                  objects: externalScripts,
                };
          }
        }
      }
    },
    signTransaction: () => {
      errors.unimplemented();
    },
    signData: () => {
      errors.unimplemented();
    },
  };

  function generateChildScript(masterKeyChain: Keychain, index: number) {
    const childKeyChain = masterKeyChain.deriveChild(index, false);
    // args for SECP256K1_BLAKE160 script
    const scriptArgs = publicKeyToBlake160(`0x${childKeyChain.publicKey.toString('hex')}`);
    const childScript: Script = {
      codeHash: config.getConfig().SCRIPTS!.SECP256K1_BLAKE160!.CODE_HASH,
      hashType: 'type',
      args: scriptArgs,
    };
    return childScript;
  }
}
