#!/usr/bin/env bash

SNAPSHOT_FILE="scripts/circular-dependencies/madge-snapshot.txt"

npx madge --circular --extensions ts,tsx --exclude "node_modules|lib|libDev" \
    packages suite suite-native suite-common \
      | tail -n +2 \
      | sed 's/^[0-9][0-9]*) *//' \
      | LC_ALL=C sort > "$SNAPSHOT_FILE"
