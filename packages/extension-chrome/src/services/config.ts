import { ConfigService, Storage } from '@nexus-wallet/types';
import type { Config, NetworkConfig } from '@nexus-wallet/types/lib/services';
import { asserts, errors, LIB_VERSION } from '@nexus-wallet/utils';
import Ajv, { JSONSchemaType } from 'ajv';

const ajv = new Ajv();
const networkSchema: JSONSchemaType<NetworkConfig> = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    networkName: { type: 'string' },
    rpcUrl: { type: 'string' },
    displayName: { type: 'string' },
  },
  required: ['id', 'networkName', 'rpcUrl', 'displayName'],
};

const configSchema: JSONSchemaType<Config> = {
  type: 'object',
  properties: {
    nickname: { type: 'string' },
    networks: { type: 'array', items: networkSchema },
    selectedNetwork: { type: 'string' },
    version: { type: 'string' },
    whitelist: { type: 'array', items: { type: 'string' } },
  },
  required: ['nickname', 'networks', 'selectedNetwork', 'whitelist'],
  additionalProperties: false,
};

export function createConfigService(payload: { storage: Storage<{ config: Config }> }): ConfigService {
  const { storage } = payload;

  const impl: ConfigService = {
    getConfig: async () => {
      const config = await storage.getItem('config');
      asserts.asserts(config, 'Config not initialized, Nexus may not be installed correctly');
      return config;
    },
    setConfig: async (payload) => {
      const original = await storage.getItem('config');

      const validate = ajv.compile(configSchema);
      const newConfig = Object.assign(original || { version: LIB_VERSION }, payload.config);

      if (!validate(newConfig)) {
        errors.throwError(`Invalid config`, validate.errors);
      }

      await storage.setItem('config', newConfig);
    },
    getSelectedNetwork: () => {
      errors.unimplemented();
    },
    addNetwork: () => {
      errors.unimplemented();
    },
    addWhitelistItem: () => {
      errors.unimplemented();
    },
    getNetworks: () => {
      errors.unimplemented();
    },
    getNickname: () => {
      errors.unimplemented();
    },
    getVersion: () => {
      errors.unimplemented();
    },
    getWhitelist: () => {
      errors.unimplemented();
    },
    removeNetwork: () => {
      errors.unimplemented();
    },
    removeWhitelistItem: () => {
      errors.unimplemented();
    },
    setNickname: () => {
      errors.unimplemented();
    },
    setSelectedNetwork: () => {
      errors.unimplemented();
    },
  };

  return impl;
}
