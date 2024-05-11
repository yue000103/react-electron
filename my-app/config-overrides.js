const path = require("path");
const paths = require("react-scripts/config/paths");
const HtmlWebpackPlugin = require("html-webpack-plugin");

function resolve(dir) {
    return path.join(__dirname, dir);
}

module.exports = function (config, env) {
    let pathDir = path.join(__dirname, "dist");
    paths.appBuild = path.join(__dirname, "dist");

    if (process.env.MODEL_NAME) {
        let mName = process.env.MODEL_NAME;

        // 输出目录
        pathDir = resolve(`dist/${mName}`);
        paths.appBuild = resolve(`dist/${mName}`);

        // 模块入口
        // paths.appSrc = resolve(`src`);
        // paths.appIndexJs = resolve(`src/index`);
        paths.appIndexJs = resolve(`src/models/${mName}/index`);
        config.entry = paths.appIndexJs;

        // 模板入口
        paths.appPublic = resolve(`template/${mName}`);
        paths.appHtml = resolve(`template/${mName}/index.html`);

        config.plugins = [
            ...config.plugins,
            new HtmlWebpackPlugin({
                title: mName,
                inject: "body",
                // chunks: ["bundle","main"],
                template: paths.appHtml,
                filename: "index1.html",
            }),
        ];
    }

    // 关闭 source-map
    config.devtool = false;

    // 输出目录
    config.output = {
        ...config.output,
        path: pathDir,
        // publicPath: '', // package.json -> homepage = './'
        filename: "static/js/bundle.js",
        chunkFilename: "static/js/[name].chunk.js",
    };

    // // 外部扩展
    // config.externals = {
    //     react: "react",
    //     "react-dom": "reactDOM",
    // };

    // 设置别名
    config.resolve = {
        ...config.resolve,
        alias: {
            ...config.alias,
            "@": path.resolve(__dirname, "src"),
            "@components": path.join(__dirname, "./src/components"),
        },
    };

    return config;
};
