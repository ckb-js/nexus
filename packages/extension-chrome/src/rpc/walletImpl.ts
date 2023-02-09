import { addMethod } from './server';
import { errors } from '@nexus-wallet/utils';

addMethod('wallet_enable', async (_, { getRequesterAppInfo, resolveService }) => {
  const grantService = await resolveService('grantService');
  const { url } = await getRequesterAppInfo();

  const { host } = new URL(url);

  const isGranted = await grantService.getIsGranted({ host });
  if (isGranted) return;

  const granted = await grantService.getIsGranted({ host });
  if (granted) return;

  const notificationService = await resolveService('notificationService');
  try {
    await notificationService.requestGrant({ url });
  } catch {
    errors.throwError('User has rejected');
  }

  await grantService.grant({ host });
});

addMethod('wallet_fullOwnership_getOffChainLocks', () => {
  // TODO implement me, this is just a mock
  return [
    {
      codeHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      hashType: 'type',
      args: '0x0000000000000000000000000000000000000000',
    },
  ];
});
