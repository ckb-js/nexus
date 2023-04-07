import { createModulesFactory, ModulesFactory } from '.';
import { createBrowserExtensionPlatformService } from '../notification/notification';
import { createBrowserExtensionStorage } from '../storage/extension';
import { createBrowserExtensionEventHub } from '../event/extension';

/**
 * make a factory for creating services for the browser extension
 */
export function makeBrowserExtensionModulesFactory(): ModulesFactory {
  const factory = createModulesFactory({
    storage: createBrowserExtensionStorage,
    platform: createBrowserExtensionPlatformService,
    eventHub: createBrowserExtensionEventHub,
  });

  if (process.env.NODE_ENV === 'development') {
    if (typeof globalThis !== 'undefined' && typeof globalThis === 'object' && !('_nexusModuleFactory' in globalThis)) {
      Object.defineProperty(globalThis, '_nexusModuleFactory', {
        get: () => factory,
      });
    }
  }

  return {
    get: (key) => factory.get(key),
  };
}

/**
 * @deprecated migrate to {@link makeBrowserExtensionModulesFactory}
 */
export const createServicesFactory = makeBrowserExtensionModulesFactory;
