// Build the reproducible list of JFT lesson recordings from the course data.
const fs = require('node:fs');
const path = require('node:path');
global.window = {};
for (const file of ['content', 'expansion', 'expansion-more', 'expansion-final']) require(`./${file}.js`);

function audioId(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619) >>> 0;
  return 'a' + hash.toString(16).padStart(8, '0');
}
function spoken(value) {
  return value
    .replace(/(?:^|<br\s*\/?\s*>)\s*[A-Za-z ]+\s*·\s*/gu, '、')
    .replace(/([\u3400-\u9fff々]+)（([ぁ-ゖゝゞァ-ヺー]+)）/gu, '$2')
    .replace(/（[^）]*）/gu, '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .replace(/^、/u, '');
}
const clips = new Map();
function add(display) {
  if (!display || !/[\u3040-\u30ff\u3400-\u9fff]/u.test(display)) return;
  const id = audioId(display);
  const text = spoken(display);
  if (clips.has(id) && clips.get(id).text !== text) throw new Error(`Audio ID collision: ${id}`);
  if (!clips.has(id)) clips.set(id, { id, text });
}
for (const lesson of window.ikigaiJft.lessons) {
  if (lesson.chart) for (const cell of lesson.chart.flat()) if (cell) add(cell[0]);
  if (lesson.words) for (const [ja] of lesson.words) add(ja);
  for (const example of lesson.examples) add(example[0]);
  for (const [, ja] of lesson.script) add(ja);
  for (const block of (lesson.passage || []).slice(1)) {
    for (const line of block.split(/<br\s*\/?\s*>/i)) add(line);
  }
}
for (const exam of window.ikigaiJft.exams) {
  for (const section of exam.sections) {
    for (const group of section.groups) add(group.script);
  }
}
const output = path.join(__dirname, 'audio-texts.json');
fs.writeFileSync(output, JSON.stringify([...clips.values()], null, 2) + '\n', 'utf8');
console.log(`${clips.size} unique JFT clips written to ${output}`);
