const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    dev_client: './devtool/dev_client.tsx',
    devtool:"./devtool/devtool.ts",
    background:"./background/background.ts",
    content_script:"./content_script/content_script.ts"
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
    // rules: [
    //   {
    //     test: /\.js$/,
    //     exclude: /node_modules/,
    //     loader: 'babel-loader',
    //     options: {
    //       presets: ['react', 'es2015', 'react-hmre']
    //     },
    //   },
    // ],
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './public/',
    port: 8080,
    inline: true,
    historyApiFallback: true,
    clientLogLevel: "info",
    stats: { colors: true }
  }
};