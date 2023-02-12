import { SignTransactionPayload } from '@nexus-wallet/types/src/services/OwnershipService';
import { Backend } from './backend/backend';
import { Script } from '@ckb-lumos/base';
import { OwnershipService, Paginate, KeystoreService, NotificationService } from '@nexus-wallet/types';
import {
  getOnChainLocksPayload,
  SignDataPayload,
  getOffChainLocksPayload,
  GroupedSignature,
} from '@nexus-wallet/types/lib/services/OwnershipService';
import { asserts } from '@nexus-wallet/utils';
import { createTransactionSkeleton } from '@ckb-lumos/helpers';
import { prepareSigningEntries } from '@ckb-lumos/common-scripts/lib/secp256k1_blake160';
import { LocksProvider } from './backend/locksProvider';

export function createOwnershipService(config: {
  keystoreService: KeystoreService;
  notificationService: NotificationService;
  locksProvider: LocksProvider;
  backend: Backend;
}): OwnershipService {
  return {
    getLiveCells: async () => {
      const locks = config.locksProvider.getAllOnChainLockList().map((lockInfo) => lockInfo.lock);
      const cells = await config.backend.getLiveCells({ locks });
      return {
        // TODO implement the cursor here
        cursor: '',
        objects: cells,
      };
    },
    getOffChainLocks: async (payload: getOffChainLocksPayload) => {
      const lockInfoList = payload.change
        ? await config.locksProvider.getNextOffChainChangeLocks()
        : await config.locksProvider.getNextOffChainExternalLocks();
      const locks = lockInfoList.map((lockInfo) => lockInfo.lock);
      return locks;
    },
    getOnChainLocks: async (payload: getOnChainLocksPayload): Promise<Paginate<Script>> => {
      const lockInfoList = payload.change
        ? await config.locksProvider.getNextOnChainChangeLocks()
        : await config.locksProvider.getNextOnChainExternalLocks();
      const locks = lockInfoList.map((lockInfo) => lockInfo.lock);
      return payload.change
        ? {
            // TODO implement the cursor here
            cursor: '',
            objects: locks,
          }
        : {
            // TODO implement the cursor here
            cursor: '',
            objects: locks,
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
      const lockInfoList = inputLocks.map((lock) => {
        const lockInfo = config.locksProvider.getlockInfoByLock({ lock });
        asserts.nonEmpty(lockInfo);
        return lockInfo;
      });
      const signingEntries = txSkeleton.get('signingEntries').toArray();
      const password = (await config.notificationService.requestSignTransaction({ tx: payload.tx })).password;
      const result: GroupedSignature = [];
      for (let index = 0; index < signingEntries.length; index++) {
        const signingEntry = signingEntries[index];
        const lockInfo = lockInfoList[signingEntry.index];
        const signature = await config.keystoreService.signMessage({
          message: signingEntry.message,
          password,
          path: lockInfo.path,
        });
        result.push([lockInfo.lock, signature]);
      }
      return result;
    },
    signData: async (payload: SignDataPayload) => {
      const lockInfo = config.locksProvider.getlockInfoByLock({ lock: payload.lock });
      asserts.nonEmpty(lockInfo);
      const password = (await config.notificationService.requestSignData({ data: payload.data })).password;
      const signature = await config.keystoreService.signMessage({
        message: payload.data,
        password,
        path: lockInfo.path,
      });
      return signature;
    },
  };
}
