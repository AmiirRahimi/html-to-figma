const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = (env, argv) => ({
    mode: argv.mode === 'production' ? 'production' : 'development',

    // This is necessary because Figma's 'eval' works differently than normal eval
    devtool: argv.mode === 'production' ? false : 'inline-source-map',

    entry: {
        frame: './src/frame.tsx', // The entry point for your plugin code
        figma: './src/figma.ts', // The entry point for your plugin code
        'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
        'html.worker': 'monaco-editor/esm/vs/language/html/html.worker',
        'css.worker': 'monaco-editor/esm/vs/language/css/css.worker',
    },

    module: {
        rules: [
            // Converts TypeScript code to JavaScript
            { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },

            // Enables including CSS by doing "import './file.css'" in your TypeScript code
            { test: /\.css$/, use: ['style-loader', { loader: 'css-loader' }] },

            // Allows you to use "<%= require('./file.svg') %>" in your HTML code to get a data URI
            { test: /\.(png|jpg|gif|webp|svg)$/, loader: 'url-loader' },
        ],
    },

    // Webpack tries these extensions for you if you omit the extension like "import './file'"
    resolve: { extensions: ['.tsx', '.ts', '.jsx', '.js'] },

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'), // Compile into a folder called "dist"
        publicPath: '/',
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000,
    },
    // Tells Webpack to generate "ui.html" and to inline "ui.ts" into it
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/ui.html',
            filename: 'index.html',
            inlineSource: '.(js)$',
            chunks: ['ui'],
        }),
        new HtmlWebpackPlugin({
            template: './src/frame.html',
            filename: 'frame.html',
            inlineSource: '.(js)$',
            chunks: ['frame', 'editor.worker', 'html.worker', 'css.worker'],
        }),
        // argv.mode === 'production' && new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin),
    ].filter(Boolean),
});