import { GrantService, NotificationService, Promisable, Storage } from '@nexus-wallet/types';
import { createGrantService } from './grant';
import { createInMemoryStorage } from './storage';
import { createNotificationService } from './notification';

interface Schema {
  grant: string[];
}

export interface Services {
  storage: Storage<Schema>;
  grantService: GrantService;
  notificationService: NotificationService;
}

export interface ServicesFactory {
  get<K extends keyof Services>(name: K): Promisable<Services[K]>;
}

export function createServicesFactory(): ServicesFactory {
  const storage = createInMemoryStorage<Schema>();

  const defaultStorage = {
    grant: [],
  };
  storage.setAll({
    ...defaultStorage,
    ...storage.getAll(),
  });

  const services = {
    storage,
    grantService: createGrantService({ storage }),
    notificationService: createNotificationService(),
  };

  return {
    get(key) {
      return services[key];
    },
  };
}
