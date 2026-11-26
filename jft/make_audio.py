#!/usr/bin/env python3
"""Build JFT lesson MP3s with the locally installed VOICEVOX Nemo engine.

Run `node jft/build-audio-list.cjs` first. The engine and FFmpeg binary are
supplied by path and are not bundled in the repository. Finished clips are
safe to reuse and the script skips files that already exist.
"""
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys
import time
import urllib.parse
import urllib.request

HERE = Path(__file__).resolve().parent
OUT = HERE / 'audio'


def call(base, endpoint, data=b'', headers=None):
    req = urllib.request.Request(base + endpoint, data=data, headers=headers or {}, method='POST')
    with urllib.request.urlopen(req, timeout=90) as response:
        return response.read()


def wait_for_engine(base, process):
    for _ in range(60):
        if process.poll() is not None:
            raise RuntimeError('VOICEVOX Nemo engine exited during startup')
        try:
            with urllib.request.urlopen(base + '/version', timeout=2) as response:
                response.read()
            return
        except OSError:
            time.sleep(1)
    raise RuntimeError('VOICEVOX Nemo engine did not become ready')


def build_one(base, speaker, text, ffmpeg, output):
    args = urllib.parse.urlencode({'text': text, 'speaker': speaker})
    query = json.loads(call(base, '/audio_query?' + args))
    query['speedScale'] = 0.94
    query['intonationScale'] = 1.02
    wave = call(base, '/synthesis?' + urllib.parse.urlencode({'speaker': speaker}),
                json.dumps(query, ensure_ascii=False).encode('utf-8'),
                {'Content-Type': 'application/json'})
    if not wave.startswith(b'RIFF'):
        raise RuntimeError('Engine did not return WAV audio')
    temporary = output.with_suffix('.partial.mp3')
    subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-i', 'pipe:0',
                    '-codec:a', 'libmp3lame', '-b:a', '48k', str(temporary)],
                   input=wave, check=True, stdout=subprocess.DEVNULL)
    if temporary.stat().st_size < 500:
        raise RuntimeError('Encoded clip is empty')
    temporary.replace(output)


def write_manifest():
    ids = sorted(file.stem for file in OUT.glob('*.mp3') if file.stat().st_size > 500)
    (HERE / 'audio-manifest.js').write_text('window.ikigaiJftAudio = ' + json.dumps(ids) + ';\n', encoding='utf-8')
    (OUT / 'manifest.json').write_text(json.dumps(ids, indent=2) + '\n', encoding='utf-8')
    return len(ids)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--engine-path', type=Path, required=True)
    parser.add_argument('--ffmpeg', type=Path, required=True)
    parser.add_argument('--speaker', type=int, default=10005)
    parser.add_argument('--port', type=int, default=50123)
    parser.add_argument('--limit', type=int, default=0)
    parser.add_argument('--list', type=Path, default=HERE / 'audio-texts.json')
    args = parser.parse_args()
    OUT.mkdir(exist_ok=True)
    clips = json.loads(args.list.read_text(encoding='utf-8'))
    base = f'http://127.0.0.1:{args.port}'
    engine = subprocess.Popen([str(args.engine_path), '--host', '127.0.0.1', '--port', str(args.port)],
                              cwd=args.engine_path.parent, stdout=subprocess.DEVNULL,
                              stderr=subprocess.DEVNULL)
    made = failed = 0
    try:
        wait_for_engine(base, engine)
        with urllib.request.urlopen(base + '/speakers', timeout=15) as response:
            speakers = json.load(response)
        available = {style['id'] for person in speakers for style in person.get('styles', [])}
        if args.speaker not in available:
            raise RuntimeError(f'Speaker {args.speaker} is unavailable; choices: {sorted(available)}')
        for index, clip in enumerate(clips, 1):
            output = OUT / (clip['id'] + '.mp3')
            if output.exists() and output.stat().st_size > 500:
                continue
            if args.limit and made >= args.limit:
                break
            try:
                build_one(base, args.speaker, clip['text'], str(args.ffmpeg), output)
                made += 1
                if made % 20 == 0 or args.limit:
                    print(f'{index}/{len(clips)}: {made} new clips', flush=True)
            except Exception as exc:
                failed += 1
                print(f'{index}/{len(clips)} failed: {clip["id"]} ({exc})', flush=True)
        print(f'Done: {made} new, {failed} failed, {write_manifest()} available', flush=True)
        return 1 if failed else 0
    finally:
        engine.terminate()
        try:
            engine.wait(timeout=10)
        except subprocess.TimeoutExpired:
            engine.kill()


if __name__ == '__main__':
    sys.exit(main())
