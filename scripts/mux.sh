#!/usr/bin/env bash
set -euo pipefail

silent="${1:-out/silent.mp4}"
audio="${2:-out/soundtrack.wav}"
output="${3:-out/final.mp4}"
mkdir -p "$(dirname "$output")"
ffmpeg -hide_banner -y -i "$silent" -i "$audio" \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k \
  -af "loudnorm=I=-16:TP=-1.5:LRA=7" -shortest -movflags +faststart "$output"

