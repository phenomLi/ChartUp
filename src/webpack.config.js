const webpack = require('webpack');

module.exports = {
    entry: "./ChartUp.ts",
    output:{
        filename: "./ChartUp.js"
    },
    module: {
        rules:[{
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        }],
    },  　
};
