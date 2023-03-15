import { createLogger, errors } from '@nexus-wallet/utils';
import { addMethod } from './server';

const logger = createLogger();

addMethod('wallet_enable', async (_, { getRequesterAppInfo, resolveService }) => {
  const configService = resolveService('configService');

  const response = { nickname: await configService.getNickname() };

  const { url } = await getRequesterAppInfo();
  const { host, protocol } = new URL(url);

  logger.info(`wallet_enable: %s`, url);

  const { whitelist } = await configService.getConfig();

  const isTrusted = whitelist.find((item) => item.host === host);
  if (isTrusted) return response;

  try {
    const notificationService = resolveService('notificationService');
    await notificationService.requestGrant({ url });
  } catch {
    errors.throwError('User has rejected');
  }

  await configService.addWhitelistItem({ host: host, favicon: `${protocol}//${host}/favicon.ico` });

  return response;
});

addMethod('wallet_fullOwnership_getOffChainLocks', async (payload, { resolveService }) => {
  const fullOwnershipService = await resolveService('fullOwnershipService');
  return await fullOwnershipService.getOffChainLocks(payload);
});

addMethod('wallet_fullOwnership_getOnChainLocks', async (payload, { resolveService }) => {
  const fullOwnershipService = await resolveService('fullOwnershipService');
  return await fullOwnershipService.getOnChainLocks(payload);
});

addMethod('wallet_fullOwnership_getLiveCells', async (payload, { resolveService }) => {
  const fullOwnershipService = await resolveService('fullOwnershipService');
  return await fullOwnershipService.getLiveCells(payload);
});

addMethod('wallet_fullOwnership_signData', async (payload, { getRequesterAppInfo, resolveService }) => {
  const requesterInfo = await getRequesterAppInfo();
  const fullOwnershipService = await resolveService('fullOwnershipService');
  return await fullOwnershipService.signData({ ...payload, ...requesterInfo });
});

addMethod('wallet_fullOwnership_signTransaction', async (payload, { getRequesterAppInfo, resolveService }) => {
  const requesterInfo = await getRequesterAppInfo();
  const fullOwnershipService = await resolveService('fullOwnershipService');
  return await fullOwnershipService.signTransaction({ ...payload, ...requesterInfo });
});
