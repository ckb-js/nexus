import { createModulesFactory, ModulesFactory } from '.';
import { createBrowserExtensionPlatformService } from '../notification';
import { createBrowserExtensionStorage } from '../storage/extension';

/**
 * make a factory for creating services for the browser extension
 */
export function makeBrowserExtensionModulesFactory(): ModulesFactory {
  const factory = createModulesFactory({
    storage: createBrowserExtensionStorage,
    platform: createBrowserExtensionPlatformService,
  });

  return {
    get: (key) => factory.get(key),
  };
}

/**
 * @deprecated migrate to {@link makeBrowserExtensionModulesFactory}
 */
export const createServicesFactory = makeBrowserExtensionModulesFactory;
