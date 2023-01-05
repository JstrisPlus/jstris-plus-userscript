'use strict';

var path = require('path');
const webpack = require('webpack'); //to access built-in plugins

module.exports = {
    mode: 'development',
    context: __dirname,
    entry: './src/index.js',
    module: {
        rules: [{ test: /\.css$/, use: 'raw-loader' }],
      },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.HOST': JSON.stringify(process.env.HOST)
        })
    ],
    devServer: {
        static: {
            directory: path.resolve(__dirname, ''),
        },
        hot: true,
        open: false,
        compress: true,
        historyApiFallback: true,
        allowedHosts: [
            'jstris.jezevec10.com'
        ],
        client: {
            webSocketURL: 'ws://localhost:8080/ws',
        },
    },
    output: {
        path: __dirname,
        publicPath: '/',
        filename: 'bundle.js'
    },
    optimization: {
        minimize: false,
    }
};

if(process.env.NODE_ENV === 'development')
    //module.exports.devtool = 'cheap-module-eval-source-map';
    module.exports.devtool = 'eval-cheap-module-source-map';
