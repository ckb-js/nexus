import * as awilix from 'awilix';
import { ConfigService, KeystoreService, OwnershipService, PlatformService, Storage } from '@nexus-wallet/types';
import { createConfigService } from '../config';
import { createInternalService, InternalService } from '../internal';
import { createKeystoreService } from '../keystore';
import { createFullOwnershipService } from '../ownership';
import { BackendProvider, createBackendProvider } from '../ownership/backend';
import { createEventHub, EventHub } from '../event';

export interface ModulesFactory<S = unknown, P = unknown> {
  get<K extends keyof Modules>(name: K): Modules<S, P>[K];
}

export interface Modules<S = unknown, P = unknown> {
  storage: Storage<S>;
  /**
   * @deprecated please migrate to {@link platformService}
   */
  notificationService: PlatformService<P>;
  keystoreService: KeystoreService;
  configService: ConfigService;
  internalService: InternalService;
  platformService: PlatformService<P>;
  backendProvider: BackendProvider;
  fullOwnershipService: OwnershipService;
  eventHub: EventHub;
}

export function createModulesFactory<S, P>({
  storage,
  platform,
  ...providers
}: ModuleProviderMap<S, P>): ModulesFactory<S, P> {
  const container = awilix.createContainer<Modules<S, P>>();

  container.register({
    storage: awilix.asFunction(storage).singleton(),
    configService: awilix.asFunction(providers.configService || createConfigService).singleton(),
    internalService: awilix.asFunction(providers.internalService || createInternalService).singleton(),
    keystoreService: awilix.asFunction(providers.keystoreService || createKeystoreService).singleton(),
    backendProvider: awilix.asFunction(providers.backendProvider || createBackendProvider).singleton(),
    fullOwnershipService: awilix.asFunction(providers.fullOwnershipService || createFullOwnershipService).singleton(),
    platformService: awilix.asFunction(platform).singleton(),
    notificationService: awilix.aliasTo('platformService'),
    eventHub: awilix.asFunction(providers.eventHub || createEventHub).singleton(),
  });

  return {
    get: (name) => container.resolve(name),
  };
}

export type ModuleProvider<T> = (arg: unknown) => T;
export type AsProvider<T> = { [key in keyof T]: ModuleProvider<T[key]> };
export type ModuleProviderMap<S, P> = {
  storage: ModuleProvider<Storage<S>>;
  platform: ModuleProvider<PlatformService<P>>;
} & Partial<Omit<AsProvider<Modules<S, P>>, 'platformService' | 'storage'>>;
