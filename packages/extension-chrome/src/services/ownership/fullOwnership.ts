import { ConfigService, KeystoreService, OwnershipService, PlatformService } from '@nexus-wallet/types';
import { createScriptInfoDb, OwnershipStorage, ScriptInfo, ScriptInfoDb } from './storage';
import { asserts, errors } from '@nexus-wallet/utils';
import { FULL_OWNERSHIP_EXTERNAL_PARENT_PATH, FULL_OWNERSHIP_INTERNAL_PARENT_PATH } from './constants';
import { CellCursor, decodeCursor } from './cursor';
import { BackendProvider } from './backend';
import { HexString, Script, utils } from '@ckb-lumos/lumos';
import { common } from '@ckb-lumos/common-scripts';
import { Config } from '@ckb-lumos/config-manager';

export function createFullOwnershipService({
  storage,
  configService,
  platformService,
  keystoreService,
  backendProvider,
}: {
  storage: OwnershipStorage;
  configService: ConfigService;
  platformService: PlatformService;
  keystoreService: KeystoreService;
  backendProvider: BackendProvider;
}): OwnershipService {
  async function getDb(): Promise<ScriptInfoDb> {
    const selectedNetwork = await configService.getSelectedNetwork();
    return createScriptInfoDb({ storage, networkId: selectedNetwork.id });
  }

  async function getLumosConfig(): Promise<Config> {
    const backend = await backendProvider.resolve();

    return {
      PREFIX: 'ckb',
      SCRIPTS: { SECP256K1_BLAKE160: await backend.getSecp256k1Blake160ScriptConfig() },
    } satisfies Config;
  }

  return {
    getLiveCells: async ({ cursor: encodedCursor } = {}) => {
      const db = await getDb();
      const backend = await backendProvider.resolve();

      const infos = await db.getAll();

      const cursor: CellCursor = encodedCursor ? decodeCursor(encodedCursor) : { indexerCursor: '', localId: 0 };

      const onChainLocks = infos
        .filter(
          (info) =>
            info.status === 'OnChain' &&
            // only fetch cells after or containing this lock
            info.id >= cursor.localId,
        )
        .map((info) => info.lock);

      return backend.getLiveCellsByLocks({ locks: onChainLocks, cursor: cursor.indexerCursor });
    },

    getOnChainLocks: async ({ change, cursor: infoIdStr }) => {
      const db = await getDb();
      const infos = await db.getAll();

      const startInfoId = infoIdStr ? parseInt(infoIdStr, 10) : 0;

      const onChainLockInfos = infos
        .filter((info) => info.status === 'OnChain')
        // only filter locks after the cursor
        .filter((info) => info.id > startInfoId)
        .filter(filterByChange(change))
        // TODO make this configurable
        // only return 20 locks on each page
        .slice(0, 20);

      const nextStartInfoId = onChainLockInfos[onChainLockInfos.length - 1]?.id.toString();

      return {
        cursor: nextStartInfoId,
        objects: onChainLockInfos.map((info) => info.lock),
      };
    },
    signTransaction: async ({ tx }) => {
      const { password } = await platformService.requestSignTransaction({ tx });

      const backend = await backendProvider.resolve();
      const db = await getDb();

      let txSkeleton = await backend.resolveTx(tx);

      txSkeleton = common.prepareSigningEntries(txSkeleton, { config: await getLumosConfig() });
      const signatures = await Promise.all(
        txSkeleton
          .get('signingEntries')
          .map(async (entry) => {
            const lock = txSkeleton.inputs.get(entry.index)?.cellOutput.lock;
            asserts.asserts(lock, 'Impossible to reach here');

            const [info] = await db.filterByMatch({ scriptHash: utils.computeScriptHash(lock) });
            asserts.asserts(
              info,
              'Cannot find script info associated with lock %s, this error is unlikely to occur, have you changed the data in storage or have you manually built the data in storage?',
              lock,
            );

            const signature = await keystoreService.signMessage({
              message: entry.message,
              password,
              path: `${info.parentPath}/${info.childIndex}`,
            });

            return [lock, signature] satisfies [Script, HexString];
          })
          .toArray(),
      );

      return signatures;
    },
    signData: async () => {
      errors.unimplemented();
    },
    getOffChainLocks: async ({ change }) => {
      const db = await getDb();
      const infos = await db.getAll();

      const offChainInfos = infos.filter((info) => info.status === 'OffChain').filter(filterByChange(change));

      return offChainInfos.map((info) => info.lock);
    },
  };
}

function filterByChange(change: 'external' | 'internal' = 'external'): (info: ScriptInfo) => boolean {
  return (info) => {
    if (change === 'external') return info.parentPath === FULL_OWNERSHIP_EXTERNAL_PARENT_PATH;
    if (change === 'internal') return info.parentPath === FULL_OWNERSHIP_INTERNAL_PARENT_PATH;

    errors.throwError('Invalid change type %s', change);
  };
}