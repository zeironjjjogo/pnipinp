#!/bin/bash
THIS="$(basename "$0")";
ROOT="$(realpath "$(dirname "$0")/..")";

APPNAME="pnipinp";

ASSETS_DIR="assets";
OUTPUT_DIR="output";
BUILD_DIR="build";

ASSETS_PATH="$ROOT/$ASSETS_DIR";
OUTPUT_PATH="$ROOT/$OUTPUT_DIR";
BUILD_PATH="$ROOT/$BUILD_DIR/$APPNAME";

function log() {
    echo "[$THIS]: $*";
}
function build() {
    pushd "./src/$1" || exit 16;
    webpack;
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
if [ ! -e "$ASSETS_PATH" ]; then
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

log "Finished build.";
exit 0;
