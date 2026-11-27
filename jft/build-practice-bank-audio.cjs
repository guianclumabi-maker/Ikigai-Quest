const fs = require('node:fs');
const path = require('node:path');
global.window = {};
require('./practice-bank-data.js');
const id = value => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619) >>> 0;
  return 'a' + hash.toString(16).padStart(8, '0');
};
const clips = window.ikigaiJftPracticeBank.listening.map(set => ({ id: id(set.source), text: set.source }));
fs.writeFileSync(path.join(__dirname, 'practice-bank-audio-texts.json'), JSON.stringify(clips, null, 2) + '\n');
console.log(`${clips.length} original listening clips requested.`);
