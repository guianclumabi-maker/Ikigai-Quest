const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('JLPT_Reading_Quest.html', 'utf8');
function segment(from, to) {
  const start = source.indexOf(from);
  const end = source.indexOf(to, start);
  assert.ok(start >= 0 && end > start, `Missing kana code: ${from}`);
  return source.slice(start, end);
}
const welcome = { innerHTML: '', querySelector: () => ({}) };
const list = { innerHTML: '', querySelectorAll: () => [], querySelector: () => ({}) };
const context = vm.createContext({
  decks: [{}, {}, {}], pilotScoreSizes: {}, shuffle: items => items.slice(),
  state: {}, todayStr: () => '2026-11-26', window: {},
  document: { querySelector: selector => selector === '#continueCard' ? welcome : list },
});
const code = segment('const kanaRows=', 'function completeKana(')
  + segment('const KANA_ROW_NAMES=', 'function openKanaUnit(')
  + segment('window.renderKanaPath=function(){', 'window.startNiReadingCheck=function(){')
  + `
    const assert = globalAssert;
    assert.equal(KANA_UNITS.length, 20);
    assert.equal(KANA_GLYPHS.length, 92);
    for (const script of KANA_SCRIPTS) {
      const units = KANA_UNITS.filter(unit => unit.deck === script.deck);
      assert.equal(units.length, 10);
      assert.equal(units.flatMap(kanaEntries).length, 46);
      for (const unit of units) {
        const entries = kanaEntries(unit);
        assert.equal(entries.length, unit.words.length);
        assert.equal(pilotScoreSizes[unit.id], entries.length * 3);
        for (const entry of entries) {
          assert.ok(entry.word[0].includes(entry.glyph), unit.id + ': example omits ' + entry.glyph);
          assert.ok(entry.word[1] && entry.word[2]);
          for (const type of ['sound', 'character', 'word']) {
            const question = kanaPrompt(entry, type);
            assert.equal(question.options.length, 4);
            assert.equal(new Set(question.options).size, 4);
            assert.ok(question.answer >= 0 && question.answer < 4);
          }
        }
      }
    }
  `;
context.globalAssert = assert;
vm.runInContext(code, context);
context.window.renderKanaPath();
assert.equal([...list.innerHTML.matchAll(/data-kana-unit=/g)].length, 20);
assert.ok(list.innerHTML.includes('10 groups practised'));
assert.ok(welcome.innerHTML.includes('KANA STUDIO'));
console.log('Verified all 92 kana introductions and their practice choices.');
