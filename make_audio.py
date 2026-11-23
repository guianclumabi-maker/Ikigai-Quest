#!/usr/bin/env python3
"""
Generate natural-sounding Japanese audio for Ikigai Quest.

Reads audio-texts.json (next to this script) and writes one audio file per
sentence into ./audio/, plus a manifest mapping sentence IDs to file formats.
The lesson page plays the generated recordings and does not fall back to a
browser voice when a recording is missing.

Two ways to run it:

  1) VOICEVOX Nemo (free, local engine; female 1 is speaker ID 10005):
         start VOICEVOX Nemo Engine on 127.0.0.1:50121
         python make_audio.py --engine voicevox

  2) Free, no account (uses Microsoft's neural voices through edge-tts):
         pip install edge-tts
         python make_audio.py --engine edge

  3) Official Azure Speech (set these first):
         set AZURE_SPEECH_KEY=your-key            (Windows)   /   export AZURE_SPEECH_KEY=your-key
         set AZURE_SPEECH_REGION=southeastasia    (use your region)
         python make_audio.py --engine azure

Options:
  --speaker-id 10005          VOICEVOX Nemo female 1 speaker
  --rate=-10%                 Azure/Edge speaking speed
  --limit 5                   only make the first 5 files (good for a test run)

Safe to re-run: files that already exist are skipped.
"""
import argparse, asyncio, json, os, sys, time, urllib.request
from xml.sax.saxutils import escape

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "audio")


def synth_azure(text, path, voice, rate):
    key = os.environ["AZURE_SPEECH_KEY"]
    region = os.environ["AZURE_SPEECH_REGION"]
    ssml = (
        "<speak version='1.0' xml:lang='ja-JP'>"
        f"<voice name='{voice}'><prosody rate='{rate}'>{escape(text)}</prosody></voice></speak>"
    )
    req = urllib.request.Request(
        f"https://{region}.tts.speech.microsoft.com/cognitiveservices/v1",
        data=ssml.encode("utf-8"),
        headers={
            "Ocp-Apim-Subscription-Key": key,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
            "User-Agent": "ikigai-quest-audio",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    if not data:
        raise RuntimeError("empty audio returned")
    with open(path, "wb") as f:
        f.write(data)


def synth_edge(text, path, voice, rate):
    import edge_tts  # pip install edge-tts

    async def go():
        await edge_tts.Communicate(text, voice, rate=rate).save(path)

    asyncio.run(go())
    if not os.path.exists(path) or os.path.getsize(path) == 0:
        raise RuntimeError("empty audio returned")


def synth_voicevox(text, path, base_url, speaker_id):
    from urllib.parse import urlencode

    base_url = base_url.rstrip("/")
    query_url = base_url + "/audio_query?" + urlencode({"text": text, "speaker": speaker_id})
    query_req = urllib.request.Request(query_url, data=b"", method="POST")
    with urllib.request.urlopen(query_req, timeout=60) as r:
        query = json.loads(r.read().decode("utf-8"))
    body = json.dumps(query, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        base_url + "/synthesis?" + urlencode({"speaker": speaker_id}),
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        audio = r.read()
    if not audio or not audio.startswith(b"RIFF"):
        raise RuntimeError("VOICEVOX returned empty or invalid WAV audio")
    with open(path, "wb") as f:
        f.write(audio)


def write_manifest():
    files = {}
    for ext in ("mp3", "wav"):
        for name in os.listdir(OUT):
            if name.endswith("." + ext) and os.path.getsize(os.path.join(OUT, name)) > 0:
                files[name[:-(len(ext) + 1)]] = ext
    with open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump({"files": files}, f, ensure_ascii=False)
    return len(files)


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--engine", choices=("voicevox", "edge", "azure"), default="voicevox")
    ap.add_argument("--voice", default="ja-JP-NanamiNeural")
    ap.add_argument("--rate", default="-10%")
    ap.add_argument("--speaker-id", type=int, default=10005)
    ap.add_argument("--voicevox-url", default=os.environ.get("VOICEVOX_URL", "http://127.0.0.1:50121"))
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args(argv)

    with open(os.path.join(HERE, "audio-texts.json"), encoding="utf-8") as f:
        items = json.load(f)
    os.makedirs(OUT, exist_ok=True)

    engine = args.engine
    if engine == "azure":
        if not (os.environ.get("AZURE_SPEECH_KEY") and os.environ.get("AZURE_SPEECH_REGION")):
            raise RuntimeError("Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION to use Azure Speech")
        synth = lambda text, path: synth_azure(text, path, args.voice, args.rate)
        ext = "mp3"
    elif engine == "edge":
        synth = lambda text, path: synth_edge(text, path, args.voice, args.rate)
        ext = "mp3"
    else:
        synth = lambda text, path: synth_voicevox(text, path, args.voicevox_url, args.speaker_id)
        ext = "wav"
        with urllib.request.urlopen(args.voicevox_url.rstrip("/") + "/speakers", timeout=10) as r:
            speakers = json.loads(r.read().decode("utf-8"))
        available_ids = {style["id"] for speaker in speakers for style in speaker.get("styles", [])}
        if args.speaker_id not in available_ids:
            raise RuntimeError(f"VOICEVOX speaker ID {args.speaker_id} is not available")
    print("Using", {"voicevox": f"VOICEVOX Nemo speaker {args.speaker_id}", "edge": args.voice, "azure": args.voice}[engine])

    made = failed = 0
    for n, it in enumerate(items, 1):
        path = os.path.join(OUT, it["id"] + "." + ext)
        if os.path.exists(path) and os.path.getsize(path) > 0:
            continue
        if args.limit and made >= args.limit:
            break
        for attempt in range(3):
            try:
                synth(it["text"], path)
                made += 1
                print(f"[{n}/{len(items)}] {it['text']}")
                break
            except Exception as e:  # noqa: BLE001
                if os.path.exists(path):
                    os.remove(path)
                if attempt == 2:
                    failed += 1
                    print(f"[{n}/{len(items)}] FAILED: {it['text']} ({e})")
                else:
                    time.sleep(2)
        if engine != "voicevox":
            time.sleep(0.2)

    total = write_manifest()
    print(f"Done. {made} new, {failed} failed, {total} files in audio/. manifest.json updated.")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
