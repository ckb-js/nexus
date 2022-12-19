import { merge } from 'webpack-merge';
import common from './webpack.config.common';
import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { WebpackConfiguration } from 'webpack-dev-server';
import * as env from './env';
import webpack from 'webpack';
import { propStr } from './utils';

const { PORT } = env.env;

const config: WebpackConfiguration = merge(common, {
  mode: 'development',
  entry: {
    popup: buildHmrEntry(propStr(common.entry, 'popup')),
  },
  output: {
    chunkFilename: 'static/js/[name].chunk.js',
  },
  devServer: {
    port: PORT,
    allowedHosts: 'all',
    hot: false,
    client: false,
    devMiddleware: { writeToDisk: true },
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  devtool: 'cheap-module-source-map',
  plugins: [new webpack.HotModuleReplacementPlugin(), new ReactRefreshPlugin()],
});

export function buildHmrEntry(entry: string | string[]): string[] {
  return ['webpack/hot/dev-server', `webpack-dev-server/client?hot=true&hostname=localhost&port=${PORT}`].concat(entry);
}

export default config;
