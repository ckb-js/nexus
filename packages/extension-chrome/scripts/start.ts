import Webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import rimraf from 'rimraf';
import { env } from '../config/env';
import { pageConfig, backgroundConfig } from '../config/webpack.config.dev';
import path from 'path';
import { WebSocketServer } from 'ws';

const pageCompiler = Webpack(pageConfig);
const backgroundCompiler = Webpack(backgroundConfig);

const server = new WebpackDevServer(pageConfig.devServer, pageCompiler);

async function start() {
  rimraf.sync(path.resolve(__dirname, '../build'));
  await server.start();
  const wss = new WebSocketServer({ port: env.BACKGROUND_RELOAD_PORT });
  backgroundCompiler.watch({}, (err, stats) => {
    const output = stats?.toString({
      colors: true,
    });
    if (output) {
      console.log(output);
    }

    wss.clients.forEach((ws) => {
      ws.send(JSON.stringify({ type: 'update', payload: {} }));
    });
  });
}

start();

// for Windows Ctrl + C
process.on('SIGINT', () => {
  process.exit();
});
