require('dotenv').config()

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const commandLineArgs = require('command-line-args')
const webpackMerge = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin')
const cssnano = require('cssnano')
const CopyPlugin = require('copy-webpack-plugin')
const { DefinePlugin } = require('webpack')

const args = commandLineArgs([
    { name: 'watch', type: Boolean }
])

const devMode = true === args.watch ||
    process.argv.filter(
        (arg) => arg.match(/webpack-dev-server$/)
    ).length > 0

const dirs = {
    dist: 'dist',
    views: 'views'
}

const extra = devMode ?
    {
        mode: 'development',
        devtool: 'inline-source-map',
        devServer: {
            port: process.env.FRONTEND_PORT,
            writeToDisk: true
        }
    } : {
        mode: 'production',
        optimization: {
            minimizer: [
                new TerserPlugin()
            ]
        },
        plugins: [
            new OptimizeCssPlugin({
                cssProcessor: cssnano,
                cssProcessorOptions: {
                    discardComments: {
                        removeAll: true
                    }
                },
                canPrint: true
            })
        ]
    }

const filenames = {
    js: '[name].js',
    css: '[name].css',
    cssChunks: '[id].css'
}

module.exports = webpackMerge(
    {
        entry: {
            index: [
                './build/frontend/select/index.js',
                './styles/main.scss'
            ],
            map: [
                './build/frontend/map/index.js',
                './styles/map.scss'
            ],
            planner: [
                './build/frontend/planner/index.js',
                './styles/map.scss'
            ]
        },
        output: {
            filename: filenames.js,
            path: path.resolve(__dirname, dirs.dist)
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: filenames.css,
                chunkFilename: filenames.cssChunks
            }),
            new DefinePlugin({
                'process.env.SERVER_PREFIX': JSON.stringify(process.env.SERVER_PREFIX),
                'process.env.MAPBOX_TOKEN': JSON.stringify(process.env.MAPBOX_TOKEN)
            }),
            new CopyPlugin([
                { from: 'node_modules/leaflet/dist/leaflet.css', to: '.' },
                { from: 'images/**', to: '.' }
            ])
        ],
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {}
                        },
                        { loader: 'css-loader', options: { importLoaders: 1 }},
                        'sass-loader',
                        'postcss-loader'
                    ]
                }
            ]
        },
        performance: {
            hints: false
        }
    },
    extra
)
