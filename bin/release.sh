#!/bin/bash
THIS="$(basename "$0")";
ROOT="$(realpath "$(dirname "$0")/..")";
VERSION="v$1";

APPNAME="pnipinp";
STEM="$APPNAME-$VERSION";

ASSETS_DIR="assets";
OUTPUT_DIR="output";

BUILD_DIR="build";
RELEASE_DIR="release";

ASSETS_PATH="$ROOT/$ASSETS_DIR";
OUTPUT_PATH="$ROOT/$OUTPUT_DIR";

BUILD_PATH="$ROOT/$BUILD_DIR/$APPNAME";
RELEASE_PATH="$ROOT/$RELEASE_DIR/$VERSION";

function log() {
    echo "[$THIS]: $*";
}
function build() {
    pushd "./src/$1" || exit 16;
    webpack --config "webpack.release.js";
    RET_VAL=$?;
    popd || exit 17;
    return $RET_VAL;
}
function initDir() {
    if [ -d "$1" ]; then
        log "Clean $1.";
        rm -rv "$1";
    fi
    mkdir -pv "$1";
}
function editManifest() {
    TGT_JSON="$BUILD_PATH/manifest.json";
    TMP_JSON="$BUILD_PATH/edited.json";
    if ! < "$TGT_JSON" jq ".version|=\"$VERSION\" | del(.web_accessible_resources)" > "$TMP_JSON"; then
        log "Failed to edit manifest.";
        return;
    fi
    mv "$TMP_JSON" "$TGT_JSON";
}

if [ $# -lt 1 ]; then
    log "Arguments lacking: ./release.sh <VERSION>";
    exit 2;
elif [ ! -e "$ASSETS_PATH" ]; then
    log "ERROR: $ASSETS_PATH is not found.";
    exit 3;
fi

cd "$ROOT" || exit 8;

initDir "$OUTPUT_PATH";

log "Start transpiling contents.";
if ! build "contents"; then 
    log "Failed transpiling contents.";
else 
    log "Successed transpiling contents.";
fi

log "Start transpiling options.";
if ! build "options"; then 
    log "Failed transpiling options.";
else 
    log "Successed transpiling options.";
fi

if [ ! -e "$OUTPUT_PATH" ]; then
    log "ERROR: $OUTPUT_PATH is not found.";
    exit 4;
fi

initDir "$BUILD_PATH";
cp -rv "$ASSETS_PATH"/* "$BUILD_PATH";
cp -rv "$OUTPUT_PATH"/* "$BUILD_PATH";
editManifest;

initDir "$RELEASE_PATH";
cd "$BUILD_PATH/.." || exit 9;

log "Start compression by tar.";
if ! tar -czvf "$RELEASE_PATH/$STEM.tar.gz" "./$APPNAME"; then
    log "Failed compression by tar.";
else 
    log "Successed compression by tar.";
fi

log "Start compression by zip.";
if ! zip -r "$RELEASE_PATH/$STEM.zip" "./$APPNAME"; then 
    log "Failed compression by zip.";
else 
    log "Successed compression by zip.";
fi

log "Finished build & compression.";
exit 0;
