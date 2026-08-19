import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
    mode: "production",
    entry: "./options.ts",
    output: {
        path: path.resolve(__dirname, "../../output"),
        filename: "options.js"
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            "~": __dirname,
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
            }
        ]
    }
};

export default config;
