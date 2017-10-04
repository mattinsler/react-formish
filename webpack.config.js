const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: [path.join(__dirname, 'src', 'index')],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
    library: 'ReactFormish'
  },
  devtool: 'source-map',
  externals: {
    'prop-types': {
      root: 'PropTypes',
      commonjs2: 'prop-types',
      commonjs: 'prop-types',
      amd: 'prop-types'
    },
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react'
    }
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/ }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx']
  }
};
