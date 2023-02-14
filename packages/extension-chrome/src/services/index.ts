import { ConfigService, GrantService, KeystoreService, NotificationService, Storage } from '@nexus-wallet/types';
import { createGrantService } from './grant';
import { createInMemoryStorage } from './storage';
import { createNotificationService } from './notification';
import { createInternalService, InternalService } from './internal';
import { createKeystoreService } from './keystore';
import { createConfigService } from './config';
import { Config } from '@nexus-wallet/types/lib/services';

interface Schema {
  grant: string[];
  config?: Config;
}

export interface Services {
  storage: Storage<Schema>;
  grantService: GrantService;
  notificationService: NotificationService;
  keystoreService: KeystoreService;
  configService: ConfigService;
  internalService: InternalService;
}

export interface ServicesFactory {
  get<K extends keyof Services>(name: K): Promise<Services[K]>;
}

export function createServicesFactory(): ServicesFactory {
  // TODO replace with the real storage
  const storage = createInMemoryStorage<Schema>();

  const defaultStorage = {
    grant: [],
  };
  storage.setAll({
    ...defaultStorage,
    ...storage.getAll(),
  });

  const keystoreService = createKeystoreService({ storage });
  const configService = createConfigService({ storage });

  const services = {
    storage,
    grantService: createGrantService({ storage }),
    notificationService: createNotificationService(),
    keystoreService,
    configService,
    internalService: createInternalService({ keystoreService, configService }),
  };

  return {
    get(key) {
      return Promise.resolve(services[key]);
    },
  };
}
