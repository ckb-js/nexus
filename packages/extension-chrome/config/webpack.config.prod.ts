import { merge } from 'webpack-merge';
import * as common from './webpack.config.common';
import { paths } from './env';

const configs = [common.pageConfig, common.backgroundConfig].map((config) =>
  merge(config, {
    mode: 'production',
    output: {
      filename: '[name].js',
      path: paths.resolve('/build'),
    },
    devtool: 'source-map',
  }),
);

export default configs;
