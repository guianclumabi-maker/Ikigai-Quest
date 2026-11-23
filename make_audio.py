#!/usr/bin/env python3
"""
Generate natural-sounding Japanese audio for Ikigai Quest.

Reads audio-texts.json (next to this script) and writes one MP3 per sentence into
./audio/<id>.mp3, plus ./audio/manifest.json (the list of ids that have audio).
The page uses the manifest to decide when to play a file and when to fall back to the browser voice.

Two ways to run it:

  1) Free, no account (uses Microsoft's neural voices through the edge-tts package):
         pip install edge-tts
         python make_audio.py

  2) Official Azure Speech (needs a free Azure account; set these first):
         set AZURE_SPEECH_KEY=your-key            (Windows)   /   export AZURE_SPEECH_KEY=your-key
         set AZURE_SPEECH_REGION=southeastasia    (use your region)
         python make_audio.py

Options:
  --voice ja-JP-KeitaNeural   use the male voice (default ja-JP-NanamiNeural)
  --rate=-10%                 speaking speed (default -10%, a little slower for learners)
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


def write_manifest():
    ids = sorted(f[:-4] for f in os.listdir(OUT) if f.endswith(".mp3") and os.path.getsize(os.path.join(OUT, f)) > 0)
    with open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(ids, f)
    return len(ids)


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default="ja-JP-NanamiNeural")
    ap.add_argument("--rate", default="-10%")
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args(argv)

    with open(os.path.join(HERE, "audio-texts.json"), encoding="utf-8") as f:
        items = json.load(f)
    os.makedirs(OUT, exist_ok=True)

    use_azure = bool(os.environ.get("AZURE_SPEECH_KEY") and os.environ.get("AZURE_SPEECH_REGION"))
    synth = synth_azure if use_azure else synth_edge
    print("Using", "Azure Speech" if use_azure else "edge-tts", "with voice", args.voice)

    made = failed = 0
    for n, it in enumerate(items, 1):
        path = os.path.join(OUT, it["id"] + ".mp3")
        if os.path.exists(path) and os.path.getsize(path) > 0:
            continue
        if args.limit and made >= args.limit:
            break
        for attempt in range(3):
            try:
                synth(it["text"], path, args.voice, args.rate)
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
        time.sleep(0.2)

    total = write_manifest()
    print(f"Done. {made} new, {failed} failed, {total} files in audio/. manifest.json updated.")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
