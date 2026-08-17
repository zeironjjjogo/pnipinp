#!/bin/bash
function log() {
    echo "[release.sh]: $*";
}
function build() {
    pushd "./src/$1" || exit 2;
    webpack --config "webpack.release.js";
    popd || exit 3;
}
function initDir() {
    if [ ! -e "$1" ]; then
        mkdir -pv "$1";
    else
        log "delete ${1:?}/"*;
        read -r -n 1 -p $'Press any key to continue...\n';
        rm -r "${1:?}/"*
    fi
}

if [ $# -lt 1 ]; then
    log "Arguments lacking: ./release.sh <VERSION>";
fi
VERSION="v$1";

ROOT="$(pwd)/..";
cd "$ROOT" || exit 1;

build "content";
build "option";

TMP_DIR="tmp/release";
DST_DIR="release";
OUT_DIR="dst";

TMP_PATH="$ROOT/$TMP_DIR/$VERSION";
DST_PATH="$ROOT/$DST_DIR/$VERSION";
OUT_PATH="$ROOT/$OUT_DIR";

STEM="pnipinp-$VERSION";

PACK_FILES=("background.js" "manifest.json" "option.html" "readme.txt");

log "Start collection files.";
initDir "$TMP_PATH";

for file in "${PACK_FILES[@]}"; do
    cp -v "$file" "$TMP_PATH";
done

cp -rv "_locales" "$TMP_PATH";

cd "$OUT_PATH" || exit 4;
mkdir "$TMP_PATH/dst";
cp -v ./*.js "$TMP_PATH/dst";

initDir "$DST_PATH";

cd "$TMP_PATH/.." || exit 5;

log "Start compression by tar.";
tar -zcvf "$DST_PATH/$STEM.tar.gz" "./$VERSION";

log "Start compression by zip.";
zip -r "$DST_PATH/$STEM.zip" "./$VERSION";

exit 0;
