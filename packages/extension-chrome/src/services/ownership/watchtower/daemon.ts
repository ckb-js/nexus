import { asyncSleep, createLogger } from '@nexus-wallet/utils';
import { ModulesFactory } from '../../factory';
import { createWatchtower, Watchtower } from '../watchtower';
import { createScriptInfoDb, OwnershipStorage } from '../storage';
import { EventEmitter } from 'eventemitter3';

const logger = createLogger();

interface StateChanged {
  networkChanged(networkId: string): void;
  walletInitialized(initialized: boolean): void;
}

type RunnerOptions = {
  onWatchtowerLaunched?: () => void;
  watchtowerScanIntervalMs?: number;
  pollIntervalMs?: number;
};

/**
 * run watchtower in polling mode, it will auto restart when network changed or wallet initialized
 * @param factory
 * @param options
 */
export function createDaemonWatchtower(factory: ModulesFactory, options?: RunnerOptions): Watchtower {
  let watchtower: Watchtower | undefined;
  // a pub-sub to trigger state change
  const scopedPubSub = new EventEmitter<StateChanged>();

  const configService = factory.get('configService');
  const keystoreService = factory.get('keystoreService');

  // last selected network id
  // used to detect network changed
  let selectedNetworkId: string | undefined;
  // last wallet initialized state
  // used to detect wallet initialized
  let walletInitialized = false;

  const pollIntervalMs = options?.pollIntervalMs ?? 3000;
  const onRestart = options?.onWatchtowerLaunched;

  let stopped = false;

  async function run() {
    walletInitialized = await keystoreService.hasInitialized();

    // start listener to restart watchtower
    // 1. when network changed
    // 2. when wallet initialized

    // restart watchtower when network changed
    scopedPubSub.addListener('networkChanged', () => {
      void restart();
    });
    // restart watchtower when wallet initialized
    scopedPubSub.addListener('walletInitialized', (initialized) => {
      if (initialized) {
        void restart();
      }
    });

    while (1) {
      if (stopped) {
        return;
      }
      try {
        await compareAndEmit();
        await asyncSleep(pollIntervalMs);
      } catch (e: unknown) {
        logger.error('Watchtower state listener error:', e);
        await asyncSleep(pollIntervalMs);
      }
    }
  }

  function stop() {
    stopped = true;
    if (watchtower) {
      watchtower.stop();
    }
  }

  // restart the watchtower
  async function restart() {
    onRestart?.();

    if (watchtower) {
      watchtower.stop();
    }

    if (!walletInitialized) {
      return;
    }

    const backendProvider = factory.get('backendProvider');
    const storage = factory.get('storage') as OwnershipStorage;
    const selectedNetwork = await configService.getSelectedNetwork();
    const db = createScriptInfoDb({ storage, networkId: selectedNetwork.id });
    watchtower = createWatchtower({
      scriptInfoDb: db,
      keystoreService,
      backend: await backendProvider.resolve(),
      configService,
      options: {
        scanInterval: options?.watchtowerScanIntervalMs,
      },
    });
    void watchtower.run();
  }

  // scan the state and emit event if state changed
  async function compareAndEmit() {
    const selectedNetwork = await configService.getSelectedNetwork();
    if (selectedNetwork.id !== selectedNetworkId) {
      selectedNetworkId = selectedNetwork.id;
      scopedPubSub.emit('networkChanged', selectedNetwork.id);
    }
    const initialized = await keystoreService.hasInitialized();
    if (initialized !== walletInitialized) {
      walletInitialized = initialized;
      scopedPubSub.emit('walletInitialized', initialized);
    }
  }

  return { stop, run };
}
