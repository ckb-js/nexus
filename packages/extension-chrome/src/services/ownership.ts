import { AddressStorage } from './backend/addressStorage';
import { Script } from '@ckb-lumos/base';
import { OwnershipService, Paginate, KeystoreService, NotificationService } from '@nexus-wallet/types';
import {
  GetUsedLocksPayload,
  SignDataPayload,
  GetUnusedLocksPayload,
} from '@nexus-wallet/types/lib/services/OwnershipService';
import { errors } from '@nexus-wallet/utils';

export function createOwnershipService(
  keystoreService: KeystoreService,
  notificationService: NotificationService,
  addressStorageService: AddressStorage,
): OwnershipService {
  return {
    getLiveCells: () => {
      errors.unimplemented();
    },
    getUnusedLocks: async (payload: GetUnusedLocksPayload) => {
      const addressInfos = payload.change
        ? addressStorageService.getUsedChangeAddresses()
        : addressStorageService.getUsedExternalAddresses();
      const locks = addressInfos.map((addressInfo) => addressInfo.lock);
      return locks;
    },
    getUsedLocks: async (payload: GetUsedLocksPayload): Promise<Paginate<Script>> => {
      await addressStorageService.syncAllAddressInfo();
      const changeScripts = addressStorageService.getUsedChangeAddresses().map((addressInfo) => addressInfo.lock);
      const externalScripts = addressStorageService.getUsedExternalAddresses().map((addressInfo) => addressInfo.lock);
      return payload.change
        ? {
            cursor: '',
            objects: changeScripts,
          }
        : {
            cursor: '',
            objects: externalScripts,
          };
    },
    signTransaction: () => {
      errors.unimplemented();
    },
    signData: async (payload: SignDataPayload) => {
      const addressInfo = addressStorageService.getAddressInfoByLock({ lock: payload.lock });
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
}
