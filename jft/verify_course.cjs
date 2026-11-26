// Smoke-test every course route without a network or browser dependency.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const reader = { innerHTML: '', addEventListener() {}, querySelectorAll: () => [] };
const callbacks = {};
function element() {
  return { hidden: false, disabled: false, textContent: 'Ikigai Quest',
    classList: { toggle() {}, add() {}, remove() {} },
    addEventListener() {}, setAttribute() {}, removeAttribute() {}, focus() {} };
}
const doc = {
  title: '', documentElement: element(),
  querySelector(selector) {
    if (selector === '#reader') return reader;
    if (selector === '.skip' || selector === '#sidebar-resume' || selector === '#sidebar-lesson') return element();
    if (selector === '#reader-heading') return element();
    const id = selector.startsWith('#') ? selector.slice(1) : null;
    return id && reader.innerHTML.includes(`id="${id}"`) ? element() : null;
  },
  querySelectorAll: () => [], getElementById: () => null,
};
const location = { hash: '' };
const context = vm.createContext({
  window: { matchMedia: () => ({ matches: false }), scrollTo() {}, addEventListener(name, fn) { callbacks[name] = fn; } },
  document: doc, location, localStorage: { getItem: () => null, setItem() {} },
  console, Date, Math, Set, Number, clearInterval() {},
});
for (const file of ['content', 'expansion', 'expansion-more', 'expansion-final', 'deep-practice', 'stage-reviews', 'audio-manifest', 'reader']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, `${file}.js`), 'utf8'), context, { filename: file });
}
assert.ok(reader.innerHTML.includes('Your study path'), 'Home route failed');
for (let id = 1; id <= 36; id++) {
  location.hash = `#chapter-${id}`;
  callbacks.hashchange();
  assert.ok(reader.innerHTML.includes('Chapter checkpoint'), `Chapter ${id} did not render`);
  assert.ok(reader.innerHTML.includes('15 mixed questions'), `Chapter ${id} has the wrong practice count`);
  assert.ok(reader.innerHTML.includes('LISTEN BEFORE ANSWERING'), `Chapter ${id} lacks checkpoint audio context`);
  if (id > 2) {
    assert.ok(reader.innerHTML.includes('READ THIS BEFORE ANSWERING'), `Chapter ${id} lacks its reading source`);
    assert.ok(reader.innerHTML.includes('Conversation 2'), `Chapter ${id} has no second dialogue`);
    assert.ok(reader.innerHTML.includes('Real-life task'), `Chapter ${id} has no task`);
    assert.ok(reader.innerHTML.includes('id="recording-playback"'), `Chapter ${id} lacks voice playback`);
  }
}
for (let id = 1; id <= 7; id++) {
  location.hash = `#review-${id}`;
  callbacks.hashchange();
  assert.ok(reader.innerHTML.includes('STAGE'), `Stage review ${id} did not render`);
  assert.ok(reader.innerHTML.includes('New reading'), `Stage review ${id} has no new text questions`);
}
for (const exam of context.window.ikigaiJft.exams) {
  for (const section of exam.sections) {
    for (const group of section.groups) {
      if (section.title === 'Reading Comprehension') assert.ok(group.text, `Mock ${exam.id} has reading questions without a source`);
      if (section.title === 'Listening Comprehension') assert.ok(group.script, `Mock ${exam.id} has listening questions without audio`);
    }
  }
}
for (const route of ['#stats', '#exams']) {
  location.hash = route;
  callbacks.hashchange();
  assert.ok(reader.innerHTML.includes('reader-heading'), `${route} did not render`);
}
console.log('Rendered all 36 chapters and 7 reviews; checked reading and audio sources in both mocks.');
