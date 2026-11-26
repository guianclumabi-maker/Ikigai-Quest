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
function checkQuestion(question, where) {
  assert.ok(question.prompt?.trim(), `${where} has no prompt`);
  assert.ok(question.why?.trim(), `${where} has no explanation`);
  assert.ok(Array.isArray(question.choices) && question.choices.length >= 3, `${where} has too few choices`);
  assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.choices.length, `${where} has an invalid answer`);
  assert.equal(new Set(question.choices.map(choice => String(choice).trim())).size, question.choices.length, `${where} has duplicate choices`);
}
for (const lesson of context.window.ikigaiJft.lessons) {
  assert.equal(lesson.questions.length, 15, `Chapter ${lesson.id} does not have 15 questions`);
  lesson.questions.forEach((question, index) => checkQuestion(question, `Chapter ${lesson.id} question ${index + 1}`));
}
for (const exam of context.window.ikigaiJft.exams) {
  const questions = exam.sections.flatMap(section => section.groups.flatMap(group => group.questions));
  assert.equal(questions.length, 48, `Mock ${exam.id} does not have 48 questions`);
  questions.forEach((question, index) => checkQuestion(question, `Mock ${exam.id} question ${index + 1}`));
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

// A failed content load must show a recovery action instead of an empty lesson page.
const failedReader = { innerHTML: '' };
let onLoad;
const failedContext = vm.createContext({
  window: { addEventListener(name, callback) { if (name === 'load') onLoad = callback; } },
  document: { querySelector: selector => selector === '#reader' ? failedReader : null },
});
vm.runInContext(fs.readFileSync(path.join(__dirname, 'boot-check.js'), 'utf8'), failedContext);
onLoad();
assert.ok(failedReader.innerHTML.includes('The lessons did not load'), 'Missing lesson data has no visible recovery message');
assert.ok(failedReader.innerHTML.includes('Reload the course'), 'Missing lesson data has no reload action');
failedReader.innerHTML = 'Course loaded';
failedContext.window.ikigaiJftReady = true;
onLoad();
assert.equal(failedReader.innerHTML, 'Course loaded', 'Load check replaced a working course');
const entry = fs.readFileSync(path.join(__dirname, '..', 'jft-basic.html'), 'utf8');
const versionedAssets = [...entry.matchAll(/(?:src|href)="(jft\/(?:[\w-]+\.(?:js|css))\?v=([^"]+))"/g)];
assert.equal(versionedAssets.length, 11, 'A JFT asset is not versioned');
assert.equal(new Set(versionedAssets.map(match => match[2])).size, 1, 'JFT assets have mixed versions');
