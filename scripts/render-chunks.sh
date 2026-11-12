#!/usr/bin/env bash
set -euo pipefail

start="${1:?start frame required}"
end="${2:?end frame required}"
scale="${3:-1}"
crf="${4:-16}"
output="${5:-out/chunk-$(printf '%04d' "$start").mp4}"
mkdir -p "$(dirname "$output")"

if ! npx remotion render src/index.ts BoxChallenge "$output" --codec=h264 --muted --frames="$start-$end" --crf="$crf" --scale="$scale" --pixel-format=yuv420p --gl=angle; then
  rm -f "$output"
  npx remotion render src/index.ts BoxChallenge "$output" --codec=h264 --muted --frames="$start-$end" --crf="$crf" --scale="$scale" --pixel-format=yuv420p --gl=swiftshader
fi
