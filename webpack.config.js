import path from "node:path";
import { fileURLToPath } from "node:url";

export default {
    entry: "./src/content/main.ts",
    output: {
        filename: "content.js",
        path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "dist")
    },
    module: {
        rules: [{
            test: /\.ts$/,
            use: "ts-loader",
            exclude: /node_modules/
        }]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    mode: "production",
    devtool: "source-map"
};
