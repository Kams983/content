#!/usr/bin/env python3
import json
import math
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SCENE_FILE = ROOT / "src" / "data" / "scenes.json"
OUTPUT = ROOT / "out" / "soundtrack.wav"
SAMPLE_RATE = 44_100


def envelope(length, attack=0.01, release=0.15):
    count = max(1, int(length * SAMPLE_RATE))
    env = np.ones(count, dtype=np.float64)
    attack_count = min(count, int(attack * SAMPLE_RATE))
    release_count = min(count, int(release * SAMPLE_RATE))
    if attack_count:
        env[:attack_count] = np.linspace(0, 1, attack_count, endpoint=False)
    if release_count:
        env[-release_count:] *= np.linspace(1, 0, release_count, endpoint=True)
    return env


def place(audio, signal, start_seconds):
    start = max(0, int(start_seconds * SAMPLE_RATE))
    end = min(len(audio), start + len(signal))
    if end > start:
        audio[start:end] += signal[: end - start]


def tone(frequency, length, amplitude=0.1, attack=0.03, release=0.3, phase=0):
    count = max(1, int(length * SAMPLE_RATE))
    times = np.arange(count, dtype=np.float64) / SAMPLE_RATE
    wave_data = np.sin(2 * np.pi * frequency * times + phase)
    return amplitude * wave_data * envelope(length, attack, release)


def lowpass(signal, cutoff=1100):
    alpha = 1 - math.exp(-2 * math.pi * cutoff / SAMPLE_RATE)
    filtered = np.empty_like(signal)
    previous = 0.0
    for index, value in enumerate(signal):
        previous += alpha * (value - previous)
        filtered[index] = previous
    return filtered


def add_reverb(stereo):
    result = stereo.copy()
    for channel, delay_ms, feedback in ((0, 37, 0.22), (1, 53, 0.18)):
        delay = int(SAMPLE_RATE * delay_ms / 1000)
        if delay < len(result):
            result[delay:, channel] += result[:-delay, channel] * feedback
    return result


def synthesize_cue(kind, rng):
    if kind == "impact":
        length = 0.48
        time = np.arange(int(length * SAMPLE_RATE)) / SAMPLE_RATE
        sweep = 92 - 47 * np.minimum(time / length, 1)
        phase = 2 * np.pi * np.cumsum(sweep) / SAMPLE_RATE
        return 0.38 * np.sin(phase) * envelope(length, 0.002, 0.38)
    if kind == "bell":
        length = 1.35
        time = np.arange(int(length * SAMPLE_RATE)) / SAMPLE_RATE
        bell = sum(weight * np.sin(2 * np.pi * frequency * time) for frequency, weight in ((660, 1), (990, 0.38), (1320, 0.18)))
        return 0.16 * bell * envelope(length, 0.004, 1.15)
    if kind == "riser":
        length = 1.4
        count = int(length * SAMPLE_RATE)
        time = np.arange(count) / SAMPLE_RATE
        noise = rng.normal(0, 1, count)
        sweep = np.sin(2 * np.pi * (110 * time + 470 * time * time))
        return (0.09 * lowpass(noise, 2800) + 0.12 * sweep) * np.linspace(0, 1, count) ** 1.7 * envelope(length, 0.01, 0.12)
    if kind == "glitch":
        length = 0.2
        count = int(length * SAMPLE_RATE)
        noise = rng.normal(0, 1, count)
        gate = ((np.arange(count) // 500) % 2).astype(np.float64)
        return 0.19 * lowpass(noise, 4500) * gate * envelope(length, 0.003, 0.08)
    if kind == "confetti":
        length = 0.9
        count = int(length * SAMPLE_RATE)
        noise = rng.normal(0, 1, count)
        return 0.09 * lowpass(noise, 6500) * envelope(length, 0.015, 0.55)
    if kind == "swell":
        length = 1.8
        time = np.arange(int(length * SAMPLE_RATE)) / SAMPLE_RATE
        signal = sum(np.sin(2 * np.pi * f * time) for f in (110, 164.81, 220))
        return 0.12 * signal * np.sin(np.pi * np.minimum(time / length, 1) / 2) * envelope(length, 0.08, 0.35)
    return np.zeros(1, dtype=np.float64)


def main():
    config = json.loads(SCENE_FILE.read_text(encoding="utf-8"))
    duration = config["durationInFrames"] / config["fps"]
    sample_count = int(round(duration * SAMPLE_RATE))
    rng = np.random.default_rng(20261112)
    mono = np.zeros(sample_count, dtype=np.float64)

    chord_changes = [(0, (110, 164.81, 220)), (8, (98, 146.83, 196)), (15, (130.81, 196, 261.63)), (23, (110, 164.81, 220)), (28, (130.81, 164.81, 196, 261.63))]
    for index, (start, notes) in enumerate(chord_changes):
        end = chord_changes[index + 1][0] if index + 1 < len(chord_changes) else duration
        length = end - start
        time = np.arange(int(length * SAMPLE_RATE), dtype=np.float64) / SAMPLE_RATE
        pad = np.zeros_like(time)
        for note_index, frequency in enumerate(notes):
            pad += np.sin(2 * np.pi * frequency * time + note_index * 0.23) / len(notes)
        pad *= 0.12 * envelope(length, 1.1, min(1.5, length * 0.4))
        place(mono, lowpass(pad, 520), start)

    for scene in config["scenes"]:
        scene_start = scene["start"] / config["fps"]
        for cue in scene.get("audio", []):
            place(mono, synthesize_cue(cue["type"], rng), scene_start + cue["at"])

    fade_samples = int(1.2 * SAMPLE_RATE)
    mono[-fade_samples:] *= np.linspace(1, 0, fade_samples)
    left = mono
    right = np.zeros_like(mono)
    stereo_delay = int(0.008 * SAMPLE_RATE)
    right[stereo_delay:] = mono[:-stereo_delay] * 0.92
    stereo = np.column_stack((left, right))
    stereo = add_reverb(stereo)
    peak = np.max(np.abs(stereo))
    if peak > 0:
        stereo *= min(0.88 / peak, 1.0)
    pcm = np.int16(np.clip(stereo, -1, 1) * 32767)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUTPUT), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        wav.writeframes(pcm.tobytes())
    print(f"Wrote {OUTPUT} ({duration:.2f}s, {SAMPLE_RATE} Hz stereo)")


if __name__ == "__main__":
    main()
