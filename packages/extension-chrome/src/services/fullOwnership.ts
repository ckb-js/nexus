import { SignTransactionPayload } from '@nexus-wallet/types/src/services/OwnershipService';
import { Backend } from './backend/backend';
import { AddressStorage } from './backend/addressStorage';
import { Script } from '@ckb-lumos/base';
import { OwnershipService, Paginate, KeystoreService, NotificationService } from '@nexus-wallet/types';
import {
  GetUsedLocksPayload,
  SignDataPayload,
  GetUnusedLocksPayload,
  GroupedSignature,
} from '@nexus-wallet/types/lib/services/OwnershipService';
import { asserts } from '@nexus-wallet/utils';
import { createTransactionSkeleton } from '@ckb-lumos/helpers';
import { prepareSigningEntries } from '@ckb-lumos/common-scripts/lib/secp256k1_blake160';

export function createFullOwnershipService(config: {
  keystoreService: KeystoreService;
  notificationService: NotificationService;
  addressStorageService: AddressStorage;
  backend: Backend;
}): OwnershipService {
  return {
    getLiveCells: async () => {
      const locks = config.addressStorageService.getAllUsedAddresses().map((addressInfo) => addressInfo.lock);
      const cells = await config.backend.getLiveCells({ locks });
      return {
        // TODO implement the cursor here
        cursor: '',
        objects: cells,
      };
    },
    getUnusedLocks: async (payload: GetUnusedLocksPayload) => {
      const addressInfos = payload.change
        ? config.addressStorageService.getUsedChangeAddresses()
        : config.addressStorageService.getUsedExternalAddresses();
      const locks = addressInfos.map((addressInfo) => addressInfo.lock);
      return locks;
    },
    getUsedLocks: async (payload: GetUsedLocksPayload): Promise<Paginate<Script>> => {
      await config.addressStorageService.syncAllAddressInfo();
      const changeScripts = config.addressStorageService
        .getUsedChangeAddresses()
        .map((addressInfo) => addressInfo.lock);
      const externalScripts = config.addressStorageService
        .getUsedExternalAddresses()
        .map((addressInfo) => addressInfo.lock);
      return payload.change
        ? {
            // TODO implement the cursor here
            cursor: '',
            objects: changeScripts,
          }
        : {
            // TODO implement the cursor here
            cursor: '',
            objects: externalScripts,
          };
    },
    signTransaction: async (payload: SignTransactionPayload) => {
      const cellFetcher = config.backend.getLiveCellFetcher();
      let txSkeleton = await createTransactionSkeleton(payload.tx, cellFetcher);
      txSkeleton = prepareSigningEntries(txSkeleton);
      const inputLocks = txSkeleton
        .get('inputs')
        .map((input) => input.cellOutput.lock)
        .toArray();
      const addressInfos = inputLocks.map((lock) => {
        const addressInfo = config.addressStorageService.getAddressInfoByLock({ lock });
        asserts.nonEmpty(addressInfo);
        return addressInfo;
      });
      const signingEntries = txSkeleton.get('signingEntries').toArray();
      const password = (await config.notificationService.requestSignTransaction({ tx: payload.tx })).password;
      const result: GroupedSignature = [];
      for (let index = 0; index < signingEntries.length; index++) {
        const signingEntry = signingEntries[index];
        const addressInfo = addressInfos[signingEntry.index];
        const signature = await config.keystoreService.signMessage({
          message: signingEntry.message,
          password,
          path: addressInfo.path,
        });
        result.push([addressInfo.lock, signature]);
      }
      return result;
    },
    signData: async (payload: SignDataPayload) => {
      const addressInfo = config.addressStorageService.getAddressInfoByLock({ lock: payload.lock });
      asserts.nonEmpty(addressInfo);
      const password = (await config.notificationService.requestSignData({ data: payload.data })).password;
      const signature = await config.keystoreService.signMessage({
        message: payload.data,
        password,
        path: addressInfo.path,
      });
      return signature;
    },
  };
}
