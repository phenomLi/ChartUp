const webpack = require('webpack');

module.exports = {
    entry: "./ChartUp.ts",
    output:{
        filename: "./ChartUp-dev-es2015.js"
    },
    module: {
        rules:[{
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        }],
    },  　
};
