import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    entry: "./src/content/main.ts",
    output: {
        filename: "content.js",
        path: path.resolve(__dirname, "dist")
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: "style-loader",
                        options: {
                            injectType: "lazyStyleTag",
                            attributes: { pnipinp: "pnipinp-stylesheet" },
                            insert: fileURLToPath(import.meta.resolve("./dpipstyleloader.js"))
                        }
                    },
                    { loader: "css-loader", options: { sourceMap: true } },
                ],
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            "@": path.resolve(__dirname, "src")
        }
    },
    mode: "production",
    devtool: "source-map"
};
