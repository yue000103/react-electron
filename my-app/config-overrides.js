const { override, addWebpackAlias } = require("customize-cra");
const path = require("path");
const resolve = path.join(__dirname, "./src");
module.exports = override(
    // 用来配置 @ 导入
    addWebpackAlias({
        "@": resolve,
        "@components": path.join(__dirname, "./src/components"),
    })
);
