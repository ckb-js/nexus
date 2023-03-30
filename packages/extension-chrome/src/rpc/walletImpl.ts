import { createLogger, errors } from '@nexus-wallet/utils';
import {
  ZGetLiveCellsPayload,
  ZGetOffChainLocksPayload,
  ZGetOnChainLocksPayload,
  ZSignDataPayload,
  ZSignTransactionPayload,
} from './schema';
import { addMethod, addMethodValidator } from './server';

const logger = createLogger();

addMethod('wallet_enable', async (_, { getRequesterAppInfo, resolveService }) => {
  const configService = resolveService('configService');

  const { url } = await getRequesterAppInfo();
  const { host } = new URL(url);

  logger.info(`wallet_enable: %s`, url);

  const { whitelist } = await configService.getConfig();

  const isTrusted = whitelist.find((item) => item.host === host);
  if (isTrusted) {
    return { nickname: await configService.getNickname() };
  }

  try {
    const notificationService = resolveService('notificationService');
    await notificationService.requestGrant({ url });
  } catch {
    errors.throwError('User has rejected');
  }

  await configService.addWhitelistItem({ host: host });
  return { nickname: await configService.getNickname() };
});

addMethod('wallet_fullOwnership_getOffChainLocks', async (payload, { resolveService }) => {
  const fullOwnershipService = await resolveService('fullOwnershipService');
  return await fullOwnershipService.getOffChainLocks(payload);
});
addMethodValidator('wallet_fullOwnership_getOffChainLocks', ZGetOffChainLocksPayload);

addMethod('wallet_fullOwnership_getOnChainLocks', async (payload, { resolveService }) => {
  const fullOwnershipService = await resolveService('fullOwnershipService');
  return await fullOwnershipService.getOnChainLocks(payload);
});
addMethodValidator('wallet_fullOwnership_getOnChainLocks', ZGetOnChainLocksPayload);

addMethod('wallet_fullOwnership_getLiveCells', async (payload, { resolveService }) => {
  const fullOwnershipService = await resolveService('fullOwnershipService');
  return await fullOwnershipService.getLiveCells(payload);
});
addMethodValidator('wallet_fullOwnership_getLiveCells', ZGetLiveCellsPayload);

addMethod('wallet_fullOwnership_signData', async (payload, { getRequesterAppInfo, resolveService }) => {
  const requesterInfo = await getRequesterAppInfo();
  const fullOwnershipService = await resolveService('fullOwnershipService');
  return await fullOwnershipService.signData({ ...payload, ...requesterInfo });
});
addMethodValidator('wallet_fullOwnership_signData', ZSignDataPayload);

addMethod('wallet_fullOwnership_signTransaction', async (payload, { getRequesterAppInfo, resolveService }) => {
  const requesterInfo = await getRequesterAppInfo();
  const fullOwnershipService = await resolveService('fullOwnershipService');
  return await fullOwnershipService.signTransaction({ ...payload, ...requesterInfo });
});
addMethodValidator('wallet_fullOwnership_signTransaction', ZSignTransactionPayload);
