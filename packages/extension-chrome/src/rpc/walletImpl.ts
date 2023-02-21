import { createLogger, errors } from '@nexus-wallet/utils';
import { addMethod } from './server';

const logger = createLogger();

addMethod('wallet_enable', async (_, { getRequesterAppInfo, resolveService }) => {
  const configService = await resolveService('configService');

  const { url } = await getRequesterAppInfo();
  const { host, protocol } = new URL(url);

  logger.info(`wallet_enable: %s`, url);

  const { whitelist } = await configService.getConfig();

  const isTrusted = whitelist.find((item) => item.host === host);
  if (isTrusted) return;

  try {
    const notificationService = resolveService('notificationService');
    await notificationService.requestGrant({ url });
  } catch {
    errors.throwError('User has rejected');
  }

  await configService.addWhitelistItem({ host: host, favicon: `${protocol}//${host}/favicon.ico` });
});

addMethod('wallet_fullOwnership_signData', async ({ data }, { getRequesterAppInfo, resolveService }) => {
  const notificationService = resolveService('notificationService');
  const { url } = await getRequesterAppInfo();
  try {
    const { password: _password } = await notificationService.requestSignData({ data, url });
    return 'mooooooock signed message';
    // return keystoreService.signMessage({  })
  } catch {
    errors.throwError('User has rejected');
  }
});
