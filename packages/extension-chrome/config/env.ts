import path from 'node:path';
import { Configuration } from 'webpack';

export const env = {
  NODE_ENV: (process.env.NODE_ENV || 'development') as Configuration['mode'],
  PORT: process.env.PORT || 3000,
  PUBLIC_URL: process.env.PUBLIC_URL || '/',
};

export const paths = {
  resolve: (...paths: string[]): string => path.join(__dirname, '../', ...paths),
};
