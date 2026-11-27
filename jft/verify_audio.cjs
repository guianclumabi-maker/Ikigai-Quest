const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = __dirname;
const clips = JSON.parse(fs.readFileSync(path.join(root, 'audio-texts.json'), 'utf8'));
const context = { window: {} };
for (const name of ['content', 'expansion', 'expansion-more', 'expansion-final', 'deep-practice', 'stage-reviews', 'real-life-readings', 'mock-variety']) {
  vm.runInNewContext(fs.readFileSync(path.join(root, `${name}.js`), 'utf8'), context, { filename: name });
}
vm.runInNewContext(fs.readFileSync(path.join(root, 'audio-manifest.js'), 'utf8'), context);
const manifest = new Set(context.window.ikigaiJftAudio);
const audioId = value => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619) >>> 0;
  return 'a' + hash.toString(16).padStart(8, '0');
};
const referenced = new Map();
const add = (text, where) => {
  assert.ok(typeof text === 'string' && text.trim(), `${where} has no spoken text`);
  const id = audioId(text);
  assert.ok(manifest.has(id), `${where} has no play button: ${id} is absent from the manifest`);
  referenced.set(id, where);
};
for (const lesson of context.window.ikigaiJft.lessons) {
  for (const [index, [, line]] of lesson.script.entries()) add(line, `Chapter ${lesson.id} dialogue line ${index + 1}`);
  for (const [index, [, line]] of (lesson.secondScript || []).entries()) add(line, `Chapter ${lesson.id} second dialogue line ${index + 1}`);
  for (const [index, question] of lesson.questions.entries()) {
    if (question.audio) add(question.audio, `Chapter ${lesson.id} question ${index + 1}`);
  }
  assert.ok(lesson.questions.some(question => question.skill === 'Listening'), `Chapter ${lesson.id} has no listening question`);
}
for (const review of context.window.ikigaiJftReviews) {
  add(review.spoken, `Stage ${review.id} spoken message`);
  assert.ok(review.questions.some(question => question[4] === 'Listening'), `Stage ${review.id} has no listening question`);
}
for (const exam of context.window.ikigaiJft.exams) {
  for (const group of exam.sections.find(section => section.title === 'Listening Comprehension').groups) {
    assert.ok(group.text, `Mock ${exam.id} listening group lacks its visible prompt`);
    add(group.script, `Mock ${exam.id} listening group`);
  }
}
assert.equal(manifest.size, clips.length, 'Manifest should cover every requested clip');
for (const { id, text } of clips) {
  assert.ok(text.trim(), `${id} is missing speech text`);
  assert.ok(manifest.has(id), `${id} is missing from the manifest`);
  const file = path.join(root, 'audio', `${id}.mp3`);
  assert.ok(fs.existsSync(file) && fs.statSync(file).size > 500, `${id} is missing audio`);
  const header = fs.readFileSync(file).subarray(0, 3);
  assert.ok(header.toString() === 'ID3' || (header[0] === 0xff && (header[1] & 0xe0) === 0xe0), `${id} is not an MP3 file`);
}
console.log(`Verified ${clips.length} JFT recordings, including ${referenced.size} distinct clips required by lessons, stage reviews, and mocks.`);
