// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

// https://stackoverflow.com/questions/44008674/how-to-import-the-electron-ipcrenderer-in-a-react-webpack-2-setup
const webpack = require('webpack');

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new webpack.ExternalsPlugin('commonjs', [
    'electron'
  ]),
  // https://github.com/ipfs/js-ipfs/blob/master/examples/browser-webpack/webpack.config.js
  new webpack.ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
    process: 'process/browser'
  })
];
