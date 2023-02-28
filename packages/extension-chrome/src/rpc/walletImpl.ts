import { TransactionSkeletonObject } from '@ckb-lumos/helpers';
import { RPC, helpers } from '@ckb-lumos/lumos';
import { createLogger, errors } from '@nexus-wallet/utils';
import { addMethod } from './server';

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

addMethod('wallet_fullOwnership_signData', async ({ data }, { getRequesterAppInfo, resolveService }) => {
  const notificationService = resolveService('notificationService');

  const { url } = await getRequesterAppInfo();

  try {
    const { password: _password } = await notificationService.requestSignData({ data, url });
    return 'mooooooock signed message';
    // TODO: use the password sign message
  } catch {
    errors.throwError('User has rejected');
  }
});

// TODO: use the password for signing transaction
addMethod('wallet_fullOwnership_signTransaction', async ({ transaction }, { resolveService }) => {
  const notificationService = resolveService('notificationService');
  const configService = resolveService('configService');
  const config = await configService.getConfig();
  const rpcUrl = config.networks.find((network) => network.id === config.selectedNetwork)?.rpcUrl;
  if (!rpcUrl) errors.throwError('Internal error: can not find selected network');
  const rpc = new RPC(rpcUrl);

  let skeleton: TransactionSkeletonObject;
  try {
    const _skeleton = await helpers.createTransactionSkeleton(transaction, async (outpoint) => {
      const { cell } = await rpc.getLiveCell(outpoint, true);
      return { data: cell.data.content, outPoint: outpoint, cellOutput: cell.output };
    });
    skeleton = helpers.transactionSkeletonToObject(_skeleton);

    skeleton.inputs.some((it) => it === null) &&
      errors.throwError('Can not fetch your input cells, please check they are all valid and live.');
  } catch (e) {
    errors.throwError(`Can not fetch the cell.`);
  }

  try {
    const { password: _password } = await notificationService.requestSignTransaction({
      tx: skeleton,
    });
    // TODO: use the password sign transaction
    return 'mooooock signed transaction witness';
  } catch {
    errors.throwError('User has rejected');
  }
});
