import { ConfigService, Storage } from '@nexus-wallet/types';
import type { Config, NetworkConfig, TrustedHost } from '@nexus-wallet/types/lib/services';
import { createLogger, errors, LIB_VERSION } from '@nexus-wallet/utils';
import produce from 'immer';
import joi from 'joi';
import { EventHub } from './event';
import { validateHost } from '../utils/validate';

const logger = createLogger();

const NetworkSchema = joi.object<NetworkConfig>({
  id: joi.string().required(),
  networkName: joi.string().required(),
  rpcUrl: joi.string().uri().required(),
  displayName: joi.string().required(),
});

const TrustedHostSchema = joi.object<TrustedHost>({
  host: joi.string().custom(validateHost),

  // TODO: migrate config without favicon field
  favicon: joi.string().optional(),
});

const ConfigSchema = joi.object<Config>({
  nickname: joi.string().required(),
  selectedNetwork: joi.string().required(),
  version: joi.string().required(),
  networks: joi.array().items(NetworkSchema).required(),
  whitelist: joi.array().items(TrustedHostSchema).required(),
});

const DEFAULT_CONFIG = Object.freeze({
  version: LIB_VERSION,
  whitelist: [],
  nickname: '',
  networks: [],
  selectedNetwork: '',
});

export function createConfigService(payload: {
  storage: Storage<{ config: Config }>;
  eventHub: EventHub;
}): ConfigService {
  const { storage, eventHub } = payload;

  const getConfig = async (): Promise<Config> => {
    const config = await storage.getItem('config');
    if (!config) {
      errors.throwError(`Config is not initialized, Nexus may not be initialized`);
    }
    return config;
  };

  const setConfig = async (configOrUpdate: Partial<Config> | ((config: Config) => void)): Promise<void> => {
    const oldConfig = (await storage.getItem('config')) || DEFAULT_CONFIG;

    const updated = (() => {
      if (typeof configOrUpdate === 'function') {
        return produce(oldConfig, (draft) => {
          configOrUpdate(draft);
        });
      }
      return configOrUpdate;
    })();

    const newConfig = Object.assign({}, oldConfig, updated) as Config;

    const validationResult = ConfigSchema.validate(newConfig);

    if (validationResult.error) {
      errors.throwError(`config is invalid`, validationResult.error.message);
    }

    const { networks, selectedNetwork } = newConfig;

    // check if selectedNetwork is in networks
    const newSelectedNetwork = networks.find((network) => network.id === selectedNetwork);
    if (!newSelectedNetwork) {
      errors.throwError(
        `Selected network "%s" is not found in networks, please check if the selected one is in networks[].id`,
        selectedNetwork,
      );
    }

    if (newConfig.selectedNetwork !== oldConfig.selectedNetwork) {
      eventHub.emit('networkChanged', newSelectedNetwork.networkName);
    }

    logger.info('Config updated \nold: %s \nnew: %s', oldConfig, newConfig);

    await storage.setItem('config', newConfig);
  };

  const impl: ConfigService = {
    getConfig,
    setConfig: ({ config }) => setConfig(config),
    getSelectedNetwork: /* istanbul ignore next */ async () => {
      const { selectedNetwork, networks } = await impl.getConfig();
      const selected = networks.find((network) => network.id === selectedNetwork);
      if (!selected) {
        errors.throwError('Selected network %s is not found in the list of networks %s', selectedNetwork, networks);
      }
      return selected;
    },
    addNetwork: /* istanbul ignore next */ (payload) => {
      return setConfig((draft) => draft.networks.push(payload.network));
    },
    addWhitelistItem: /* istanbul ignore next */ (host) => {
      return setConfig((draft) => draft.whitelist.push(host));
    },
    getNetworks: /* istanbul ignore next */ () => {
      return getConfig().then((draft) => draft.networks);
    },
    getNickname: /* istanbul ignore next */ () => {
      return getConfig().then((draft) => draft.nickname);
    },
    getVersion: /* istanbul ignore next */ () => {
      return getConfig().then((draft) => draft.version);
    },
    getWhitelist: /* istanbul ignore next */ () => {
      return getConfig().then((draft) => draft.whitelist);
    },
    removeNetwork: /* istanbul ignore next */ ({ id }) => {
      return setConfig((draft) => (draft.networks = draft.networks.filter((network) => network.id !== id)));
    },
    removeWhitelistItem: /* istanbul ignore next */ ({ host }) => {
      return setConfig((draft) => {
        draft.whitelist = draft.whitelist.filter((item) => item.host !== host);
      });
    },
    setNickname: /* istanbul ignore next */ ({ nickname }) => {
      return setConfig((draft) => {
        draft.nickname = nickname;
      });
    },
    setSelectedNetwork: /* istanbul ignore next */ ({ id }) => {
      return setConfig((draft) => {
        draft.selectedNetwork = id;
      });
    },
  };

  return impl;
}
