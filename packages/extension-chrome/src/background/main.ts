import { onMessage } from 'webext-bridge';
import { createRpcServerParams, server } from '../rpc/server';
import '../rpc/walletImpl';

// listen message from content script
onMessage('rpc', async ({ data, sender }) => server.receive(data, createRpcServerParams({ endpoint: sender })));
