import * as awilix from 'awilix';
import { ConfigService, KeystoreService, PlatformService, Storage } from '@nexus-wallet/types';
import { createConfigService } from '../config';
import { createInternalService, InternalService } from '../internal';
import { createKeystoreService } from '../keystore';
import { createEventHub, EventHub } from '../event';

export interface ModulesFactory {
  get<K extends keyof Modules>(name: K): Modules[K];
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
  eventHub: EventHub;
}

export function createModulesFactory<S, P>({ storage, platform }: ModuleProviderMap<S, P>): ModulesFactory {
  const container = awilix.createContainer<Modules>();
  const platformResolover = awilix.asFunction(platform).singleton();
  container.register({
    storage: awilix.asFunction(storage).singleton(),
    configService: awilix.asFunction(createConfigService).singleton(),
    internalService: awilix.asFunction(createInternalService).singleton(),
    keystoreService: awilix.asFunction(createKeystoreService).singleton(),
    notificationService: platformResolover,
    platformService: platformResolover,
    eventHub: awilix.asFunction(createEventHub).singleton(),
  });

  return {
    get: (name) => container.resolve(name),
  };
}

export type ModuleProvider<T> = (arg: unknown) => T;

export type ModuleProviderMap<S, P> = {
  storage: ModuleProvider<Storage<S>>;
  platform: ModuleProvider<PlatformService<P>>;
};
