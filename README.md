# Last One in the Box

A 30-second vertical 3D animated short made with Remotion, React Three Fiber, and procedural audio. Marcus hosts as Jordan, Maya, and Ethan compete inside a transparent shrinking box.

The approved dialogue is kept verbatim. Dialogue captions include a separate speaker-name badge for reference; speaker names are not inserted into the spoken lines. The humans use a deliberately stylized low-poly look with distinct faces, hair, clothing, and animated poses. No stills or video were rendered while preparing this repository.

## Requirements

- Node.js 20
- Python 3.10+ and `numpy`
- FFmpeg with `ffprobe`
- For local Remotion rendering, Chrome/Chromium support; Remotion can install its browser with `npx remotion browser ensure`
- Bash for the helper scripts (Git Bash on Windows)

## Install

```bash
npm ci
python -m pip install numpy
npx remotion browser ensure
```

The exact dependency versions are pinned in `package.json` and `package-lock.json`. There are no additional runtime dependencies.

## Preview and stills

```bash
npm run dev
npm run still
```

The still command renders frame 150 to `out/still.png`. Change the `--frame` value in the command to inspect another moment. Still rendering is intentionally not run as part of this repository setup.

## Full-size local render

```bash
npm run render
npm run audio
npm run mux
```

The render uses 1080x1920, 30 fps, H.264, CRF 16, yuv420p, scale 1, and ANGLE. Video chunks are rendered muted so audio timestamps cannot introduce gaps during concatenation. `npm run render` creates `out/silent.mp4`; the audio command creates 44.1 kHz stereo `out/soundtrack.wav`; mux creates `out/final.mp4` with AAC 192 kb/s and loudness normalization. FFmpeg must be available on PATH.

To render in chunks locally (use Git Bash):

```bash
bash scripts/render-chunks.sh 0 119 1 16 out/chunk-0000.mp4
bash scripts/render-chunks.sh 120 239 1 16 out/chunk-0001.mp4
bash scripts/join.sh out out/silent.mp4
```

Run the audio and mux commands afterward. For a lower-resolution test render, change the scale argument, for example `0.3`; full size is the default.

## GitHub Actions

1. Push this repository to GitHub.
2. Open **Actions > Render vertical short > Run workflow**.
3. Choose `scale` (default `1`), `crf` (default `16`), and `chunk_size` (default `120`).
4. Download the `final-video` artifact for `final.mp4`, `silent.mp4`, and `soundtrack.wav`.

The plan job derives chunk frame ranges from the scene data. Render workers run in parallel, try ANGLE first and fall back to SwiftShader, and upload individual chunks. The assemble job joins them, synthesizes the soundtrack, muxes the final file, and checks its frame count and duration. A push affecting `src/`, `tools/`, or the workflow also triggers a render.

For manual dispatch with the default quality:

```text
scale=1
crf=16
chunk_size=120
```

With GitHub CLI installed and authenticated, start the workflow and download its output with:

```bash
gh workflow run render.yml --ref main -f scale=1 -f crf=16 -f chunk_size=120
gh run watch
gh run download --name final-video --dir out
```

## Editing

- Dialogue and on-screen wording: [`src/data/script.ts`](src/data/script.ts)
- Scene timing, speakers, phases, and audio cues: [`src/data/scenes.json`](src/data/scenes.json)
- Typed scene data: [`src/data/scenes.ts`](src/data/scenes.ts)
- Palette: [`src/data/theme.ts`](src/data/theme.ts)
- Character models, lighting, camera poses, and box: [`src/video/World.tsx`](src/video/World.tsx)
- Caption layout and emphasis: [`src/video/Caption.tsx`](src/video/Caption.tsx)
- Composition dimensions and duration: [`src/root.tsx`](src/root.tsx)

Frame ranges in `scenes.json` are start-inclusive/end-exclusive at 30 fps. Audio cue times are seconds relative to the start of each scene and are read directly by `tools/make_audio.py`.

## Troubleshooting

- **Chrome download blocked:** run `npx remotion browser ensure` on a network that permits the browser download, then retry. On GitHub-hosted Ubuntu runners, the render workflow installs Chrome system libraries and lets Remotion ensure its browser.
- **SwiftShader is slow:** it is only the ANGLE fallback. Prefer a machine with working GPU/ANGLE support, or use smaller scale/chunk sizes for quick checks.
- **TypeScript or bundler errors:** use Node 20 and the pinned TypeScript 5.6.3. TypeScript 6/7 is not supported by this Remotion bundler setup.
- **GitHub workflow fails to install dependencies:** confirm `package-lock.json` is committed and regenerate it using Node 20 with `npm install --package-lock-only`.
- **Chunk join fails:** make sure every render chunk artifact exists and chunk files use zero-padded names in ascending frame order.
