import './patch';
import '../rpc/walletImpl';
import '../rpc/debugImpl';
import { createLogger, LIB_VERSION } from '@nexus-wallet/utils';
import { Endpoint, onMessage } from 'webext-bridge';
import { createServer } from '../rpc';
import { makeBrowserExtensionModulesFactory } from '../services';

const logger = createLogger();
logger.info(`Hi, this is Nexus@%s`, LIB_VERSION);
if (process.env.NODE_ENV === 'development') {
  logger.info('Debug mode enabled!');
}

const factory = makeBrowserExtensionModulesFactory();
const server = createServer<Endpoint>(factory);

// listen message from content script
onMessage('rpc', async ({ data, sender }) => {
  logger.info(`RPC start`, data);
  try {
    const result = await server.handleRequest({ request: data, sender: sender });
    logger.info(`RPC end`, result);
    return result;
  } catch (error) {
    throw error;
  }
});
