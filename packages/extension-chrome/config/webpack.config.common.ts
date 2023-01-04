import { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as env from './env';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import merge from 'webpack-merge';
import { __DEV__ } from './env';

const configExcludeEntry: Configuration = {
  output: {
    path: env.paths.resolve('/build'),
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  context: env.paths.resolve('/'),
  module: {
    rules: [
      {
        test: [/\.jsx?$/, /\.tsx?$/],
        use: [
          {
            loader: 'babel-loader',
            options: {
              rootMode: 'upward',
              plugins: [__DEV__ && require.resolve('react-refresh/babel')].filter(Boolean),
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(jpe?g|png|gif|svg|ttf|woff|woff2)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'static/media/[name].[hash].[ext]',
            },
          },
        ],
      },
    ],
  },

  infrastructureLogging: { level: 'info' },
};

export const pageConfig: Configuration = merge(configExcludeEntry, {
  entry: {
    popup: env.paths.resolve('/src/pages/Popup/index.tsx'),
  },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: env.paths.resolve('public'), to: env.paths.resolve('build') }],
    }),
    new HtmlWebpackPlugin({
      filename: 'popup.html',
      chunks: ['popup'],
      template: env.paths.resolve('src/pages/Popup/index.html'),
      cache: false,
    }),
    new ForkTsCheckerWebpackPlugin(),
  ],
});

export const backgroundConfig = merge(configExcludeEntry, {
  entry: {
    content: env.paths.resolve('/src/contentScript/content.ts'),
    inpage: env.paths.resolve('/src/contentScript/inpage.ts'),
    background: env.paths.resolve('/src/background/main.ts'),
  },
});
