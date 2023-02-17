import './patch';
import { onMessage } from 'webext-bridge';
import { createLogger, LIB_VERSION } from '@nexus-wallet/utils';
import { createRpcServerParams, server } from '../rpc/server';

import '../rpc/walletImpl';
import '../rpc/debugImpl';

const logger = createLogger();
logger.info(`Hi, this is Nexus@%s`, LIB_VERSION);

// listen message from content script
onMessage('rpc', async ({ data, sender }) => {
  logger.info(`RPC start`, data);
  try {
    const result = await server.receive(data, createRpcServerParams({ endpoint: sender }));
    logger.info(`RPC end`, result);
    return result;
  } catch (error) {
    throw error;
  }
});
