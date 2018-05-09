const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV || 'production',
  entry: {
    background: './src/background',
    content_script: './src/content_script',
    popup: './src/popup',
  },
  output: {
    path: path.resolve(__dirname, 'extension', 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [{
      exclude: /node_modules/,
      test: /\.(js|jsx)$/,
      use: ['babel-loader'],
    }],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devtool: 'sourcemap',
};
