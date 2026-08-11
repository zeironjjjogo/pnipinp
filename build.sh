#!/bin/bash
if [ $# -eq 1 ] && [ "$1" == "release" ]; then
    echo "Version unspecified. bulid.sh release [version]";
    exit 4;
elif [ $# -ge 2 ] && [ "$1" == "release" ]; then
    BUILD_MODE="production";
    VERSION="v$2";
else
    BUILD_MODE="development";
    VERSION="unknown";
fi

function build()
{
    pushd "./src/$1" || exit 2;
    print_this "Start build $1";
    webpack --mode="$2";
    popd || exit 3;
}

readonly THIS="$(basename "$0")";
function print_this() {
    echo "[$THIS] $1";
}

ROOT_DIR="$(pwd)";
print_this "ROOT_DIR: $ROOT_DIR";
print_this "BUILD_MODE: $BUILD_MODE";
[ $VERSION ] && print_this "VERSION: $VERSION";

cd "$ROOT_DIR" || exit 1;
build content "$BUILD_MODE";
build option "$BUILD_MODE";

if [ "$BUILD_MODE" == "production" ]; then
    print_this "Build as release";
else
    exit 0;
fi

TMP_DIR="$ROOT_DIR/tmp_release";
TMP_OUTPUT_DIR="$TMP_DIR/$VERSION";
print_this "TMP_OUTPUT_DIR: $TMP_OUTPUT_DIR";

RELEASE_DIR="$ROOT_DIR/release";
DST_OUTPUT_DIR="$RELEASE_DIR/$VERSION";
print_this "DST_OUTPUT_DIR: $DST_OUTPUT_DIR";

DST_FILE_NAME_STEM="pnipinp-$VERSION";
print_this "DST_FILE_NAME_STEM: $DST_FILE_NAME_STEM";

if [ ! -e $TMP_DIR ]; then
    print_this "一時フォルダが見つからなかったので$TMP_DIRを作成します";
    mkdir $TMP_DIR;
fi

if [ ! -e $RELEASE_DIR ]; then
    print_this "出力フォルダが見つからなかったので$RELEASE_DIRを作成します";
    mkdir $RELEASE_DIR;
fi

mkdir "$DST_OUTPUT_DIR";
mkdir "$TMP_OUTPUT_DIR";
mkdir "$TMP_OUTPUT_DIR/dst";
cp "./readme.txt" "$TMP_OUTPUT_DIR";
cp "./dst/main.js" "$TMP_OUTPUT_DIR/dst";
cp "./dst/option.js" "$TMP_OUTPUT_DIR/dst";
cp "./background.js" "$TMP_OUTPUT_DIR";
cp "./option.html" "$TMP_OUTPUT_DIR";
cp "./manifest.json" "$TMP_OUTPUT_DIR";
cp -r "./_locales" "$TMP_OUTPUT_DIR";
cd "$TMP_DIR" || exit 5;

print_this "$DST_OUTPUT_DIR/$DST_FILE_NAME_STEM.tar.gz && ./$VERSION";

tar -zcvf "$DST_OUTPUT_DIR/$DST_FILE_NAME_STEM.tar.gz" "./$VERSION";
zip -r "$DST_OUTPUT_DIR/$DST_FILE_NAME_STEM.zip" "./$VERSION";

print_this "Finished build successfly";

exit 0;
