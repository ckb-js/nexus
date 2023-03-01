import './patch';
import '../rpc/walletImpl';
import '../rpc/debugImpl';
import { createLogger, LIB_VERSION } from '@nexus-wallet/utils';
import { Endpoint, onMessage } from 'webext-bridge';
import { createServer } from '../rpc';
import { makeBrowserExtensionModulesFactory, ModulesFactory } from '../services';
import { createWatchtower } from '../services/ownership';
import { createScriptInfoDb, OwnershipStorage } from '../services/ownership/storage';

const logger = createLogger();
logger.info(`Hi, this is Nexus@%s`, LIB_VERSION);
if (process.env.NODE_ENV === 'development') {
  logger.info('Debug mode enabled!');
}

const factory = makeBrowserExtensionModulesFactory();
const server = createServer<Endpoint>(factory);
void runWatchtower(factory);

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

async function runWatchtower(factory: ModulesFactory) {
  try {
    const configService = factory.get('configService');
    const keystoreService = factory.get('keystoreService');
    const backendProvider = factory.get('backendProvider');
    const storage = factory.get('storage') as OwnershipStorage;
    const selectedNetwork = await configService.getSelectedNetwork();
    const db = createScriptInfoDb({ storage, networkId: selectedNetwork.id });
    const watchtower = createWatchtower({ db, keystoreService, backend: await backendProvider.resolve() });
    watchtower.run();
  } catch (error) {
    logger.info('main.ts: start watchtower failed', error);
  }
}
