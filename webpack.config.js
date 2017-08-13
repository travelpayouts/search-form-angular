/**
 * Created by andrey on 26/01/17.
 */
const webpack = require('webpack');
const path = require('path');
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var NpmInstallPlugin = require('npm-install-webpack-plugin');
var result;

module.exports = function makeWebpackConfig() {
    result = {
        context: __dirname,
        target: "web",
        entry: {
            'tpSearchComponent': [
                './src/module.js',
                './src/scss/module.scss'
            ]
        },
        output: {
            path: __dirname + "/dist/",
            publicPath: "./",
            filename: "[name].js",
        },
        module: {
            rules: [
                {
                    test: /\.s(c|a)ss$/,
                    use: ExtractTextPlugin.extract({
                        fallback: "style-loader",
                        use: [
                            {loader: 'css-loader', options: {importLoaders: 3, sourceMap: true}},
                            'sass-loader'
                        ]
                    })
                },
                {
                    test: /\.css$/,
                    use: ExtractTextPlugin.extract({
                        fallback: "style-loader",
                        use: 'css-loader'
                    })
                },
                {
                    test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    use: "url-loader?limit=10000&mimetype=application/font-woff"
                },
                {test: /\.(ttf|eot|png|jpg|gif)(\?v=[0-9]\.[0-9]\.[0-9])?$/, use: "file-loader"},
                {test: require.resolve("jquery"), loader: "expose-loader?$!expose-loader?jQuery"},
                {
                    test: /\.html$/,
                    use: [{
                        loader: 'html-loader',
                        options: {
                            minimize: true
                        }
                    }]
                },
                {
                    test: /\.svg/,
                    use: {
                        loader: 'svg-url-loader',
                    }
                }
            ]
        },
        plugins: [
            new webpack.ProvidePlugin({
                "window.moment": "moment",
                moment: "moment"
            }),
            new ExtractTextPlugin({filename: "[name].styles.css", allChunks: true}),
            new NpmInstallPlugin(),
            new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /(en|ru)/),
        ],
        externals: {
            'angular': 'angular',
            'jquery': 'jquery'
        }
    };
    return result;
};