'use strict';

var CleanWebpackPlugin = require('clean-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // Entry point for static analyzer
  entry: './index.js',

  output: {
    // Where to build results
    path: './build',

    // Filename to use in HTML
    filename: 'webpack-bundle.js'
  },
  debug: true,
  devtool: 'cheap-source-map',
  plugins: [
    new CleanWebpackPlugin([
      './build'
    ]),
    new HtmlWebpackPlugin({
      template: 'index.html', // Load a custom template
      inject: 'body' // Inject all scripts into the body
    })
  ],
  module: {
    loaders: [
      {
        test: /\.md$/,
        loader: 'markdown-with-front-matter'
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.html$/,
        loader: 'html?attrs=img:src'
      },
      {
        test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
        loader: 'url'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /(node_modules|web_client)/,
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
};
