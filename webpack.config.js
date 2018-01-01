const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    dev_client: './devtool/index.ts',
    devtool_test: './devtool/index.test.ts',
    devtool: "./devtool/init.ts",
    background: "./background/index.ts",
    background_test: "./background/index.test.ts",
    content_script: "./content_script/index.ts",
    content_script_test: "./content_script/index.test.ts",
    emb: "./emb/index.ts"
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
    contentBase: [path.resolve(__dirname, 'test'), path.resolve(__dirname, 'dist')],
    historyApiFallback: true,
    noInfo: true,
  }
};