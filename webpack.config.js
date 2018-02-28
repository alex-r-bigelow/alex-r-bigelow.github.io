'use strict';

var path = require('path');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // Entry point for static analyzer
  entry: './index.js',

  output: {
    // Where to build results
    path: path.join(__dirname, '../alex-r-bigelow-deploy'),

    // Filename to use in HTML
    filename: 'webpack-bundle.js'
  },
  devtool: 'cheap-source-map',
  plugins: [
    new CleanWebpackPlugin([
      '../alex-r-bigelow-deploy'
    ], {
      verbose: true,
      dry: false,
      exclude: ['.git', 'README.md', 'LICENSE']
    }),
    new HtmlWebpackPlugin({
      template: 'index.html', // Load a custom template
      inject: 'body' // Inject all scripts into the body
    })
  ],
  module: {
    rules: [
      {
        test: /\.htaccess$/,
        loader: 'file-loader',
        query: {
          name: '.htaccess'
        }
      },
      {
        test: /\.md$/,
        loader: 'markdown-with-front-matter-loader'
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader']
      },
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.html$/,
        loader: 'html-loader?attrs=img:src'
      },
      {
        test: /\.jpe?g$|\.gif$|\.png$|(?!template\b)\b\w+\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
        loader: 'url-loader'
      },
      {
        test: /template\.svg$/,
        loader: 'html-loader',
        query: {
          attrs: 'image:xlink:href'
        }
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
  },
  resolve: {
    alias: {
      'd3': path.resolve(__dirname, 'lib/d3.min.js')
    }
  }
};
