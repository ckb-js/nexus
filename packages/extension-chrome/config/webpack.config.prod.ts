import { merge } from 'webpack-merge';
import common from './webpack.config.common';
import { paths } from './env';

const config = merge(common, {
  mode: 'production',
  output: {
    filename: 'js/[name].[contenthash:8].min.js',
    path: paths.resolve('/build'),
  },
  devtool: 'source-map',
});

export default config;
