#!/bin/bash
ROOT="$(realpath "$(dirname "$0")"/..)";
THIS="$(basename "$0")";
TGTS=("build" "output");
function log() {
    echo "[$THIS]: $*";
}
function askYN() {
    echo $'\n';
    read -r -n 1 -p "[$THIS]: $* (y/n): " RES;
    echo $'\n';
    if [ "$RES" == "y" ]; then
        return 0;
    fi
    return 1;
}

cd "$ROOT" || exit 1;

if ! askYN "Really clean up some directories?"; then
    log "Canceled to clean directories.";
    exit 0;
fi

if [ $# -ge 1 ]; then
    if [ "$1" == "all" ]; then
        if askYN "Do you want to delete all release directories?"; then
            rm -rv "$ROOT/release";
        fi
    else
        for ITEM in "$@"; do
            ITEM_PATH="$ROOT/release/$ITEM"
            if [ -e "$ITEM_PATH" ]; then
                if askYN "Do you want to delete '$ITEM_PATH'?"; then
                    rm -rv "$ITEM_PATH";
                fi
            else
                log "$ITEM_PATH is not found.";
            fi
        done
    fi
fi

for DIR in "${TGTS[@]}"; do
    DIR_PATH="$ROOT/$DIR";
    if [ -e "$DIR_PATH" ]; then
        if askYN "Do you want to delete '$DIR_PATH'?"; then
            rm -rv "$DIR_PATH";
        fi
    else
        log "$DIR_PATH is not found.";
    fi
done

exit 0;
