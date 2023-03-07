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

let watchtowerLaunched = false;
// TODO: optimize me, run watchtower on event `walletInitialized`
let handler = setInterval(async () => {
  logger.info('try to launch watchtower');
  void initWatchtowerAndRun(factory);
}, 10_1000);

// TODO eventHub is not working, need to find a way to send event from content script to background script

// send event data to content script
// const eventHub = factory.get('eventHub');
// eventHub.on('walletInitialized', async () => {
//   logger.info('listener detectc event: walletInitialized');
//   void initWatchtowerAndRun(factory);
// })
// eventHub.on('networkChanged', async (networkName) => {
//   logger.info('listener detectc event: networkChanged', networkName);
//   const tabs = await browser.tabs.query({});
//   // TODO optimize me, only send to subscribed tabs
//   tabs.forEach((tab) => {
//     if (!tab.id) return;
//     void sendMessage('event', { eventName: 'networkChanged', params: [networkName] }, `content-script@${tab.id}`);
//   });
// });

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

// TODO: listen for `networkChanged` event and restart the watchtower
async function initWatchtowerAndRun(factory: ModulesFactory): Promise<void> {
  const configService = factory.get('configService');
  const keystoreService = factory.get('keystoreService');
  if (watchtowerLaunched || !(await keystoreService.hasInitialized())) {
    return;
  }
  const backendProvider = factory.get('backendProvider');
  const storage = factory.get('storage') as OwnershipStorage;
  const selectedNetwork = await configService.getSelectedNetwork();
  const db = createScriptInfoDb({ storage, networkId: selectedNetwork.id });
  const watchtower = createWatchtower({
    db,
    keystoreService,
    backend: await backendProvider.resolve(),
    configService,
  });
  void watchtower.run();
  watchtowerLaunched = true;
  clearInterval(handler);
  logger.info('watchtower launched');
}
