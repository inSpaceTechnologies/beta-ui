/* eslint-disable import/no-extraneous-dependencies */

const merge = require('webpack-merge');
const Dotenv = require('dotenv-webpack');

const common = require('./webpack.common.js');

module.exports = merge(common, {
  plugins: [
    new Dotenv({
      path: './env/dev.env',
    }),
  ],
});
