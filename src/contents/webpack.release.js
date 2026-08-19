import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
    mode: "production",
    entry: "./main.ts",
    output: {
        path: path.resolve(__dirname, "../../output"),
        filename: "main.js"
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            "@": __dirname,
            ":=": path.resolve(__dirname, "../def")
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            configFile: "tsconfig.release.json"
                        }
                    }
                ],
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: "style-loader",
                        options: {
                            injectType: "lazyStyleTag",
                            attributes: { pnipinp: "pnipinp-stylesheet" },
                            insert: fileURLToPath(import.meta.resolve("./styleinjector.js"))
                        }
                    },
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: false
                        }
                    },
                    {
                        loader: "sass-loader"
                    }
                ]
            }
        ]
    }
};

export default config;
