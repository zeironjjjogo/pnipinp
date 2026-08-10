#!/bin/bash
if [ $# -eq 1 ] && [ "$1" == "release" ]; then
    echo "Version unspecified. bulid.sh release [version]";
    exit 4;
elif [ $# -ge 2 ] && [ "$1" == "release" ]; then
    BUILD_MODE="production";
else
    BUILD_MODE="development";
fi

function build()
{
    pushd "./src/$1" || exit 2;
    webpack --mode="$2";
    popd || exit 3;
}

cd "$(dirname "$0")" || exit 1;
build content "$BUILD_MODE";
build option "$BUILD_MODE";

if [ "$BUILD_MODE" == "production" ]; then
    echo "Build as release";
else
    exit 0;
fi

TMP_DIR="tmp_release";
OUTPUT_DIR="$TMP_DIR/v$2";
RELEASE_DIR="./release";
DST_DIR="$RELEASE_DIR/v$2";

if [ ! -e $TMP_DIR ]; then
    echo "一時フォルダが見つからなかったので$TMP_DIRを作成します";
    mkdir $TMP_DIR;
fi

if [ ! -e $RELEASE_DIR ]; then
    echo "出力フォルダが見つからなかったので$RELEASE_DIRを作成します";
    mkdir $RELEASE_DIR;
fi

mkdir "$DST_DIR";
mkdir "$OUTPUT_DIR";
mkdir "$OUTPUT_DIR/dst";
cp "./readme.txt" "$OUTPUT_DIR";
cp "./dst/main.js" "$OUTPUT_DIR/dst";
cp "./dst/option.js" "$OUTPUT_DIR/dst";
cp "./background.js" "$OUTPUT_DIR";
cp "./option.html" "$OUTPUT_DIR";
cp "./manifest.json" "$OUTPUT_DIR";
cp -r "./_locales" "$OUTPUT_DIR";
tar -zcvf "$DST_DIR/pnipinp-v$2.tar.gz" "$OUTPUT_DIR";
zip -r "$DST_DIR/pnipinp-v$2.zip" "$OUTPUT_DIR";

echo "Finished build successfly";

exit 0;
