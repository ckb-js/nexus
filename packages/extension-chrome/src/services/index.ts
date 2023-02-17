import * as awilix from 'awilix';
import { ConfigService, KeystoreService, NotificationService, Storage } from '@nexus-wallet/types';
import { createBrowserExtensionStorage } from './storage/extension';
import { createNotificationService } from './notification';
import { createInternalService, InternalService } from './internal';
import { createKeystoreService } from './keystore';
import { createConfigService } from './config';
import type { Browser } from 'webextension-polyfill';
import browser from 'webextension-polyfill';

export interface Modules {
  browser: Browser;
  storage: Storage<unknown>;
  notificationService: NotificationService;
  keystoreService: KeystoreService;
  configService: ConfigService;
  internalService: InternalService;
}

export interface ServicesFactory {
  get<K extends keyof Modules>(name: K): Modules[K];
}

export function createServicesFactory(): ServicesFactory {
  const container = awilix.createContainer<Modules>();
  container.register({
    browser: awilix.asValue(browser),
    storage: awilix.asFunction(createBrowserExtensionStorage).singleton(),
    configService: awilix.asFunction(createConfigService).singleton(),
    internalService: awilix.asFunction(createInternalService).singleton(),
    keystoreService: awilix.asFunction(createKeystoreService).singleton(),
    notificationService: awilix.asFunction(createNotificationService).singleton(),
  });

  return {
    get: (key) => container.resolve(key),
  };
}
