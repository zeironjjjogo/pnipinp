#!/bin/bash
cd "$(dirname "$0")" || exit;
pushd "./src/content" || exit;
webpack;
popd || exit;
pushd "./src/option" || exit;
webpack;
popd || exit;
exit;
