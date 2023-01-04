import { merge } from 'webpack-merge';
import * as common from './webpack.config.common';
import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import InjectPlugin from 'webpack-inject-plugin';
import { WebpackConfiguration } from 'webpack-dev-server';
import * as env from './env';
import webpack from 'webpack';
import fs from 'fs';
import path from 'path';
import { propStr } from './utils';

const { PORT, BACKGROUND_RELOAD_PORT } = env.env;
const backgroundReloadHelper = fs.readFileSync(path.resolve(__dirname, './backgroundReloadHelper.js'), 'utf-8');

export const pageConfig: WebpackConfiguration = merge(common.pageConfig, {
  mode: 'development',
  entry: {
    popup: buildHmrEntry(propStr(common.pageConfig.entry, 'popup')),
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

function buildHmrEntry(entry: string | string[]): string[] {
  return ['webpack/hot/dev-server', `webpack-dev-server/client?hot=true&hostname=localhost&port=${PORT}`].concat(entry);
}

export const backgroundConfig = merge(common.backgroundConfig, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.BACKGROUND_RELOAD_PORT': JSON.stringify(BACKGROUND_RELOAD_PORT),
    }),
    new InjectPlugin(() => {
      return backgroundReloadHelper;
    }),
  ],
});
