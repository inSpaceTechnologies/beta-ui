/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');


module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.common.js',
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.css$/,
        loader: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        loader: 'file-loader',
      },

    ],
  },
  plugins: [
    new VueLoaderPlugin(),
  ],
};
