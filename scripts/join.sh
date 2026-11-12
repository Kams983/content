#!/usr/bin/env bash
set -euo pipefail

input_dir="${1:-out/chunks}"
output="${2:-out/silent.mp4}"
mkdir -p "$(dirname "$output")"
list_file="$(dirname "$output")/concat.txt"
: > "$list_file"
shopt -s nullglob
files=("$input_dir"/chunk-*.mp4)
if ((${#files[@]} == 0)); then
  echo "No chunk-*.mp4 files found in $input_dir" >&2
  exit 1
fi
for file in "${files[@]}"; do
  printf "file '%s'\n" "$(realpath "$file")" >> "$list_file"
done
ffmpeg -hide_banner -y -f concat -safe 0 -i "$list_file" \
  -map 0:v:0 -an -c:v copy -movflags +faststart "$output"
