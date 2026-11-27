const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = __dirname;
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'practice-bank-data.js'), 'utf8'), context);
vm.runInNewContext(fs.readFileSync(path.join(root, 'practice-bank-audio.js'), 'utf8'), context);
const { reading, listening } = context.window.ikigaiJftPracticeBank;
const ids = new Set(context.window.ikigaiJftPracticeAudio);
const requested = JSON.parse(fs.readFileSync(path.join(root, 'practice-bank-audio-texts.json'), 'utf8'));
const hash = value => {
  let n = 2166136261;
  for (let i = 0; i < value.length; i++) n = Math.imul(n ^ value.charCodeAt(i), 16777619) >>> 0;
  return 'a' + n.toString(16).padStart(8, '0');
};
assert.equal(reading.length, 40);
assert.equal(listening.length, 40);
assert.equal(requested.length, 40);
assert.equal(ids.size, 40);
assert.equal(new Set([...reading, ...listening].map(set => set.id)).size, 80);
for (const [mode, sets] of [['reading', reading], ['listening', listening]]) {
  for (const set of sets) {
    assert.ok(set.source.length >= 50, `${set.id} source is too short`);
    assert.equal(set.questions.length, 5, `${set.id} question count`);
    for (const q of set.questions) {
      assert.equal(q.choices.length, 4, `${set.id} choices`);
      assert.equal(new Set(q.choices).size, 4, `${set.id} duplicate choices`);
      assert.ok(q.answer >= 0 && q.answer < 4, `${set.id} answer`);
      assert.ok(q.explanation && set.source.includes(q.explanation.split(' says ')[1].split(', meaning ')[0]), `${set.id} answer has no clue in source`);
    }
    if (mode === 'listening') {
      const id = hash(set.source);
      assert.ok(ids.has(id), `${set.id} has no play button`);
      const file = path.join(root, 'practice-bank-audio', `${id}.mp3`);
      assert.ok(fs.existsSync(file) && fs.statSync(file).size > 500, `${set.id} has no MP3`);
      assert.equal(fs.readFileSync(file).subarray(0, 3).toString(), 'ID3', `${set.id} is not an MP3`);
    }
  }
}
const entry = fs.readFileSync(path.join(root, '..', 'jft-practice.html'), 'utf8');
const course = fs.readFileSync(path.join(root, 'reader.js'), 'utf8');
assert.ok(entry.includes('practice-bank-audio.js') && entry.includes('practice-bank.js'));
assert.ok(course.includes('href="jft-practice.html"'), 'Exam prep does not link to the bank');
console.log('Verified 40 reading and 40 listening sets, 400 questions, all source clues, and 40 MP3 player targets.');
