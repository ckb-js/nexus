export {
  /**
   *
   * @deprecated migrate to {@link import("./factory").createModulesFactory}}
   */
  createServicesFactory,
  makeBrowserExtensionModulesFactory,
} from './factory/extension';

export type {
  Modules,
  /**
   * @deprecated
   */
  ModulesFactory as ServicesFactory,
  ModulesFactory,
} from './factory';

export { createModulesFactory } from './factory';
