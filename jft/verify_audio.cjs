const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = __dirname;
const clips = JSON.parse(fs.readFileSync(path.join(root, 'audio-texts.json'), 'utf8'));
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'audio-manifest.js'), 'utf8'), context);
const manifest = new Set(context.window.ikigaiJftAudio);
assert.equal(manifest.size, clips.length, 'Manifest should cover every requested clip');
for (const { id, text } of clips) {
  assert.ok(text.trim(), `${id} is missing speech text`);
  assert.ok(manifest.has(id), `${id} is missing from the manifest`);
  const file = path.join(root, 'audio', `${id}.mp3`);
  assert.ok(fs.existsSync(file) && fs.statSync(file).size > 500, `${id} is missing audio`);
}
console.log(`Verified ${clips.length} JFT lesson and mock recordings.`);
