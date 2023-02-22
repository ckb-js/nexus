import { createLogger, errors } from '@nexus-wallet/utils';
import {} from '@ckb-lumos/codec';
import { addMethod } from './server';
// import { bytes } from '@ckb-lumos/codec';

const logger = createLogger();

addMethod('wallet_enable', async (_, { getRequesterAppInfo, resolveService }) => {
  const configService = resolveService('configService');

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

addMethod('wallet_fullOwnership_signData', async (payload, { getRequesterAppInfo, resolveService }) => {
  const notificationService = resolveService('notificationService');
  let { data } = payload;

  // if (typeof data === 'string') {
  //   data = /0x[0-9a-f]{2}+/.test(data) ? bytes.bytifyRawString(data) : bytes.bytify(data);
  // } else {
  //   data = bytes.bytify(data);
  // }

  const { url } = await getRequesterAppInfo();

  try {
    const { password: _password } = await notificationService.requestSignData({ data, url });
    return 'mooooooock signed message';
    // return keystoreService.signMessage({  })
  } catch {
    errors.throwError('User has rejected');
  }
});
