const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  watchOptions: {
    ignored: /node_modules/,
  },
  devServer: {
    liveReload: true,
    hot: true,
    open: true,
    static: [{
      directory: './',
      watch: {
        ignored: /node_modules/,
      },
    }],
  },
});
