import { merge } from 'webpack-merge';
import common from './webpack.config.common';
import { paths } from './env';

const config = merge(common, {
  mode: 'production',
  output: {
    filename: '[name].js',
    path: paths.resolve('/build'),
  },
  devtool: 'source-map',
});

export default config;
