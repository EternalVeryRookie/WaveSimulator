const debug = process.env.NODE_ENV != "production";
const webpack = require("webpack");
const path = require("path");
const { SourceMapDevToolPlugin } = require("webpack");

module.exports = {
    context: path.join(__dirname, "src"), // ビルド対象ディレクトリ
    entry : { // ビルドの起点となるファイル
        client: "./js/client.js",
    }, 
    module: { // js以外のファイルもwebpackが処理できるモジュールに変換する
        rules: [
            {
                test: /\.jsx?$/, // 変換対象のファイルを正規表現で指定
                exclude: /(node_modules|bower_components)/, //ビルドから除外するディレクトリを指定
                use: [ // 使用するLoaderを指定する
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-react", "@babel/preset-env"]
                        }
                    },
                    {
                        loader: "source-map-loader",
                    }
                ]
            },
            {
                test: /\.worker\.js$/,
                use: { 
                    loader: "worker-loader",
                    options: {
                        inline: "fallback",
                        publicPath: "/js/Simulator/"
                    } 
                },
            },
            {
                test: /\.compute$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "raw-loader"
                },
            },
            {
                test: /\.css$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options:{url: false},
                    },
                ],
            },
        ]
    },
    output: {
        path: __dirname + "/build/",
        filename: "[name].js"
    },
    plugins: debug? []: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({mangle: false, sourceMap: false}),
        new SourceMapDevToolPlugin({filename: "[file].map"}),
    ]
};