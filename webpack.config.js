const path = require("node:path");

module.exports = {
    entry: "./src/content/main.ts",
    output: {
        filename: "content.js",
        path: path.resolve(__dirname, "dist")
    },
    module: {
        rule: [{
            test: /\.ts$/,
            use: "ts-loader",
            exclude: /node_modules/
        }]
    },
    resolve: {
        extensions: [".ts", ".js"]
    }
};
