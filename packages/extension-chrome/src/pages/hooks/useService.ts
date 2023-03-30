import { createGlobalState } from 'react-use';
import { makeBrowserExtensionModulesFactory, Modules } from '../../services';

const useServiceFactory = createGlobalState(makeBrowserExtensionModulesFactory());

export function useService<T extends keyof Modules>(name: T): Modules[T] {
  const [serviceFactory] = useServiceFactory();
  return serviceFactory.get(name);
}
