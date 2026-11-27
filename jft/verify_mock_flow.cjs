const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const file = name => fs.readFileSync(path.join(__dirname, name + '.js'), 'utf8');
const scripts = ['content', 'expansion', 'expansion-more', 'expansion-final', 'deep-practice', 'stage-reviews', 'real-life-readings', 'mock-variety', 'audio-manifest', 'reader'];
const run = (group, plays = {}, version = 2) => {
  const reader = { innerHTML: '', listeners: {}, addEventListener(name, fn) { this.listeners[name] = fn; }, querySelectorAll: () => [] };
  const elements = new Map();
  const el = key => {
    if (!elements.has(key)) elements.set(key, {
      listeners: {}, classList: { add() {}, remove() {}, toggle() {} }, dataset: {},
      addEventListener(name, fn) { this.listeners[name] = fn; },
      setAttribute() {}, removeAttribute() {}, focus() {},
    });
    return elements.get(key);
  };
  const callbacks = {};
  const location = { hash: '#mock-a' };
  let stored = JSON.stringify({ attempts: { a: {
    version, deadline: Date.now() + 3_600_000, section: 2, group,
    plays, answers: Array(48).fill(null),
  } } });
  class Audio {
    constructor() { Audio.last = this; }
    play() { return Promise.resolve(); }
    pause() {}
  }
  const context = vm.createContext({
    window: { matchMedia: () => ({ matches: false }), scrollTo() {}, setInterval() { return 1; }, addEventListener(name, fn) { callbacks[name] = fn; } },
    document: {
      documentElement: el('html'), title: '',
      querySelector: selector => selector === '#reader' ? reader : el(selector),
      querySelectorAll: () => [], getElementById: () => null,
    },
    location, Audio, localStorage: { getItem: () => stored, setItem: (_, value) => { stored = value; } },
    console, Date, Math, Set, Number, clearInterval() {},
  });
  for (const name of scripts) vm.runInContext(file(name), context, { filename: name });
  return { reader, elements, callbacks, getStored: () => JSON.parse(stored), Audio };
};

const first = run(0);
assert.match(first.reader.innerHTML, /Audio 1 of 4/);
assert.match(first.reader.innerHTML, /staff member at a station/);
assert.doesNotMatch(first.reader.innerHTML, /Two colleagues speak about tomorrow/);
first.elements.get('#mock-form').listeners.submit({ preventDefault() {} });
assert.match(first.reader.innerHTML, /Audio 2 of 4/);
assert.match(first.reader.innerHTML, /Two colleagues speak about tomorrow/);
assert.doesNotMatch(first.reader.innerHTML, /staff member at a station/);
assert.equal(first.getStored().attempts.a.group, 1);
assert.match(run(0, {}, 1).reader.innerHTML, /Start 60-minute mock/, 'A saved attempt from the older question set should restart');

const audioId = value => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619) >>> 0;
  return 'a' + hash.toString(16).padStart(8, '0');
};
const second = run(1);
const script = second.reader.innerHTML.match(/data-audio-id="([^"]+)"/);
assert.ok(script, 'Listening group needs a playable recording');
const button = {
  dataset: { audioId: script[1], mockExam: 'a' }, disabled: false,
  classList: { add() {}, remove() {} }, textContent: '',
};
second.reader.querySelectorAll = () => [button];
const click = () => second.reader.listeners.click({ target: { closest: () => button } });
click();
second.Audio.last.onended();
click();
second.Audio.last.onended();
assert.equal(second.getStored().attempts.a.plays[button.dataset.audioId], 2);
assert.equal(button.disabled, true);
click();
assert.equal(second.getStored().attempts.a.plays[button.dataset.audioId], 2);
console.log('Mock listening advances one group at a time and caps playback at two.');
