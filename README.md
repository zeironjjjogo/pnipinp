# pnipinp
Picture in Picture for nicovideo.

pnipinp
    define
    pip
        src
            webpack
            tsconfig
    option
        src
            webpack
            tsconfig

    src
        content
            main.ts
            core
                player
                    wrapped.ts
                    resizer.ts
                    domctrler.ts
                controller
                    videoctrler.ts
                    controller.ts
            observer
                observer.ts
            context
                config.ts
                feature.ts
            misc
                utils.ts
            tsconfig.json
            webpack.config.ts
        option
            index.ts
            tsconfig.json
            webpack.config.ts
        define
            options.ts


    dst
        manifest.json
        background.js
        content.js
        option.html
        option.js
