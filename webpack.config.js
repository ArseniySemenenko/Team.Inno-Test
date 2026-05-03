const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports = {
  module: {
      rules: [
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, "css-loader"], // Replaces style-loader
        },
      ],
    },
  devServer: {
     static: './dist', // Folder to serve
     hot: true,        // Enable HMR (default in v4+)
     open: true        // Automatically open the browser
   },
  mode: 'development',
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Cleans the dist folder before each build
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.html', // Path to your source HTML
    }),
    new CopyWebpackPlugin({
          patterns: [
            {
              from: path.resolve(__dirname, 'assets'),
              to: path.resolve(__dirname, 'dist/assets')
        },
        {
          from: "./style.css",
          to: path.resolve(__dirname, 'dist/')
            }
          ]
        }),
  ],
};