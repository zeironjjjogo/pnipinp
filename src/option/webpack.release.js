import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
    mode: "production",
    entry: "./option.ts",
    output: {
        path: path.resolve(__dirname, "../../dst"),
        filename: "option.js"
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            "~": __dirname,
            ":=": path.resolve(__dirname, "../define")
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/
            }
        ]
    }
};

export default config;
