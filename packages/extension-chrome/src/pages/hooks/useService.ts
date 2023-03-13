import { createGlobalState } from 'react-use';
import { createServicesFactory, Modules } from '../../services';

const useServiceFactory = createGlobalState(createServicesFactory());

export function useService<T extends keyof Modules>(name: T): Modules[T] {
  const [serviceFactory] = useServiceFactory();
  return serviceFactory.get(name);
}
