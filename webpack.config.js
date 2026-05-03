const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Cleans the dist folder before each build
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html', // Path to your source HTML
    }),
    new CopyWebpackPlugin({
          patterns: [
            {
              from: path.resolve(__dirname, 'public'),
              to: path.resolve(__dirname, 'dist/assets')
            }
          ]
        }),
  new Mo
  ],
};