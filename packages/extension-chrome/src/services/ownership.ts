import { AddressStorage } from './backend/addressStorage';
import { Script } from '@ckb-lumos/base';
import { publicKeyToBlake160 } from '@ckb-lumos/hd/lib/key';
import { OwnershipService, Paginate, KeystoreService, NotificationService } from '@nexus-wallet/types';
import { GetUsedLocksPayload, SignDataPayload } from '@nexus-wallet/types/lib/services/OwnershipService';
import { errors } from '@nexus-wallet/utils';
import { config } from '@ckb-lumos/lumos';
import { Backend } from './backend';

const MAX_ADDRESS_GAP = 20;

export function createOwnershipService(
  keystoreService: KeystoreService,
  notificationService: NotificationService,
  backend: Backend,
  addressStorageService: AddressStorage,
): OwnershipService {
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

      const externalScripts: Script[] = [];
      const changeScripts: Script[] = [];
      let currentGap = 0;
      for (let index = 0; ; index++) {
        const childScript: Script = generateChildScript(keystoreService, false, index);
        const childScriptHasHistory = await backend.hasHistory(childScript);
        // detect if there is a corresponding change address used also.
        const changeScript: Script = generateChildScript(keystoreService, true, index);
        const changeScriptHasHistory = await backend.hasHistory(changeScript);
        changeScriptHasHistory && changeScripts.push(changeScript);
        if (childScriptHasHistory) {
          externalScripts.push(childScript);
          currentGap = 0;
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
    signData: async (payload: SignDataPayload) => {
      const addressInfo = addressStorageService.getAddressInfoByLock(payload.lock);
      if (!addressInfo) {
        errors.throwError('address not found');
      }
      const password = (await notificationService.requestSignData({ data: payload.data })).password;
      const signature = await keystoreService.signMessage({
        message: payload.data,
        password,
        path: addressInfo.path,
      });
      return signature;
    },
  };

  function generateChildScript(keystoreService: KeystoreService, change = false, index: number) {
    const childPubkey = keystoreService.getChildPubkey({ change, index });
    // args for SECP256K1_BLAKE160 script
    const scriptArgs = publicKeyToBlake160(childPubkey);
    const childScript: Script = {
      codeHash: config.getConfig().SCRIPTS!.SECP256K1_BLAKE160!.CODE_HASH,
      hashType: 'type',
      args: scriptArgs,
    };
    return childScript;
  }
}
