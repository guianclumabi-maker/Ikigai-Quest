#!/usr/bin/env python3
"""Generate original practice-bank recordings with the local VOICEVOX Nemo engine."""
import argparse
import json
from pathlib import Path
import subprocess
import urllib.request

from make_audio import build_one, wait_for_engine

HERE = Path(__file__).resolve().parent
OUT = HERE / 'practice-bank-audio'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--engine-path', type=Path, required=True)
    parser.add_argument('--ffmpeg', type=Path, required=True)
    parser.add_argument('--speaker', type=int, default=10005)
    parser.add_argument('--port', type=int, default=50124)
    args = parser.parse_args()
    OUT.mkdir(exist_ok=True)
    clips = json.loads((HERE / 'practice-bank-audio-texts.json').read_text(encoding='utf-8'))
    base = f'http://127.0.0.1:{args.port}'
    engine = subprocess.Popen([str(args.engine_path), '--host', '127.0.0.1', '--port', str(args.port)],
                              cwd=args.engine_path.parent, stdout=subprocess.DEVNULL,
                              stderr=subprocess.DEVNULL)
    made = 0
    try:
        wait_for_engine(base, engine)
        with urllib.request.urlopen(base + '/speakers', timeout=15) as response:
            speakers = json.load(response)
        styles = {style['id'] for person in speakers for style in person.get('styles', [])}
        if args.speaker not in styles:
            raise RuntimeError(f'Speaker {args.speaker} is unavailable')
        for clip in clips:
            target = OUT / (clip['id'] + '.mp3')
            if target.exists() and target.stat().st_size > 500:
                continue
            build_one(base, args.speaker, clip['text'], str(args.ffmpeg), target)
            made += 1
            if made % 5 == 0:
                print(f'Created {made} new clips', flush=True)
        ids = [clip['id'] for clip in clips if (OUT / (clip['id'] + '.mp3')).exists()
               and (OUT / (clip['id'] + '.mp3')).stat().st_size > 500]
        (HERE / 'practice-bank-audio.js').write_text('window.ikigaiJftPracticeAudio = ' + json.dumps(ids) + ';\n', encoding='utf-8')
        (OUT / 'manifest.json').write_text(json.dumps(ids, indent=2) + '\n', encoding='utf-8')
        print(f'{len(ids)} available; {made} generated', flush=True)
        return 0 if len(ids) == len(clips) else 1
    finally:
        engine.terminate()
        try:
            engine.wait(timeout=10)
        except subprocess.TimeoutExpired:
            engine.kill()


if __name__ == '__main__':
    raise SystemExit(main())
