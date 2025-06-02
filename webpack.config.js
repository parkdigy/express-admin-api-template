/* eslint-disable */
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { EsbuildPlugin } = require('esbuild-loader');
const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
/* eslint-enable */

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  target: 'node',
  stats: isProduction,
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      '@common': path.resolve(__dirname, 'src/common'),
      '@common_aes256': path.resolve(__dirname, 'src/common/aes256'),
      '@common_aws': path.resolve(__dirname, 'src/common/aws'),
      '@common_big': path.resolve(__dirname, 'src/common/Big'),
      '@common_crypt': path.resolve(__dirname, 'src/common/crypt'),
      '@common_env': path.resolve(__dirname, 'src/common/env'),
      '@common_excel': path.resolve(__dirname, 'src/common/excel'),
      '@common_jwt': path.resolve(__dirname, 'src/common/jwt'),
      '@common_logging': path.resolve(__dirname, 'src/common/logging'),
      '@common_mail': path.resolve(__dirname, 'src/common/mail'),
      '@common_param': path.resolve(__dirname, 'src/common/param'),
      '@common_text': path.resolve(__dirname, 'src/common/text'),
      '@common_util': path.resolve(__dirname, 'src/common/util'),
      '@common_api': path.resolve(__dirname, 'src/common/api'),
      '@controllers': path.resolve(__dirname, 'src/controllers'),
      '@middlewares': path.resolve(__dirname, 'src/middlewares'),
      '@types': path.resolve(__dirname, 'src/@types'),
      '@db': path.resolve(__dirname, 'src/db'),
      '@db_models': path.resolve(__dirname, 'src/db/models'),
      '@db_models_types': path.resolve(__dirname, 'src/db/models/@types'),
      '@db_models_util': path.resolve(__dirname, 'src/db/models/@util'),
      '@db_query_common': path.resolve(__dirname, 'src/db/query/@common'),
    },
  },
  entry: {
    main: './src/app.ts',
  },
  output: {
    path: path.join(__dirname, isProduction ? 'dist' : '@dev'),
    filename: 'app.js',
  },
  externals: {
    express: 'commonjs express',
    knex: 'commonjs knex',
  },
  experiments: {
    topLevelAwait: true,
  },
  optimization: {
    minimize: isProduction,
    minimizer: [
      new EsbuildPlugin({
        target: 'es2015',
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.(ts)$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        loader: 'esbuild-loader',
        options: {
          target: 'es2015',
        },
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new ESLintPlugin({
      extensions: ['js', 'jsx', 'ts', 'tsx'],
      failOnError: isProduction,
      exclude: [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, 'dist')],
    }),
  ].filter(Boolean),
};
