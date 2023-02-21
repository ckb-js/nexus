import { BackendProvider } from './../services/ownership/backend';
import { createLogger, errors } from '@nexus-wallet/utils';
import { createServicesFactory } from '../services';
import { ProbeTask } from '../services/ownership/probeTask';
import { createOwnershipServices } from '../services/ownershipService';
import { addMethod } from './server';
import { LocksManager } from '../services/ownership/locksManager';

const logger = createLogger();
let probe: ProbeTask | undefined;

addMethod('wallet_enable', async (_, { getRequesterAppInfo, resolveService }) => {
  const configService = await resolveService('configService');

  const { url } = await getRequesterAppInfo();
  const { host, protocol } = new URL(url);

  logger.info(`wallet_enable: %s`, url);

  const { whitelist } = await configService.getConfig();

  const isTrusted = whitelist.find((item) => item.host === host);
  if (isTrusted) return;

  try {
    const notificationService = await resolveService('notificationService');
    await notificationService.requestGrant({ url });
  } catch {
    errors.throwError('User has rejected');
  }

  await configService.addWhitelistItem({ host: host, favicon: `${protocol}//${host}/favicon.ico` });
  const servicesFactory = createServicesFactory();
  const keystoreService = await servicesFactory.get('keystoreService');
  const storage = await servicesFactory.get('storage');
  const backend = BackendProvider.getDefaultBackend();

  probe = ProbeTask.getInstance({
    backend,
    keystoreService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storage: storage as any,
  });

  probe.run();
});

addMethod('wallet_fullOwnership_getOffChainLocks', async (payload) => {
  console.log('====================================');
  console.log('wallet_fullOwnership_getOffChainLocks');
  const servicesFactory = createServicesFactory();
  const keystoreService = await servicesFactory.get('keystoreService');
  const notificationService = await servicesFactory.get('notificationService');
  const storage = await servicesFactory.get('storage');
  console.log('storage', await storage.getItem('full' as never));
  const backend = BackendProvider.getDefaultBackend();

  const { fullOwnershipService } = createOwnershipServices({
    backend,
    keystoreService,
    notificationService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    locksManager: new LocksManager({ storage: storage as any }),
  });
  console.log('====================================');
  return await fullOwnershipService.getOffChainLocks(payload);
});

addMethod('wallet_fullOwnership_getOnChainLocks', async (payload) => {
  console.log('====================================');
  console.log('wallet_fullOwnership_getOnChainLocks');
  const servicesFactory = createServicesFactory();
  const keystoreService = await servicesFactory.get('keystoreService');
  const notificationService = await servicesFactory.get('notificationService');
  const storage = await servicesFactory.get('storage');
  console.log('storage', await storage.getItem('full' as never));
  const backend = BackendProvider.getDefaultBackend();
  console.log('probe instance:', probe);

  const { fullOwnershipService } = createOwnershipServices({
    backend,
    keystoreService,
    notificationService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    locksManager: new LocksManager({ storage: storage as any }),
  });
  console.log('====================================');
  return await fullOwnershipService.getOnChainLocks(payload);
});

addMethod('wallet_fullOwnership_getLiveCells', async (payload) => {
  console.log('====================================');
  console.log('wallet_fullOwnership_getLiveCells', payload);
  const servicesFactory = createServicesFactory();
  const keystoreService = await servicesFactory.get('keystoreService');
  const notificationService = await servicesFactory.get('notificationService');
  const storage = await servicesFactory.get('storage');
  console.log('storage', await storage.getItem('full' as never));
  const backend = BackendProvider.getDefaultBackend();

  const { fullOwnershipService } = createOwnershipServices({
    backend,
    keystoreService,
    notificationService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    locksManager: new LocksManager({ storage: storage as any }),
  });
  console.log('====================================');
  return await fullOwnershipService.getLiveCells(payload);
});
addMethod('wallet_fullOwnership_signData', async (payload) => {
  console.log('====================================');
  console.log('wallet_fullOwnership_getLiveCells', payload);
  const servicesFactory = createServicesFactory();
  const keystoreService = await servicesFactory.get('keystoreService');
  const notificationService = await servicesFactory.get('notificationService');
  const storage = await servicesFactory.get('storage');
  console.log('storage', await storage.getItem('full' as never));
  const backend = BackendProvider.getDefaultBackend();

  const { fullOwnershipService } = createOwnershipServices({
    backend,
    keystoreService,
    notificationService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    locksManager: new LocksManager({ storage: storage as any }),
  });
  console.log('====================================');
  return await fullOwnershipService.signData(payload);
});
addMethod('wallet_fullOwnership_signTransaction', async (payload) => {
  console.log('====================================');
  console.log('wallet_fullOwnership_getLiveCells', payload);
  const servicesFactory = createServicesFactory();
  const keystoreService = await servicesFactory.get('keystoreService');
  const notificationService = await servicesFactory.get('notificationService');
  const storage = await servicesFactory.get('storage');
  console.log('storage', await storage.getItem('full' as never));
  const backend = BackendProvider.getDefaultBackend();

  const { fullOwnershipService } = createOwnershipServices({
    backend,
    keystoreService,
    notificationService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    locksManager: new LocksManager({ storage: storage as any }),
  });
  console.log('====================================');
  return await fullOwnershipService.signTransaction(payload);
});
