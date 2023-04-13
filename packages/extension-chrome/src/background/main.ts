import './patch';
import '../rpc/walletImpl';
import '../rpc/debugImpl';
import '../rpc/ckbImpl';
import { createLogger, LIB_VERSION } from '@nexus-wallet/utils';
import { Endpoint } from 'webext-bridge';
import { onMessage } from 'webext-bridge/background';
import { createServer } from '../rpc';
import { makeBrowserExtensionModulesFactory } from '../services';
import { createDaemonWatchtower } from '../services/ownership/watchtower/daemon';

const logger = createLogger();
logger.info(`Hi, this is Nexus@%s`, LIB_VERSION);
if (process.env.NODE_ENV === 'development') {
  logger.info('Debug mode enabled!');
}

const factory = makeBrowserExtensionModulesFactory();
const server = createServer<Endpoint>(factory);

void createDaemonWatchtower(factory).run();

// listen message from content script
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
onMessage('rpc', async ({ data, sender }) => {
  logger.info(`RPC start`, data);
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await server.handleRequest({ request: data, sender: sender });
    logger.info(`RPC end`, result);
    return result;
  } catch (error) {
    throw error;
  }
});
