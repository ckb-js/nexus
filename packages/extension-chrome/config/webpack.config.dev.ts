import { merge } from 'webpack-merge';
import common from './webpack.config.common';
import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { WebpackConfiguration } from 'webpack-dev-server';
import { env } from './env';

const config: WebpackConfiguration = merge(common, {
  mode: 'development',
  output: {
    chunkFilename: 'static/js/[name].chunk.js',
  },
  devServer: {
    port: env.PORT,
    devMiddleware: {
      writeToDisk: true,
    },
    client: {
      webSocketURL: `ws://127.0.0.1:${env.PORT}/ws`,
    },
    webSocketServer: {},
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  devtool: 'cheap-module-source-map',
  plugins: [new ReactRefreshPlugin()],
});

export default config;
