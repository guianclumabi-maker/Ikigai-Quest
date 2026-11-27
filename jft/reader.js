(() => {
  'use strict';
  const reader = document.querySelector('#reader');
  if (!reader || !window.ikigaiJft?.lessons?.length) return;
  const { lessons, exams } = window.ikigaiJft;
  const reviews = window.ikigaiJftReviews || [];
  const extraReadings = window.ikigaiJftReadings || [];
  const workbook = 'pdf/Ikigai_Quest_JFT_Basic_A2_Learner_Workbook.pdf';
  const title = 'Japanese for Life in Japan';
  const audioFiles = new Set(window.ikigaiJftAudio || []);
  let activeAudio = null;
  let activeAudioId = null;
  let practiceRecorder = null;
  let practiceStream = null;
  let practicePlaybackUrl = null;
  let practiceGeneration = 0;
  const stages = [
    { name: 'Start from zero', description: 'The writing systems, introductions, and everyday numbers', ids: [1, 2, 3, 4] },
    { name: 'Daily errands', description: 'Shops, food, transport, and your neighborhood', ids: [5, 6, 7, 8, 9] },
    { name: 'Life and work', description: 'Work, health, housing, and your community', ids: [10, 11, 12, 13, 14, 15] },
    { name: 'Plans and participation', description: 'Weather, places, directions, hobbies, and classes', ids: [16, 17, 18, 19, 20, 21] },
    { name: 'Food, travel, and health', description: 'Cooking, restrictions, bookings, changes, and care', ids: [22, 23, 24, 25, 26, 27] },
    { name: 'Community and work', description: 'Manners, events, handovers, problems, and safety', ids: [28, 29, 30, 31, 32, 33] },
    { name: 'Your next steps', description: 'Progress, future goals, and information search', ids: [34, 35, 36] },
  ];
  const officialSamples = [
    ['Script and vocabulary', 'Word meaning', 'Recognize a word from its context'],
    ['Script and vocabulary', 'Word usage', 'Choose a word that fits a sentence'],
    ['Script and vocabulary', 'Kanji reading', 'Choose a written word’s reading'],
    ['Script and vocabulary', 'Kanji meaning and usage', 'Use the right kanji word in context'],
    ['Conversation and expression', 'Grammar', 'Complete a sentence for the situation'],
    ['Conversation and expression', 'Expression', 'Choose a natural reply'],
    ['Listening', 'Conversation', 'Understand a social exchange'],
    ['Listening', 'Shop or public place', 'Understand a service exchange'],
    ['Listening', 'Announcement or instruction', 'Find details in spoken information'],
    ['Reading', 'Content comprehension', 'Answer questions about an event account'],
    ['Reading', 'Information search', 'Compare details on a medicine information sheet'],
  ];
  const storageKey = 'ikigaiJftProgressV1';
  let state = { done: [], taskDone: [], best: {}, missed: {}, reviewBest: {}, mockBest: {}, attempts: {}, last: null, furigana: true };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (saved && typeof saved === 'object') {
      const { done, taskDone, best, missed, reviewBest, mockBest, attempts, last, furigana } = saved;
      if (Array.isArray(done)) state.done = done.filter(id => lessons.some(lesson => lesson.id === id));
      if (Array.isArray(taskDone)) state.taskDone = taskDone.filter(id => lessons.some(lesson => lesson.id === id));
      if (best && typeof best === 'object') state.best = best;
      if (missed && typeof missed === 'object') state.missed = missed;
      if (reviewBest && typeof reviewBest === 'object') state.reviewBest = reviewBest;
      if (mockBest && typeof mockBest === 'object') state.mockBest = mockBest;
      if (attempts && typeof attempts === 'object') state.attempts = attempts;
      if (last && lessons.some(lesson => lesson.id === last.id)) state.last = last;
      if (typeof furigana === 'boolean') state.furigana = furigana;
    }
  } catch { /* The course works when browser storage is unavailable. */ }

  let currentChapter = null;
  let ticking;
  let latestResult = null;
  let renderCount = 0;

  const escape = value => String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
  const recognizedSections = ['words', 'examples', 'reading', 'listening', 'drills', 'practice'];
  const jpPattern = /[\u3040-\u30ff\u3400-\u9fff]/;
  const latinPattern = /[A-Za-z]/;
  const lessonById = id => lessons.find(lesson => lesson.id === id);
  const number = n => String(n).padStart(2, '0');
  const lessonLink = (id, section) => `#chapter-${id}${recognizedSections.includes(section) ? '/' + section : ''}`;
  function audioId(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619) >>> 0;
    return 'a' + hash.toString(16).padStart(8, '0');
  }
  function listenButton(value, label = 'Listen to the Japanese', mockExam = '') {
    const id = audioId(value);
    const plays = mockExam ? Number(state.attempts[mockExam]?.plays?.[id]) || 0 : 0;
    return audioFiles.has(id) ? `<button class="listen-button" type="button" data-audio-id="${id}" ${mockExam ? `data-mock-exam="${escape(mockExam)}" ${plays >= 2 ? 'disabled' : ''}` : ''} aria-label="${escape(label)}">${mockExam ? plays >= 2 ? 'Played twice' : `▶ Listen · ${2 - plays} plays left` : '▶ Listen'}</button>` : '';
  }
  function stopAudio() {
    if (activeAudio) activeAudio.pause();
    activeAudio = null;
    activeAudioId = null;
    if (reader.querySelectorAll) reader.querySelectorAll('[data-audio-id]').forEach(button => {
      button.classList.remove('is-playing');
      const plays = button.dataset.mockExam ? Number(state.attempts[button.dataset.mockExam]?.plays?.[button.dataset.audioId]) || 0 : 0;
      button.textContent = button.dataset.mockExam ? plays >= 2 ? 'Played twice' : `▶ Listen · ${2 - plays} plays left` : '▶ Listen';
      if (button.dataset.mockExam) button.disabled = plays >= 2;
    });
  }
  function clearPracticeRecording() {
    practiceGeneration++;
    if (practiceRecorder?.state === 'recording') {
      practiceRecorder.onstop = null;
      practiceRecorder.stop();
    }
    practiceStream?.getTracks().forEach(track => track.stop());
    if (practicePlaybackUrl) URL.revokeObjectURL(practicePlaybackUrl);
    practiceRecorder = null;
    practiceStream = null;
    practicePlaybackUrl = null;
  }
  function continueTo(id, label) {
    return `<div class="section-next"><span>Keep going</span><a href="${lessonLink(currentChapter, id)}">${label} →</a></div>`;
  }

  function copy(value, addRuby = true) {
    const text = escape(value)
      .replace(/&lt;br\s*\/?&gt;/gi, '<br>')
      .replace(/＿＿/g, '<span aria-label="blank">＿＿</span>');
    return addRuby
      ? text.replace(/([\u3400-\u9fff々]+)（([ぁ-ゖゝゞー]+)）/gu, '<ruby>$1<rt>$2</rt></ruby>')
      : text;
  }

  function sentence(value, withRuby = true) {
    return jpPattern.test(value) && !latinPattern.test(value)
      ? `<span lang="ja">${copy(value, withRuby)}</span>`
      : copy(value, withRuby);
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch { /* Keep progress in memory for the current visit. */ }
  }

  function lessonDone(id) {
    if (!state.done.includes(id)) state.done.push(id);
    save();
  }

  function downloadLink() {
    return `<a class="button" href="${workbook}" download>Download starter workbook</a>`;
  }

  function setHeading(element, focus) {
    document.title = `${element.textContent} · Ikigai Quest`;
    if (focus) element.focus({ preventScroll: true });
  }

  function showHome() {
    const next = lessonById(state.last?.id) || lessons.find(l => !state.done.includes(l.id)) || lessons[0];
    const resumeHref = lessonLink(next.id, state.last?.id === next.id ? state.last.section : null);
    const done = new Set(state.done).size;
    const resume = state.last ? 'Continue studying' : 'Start the first chapter';
    reader.innerHTML = `
      <section class="cover" aria-labelledby="reader-heading">
        <div>
          <p class="label">JFT-BASIC A2 STUDY PATH</p>
          <h1 id="reader-heading" tabindex="-1">${title}</h1>
          <p>Start with kana, then practice the Japanese you need for errands, travel, and work.</p>
        </div>
        <div class="cover-japanese" lang="ja"><strong>あいう</strong><span>A small start.<br>A world of possibility.</span></div>
      </section>
      <div class="study-progress">
        <span>Journey progress <small>${done} of ${lessons.length} chapters read</small></span>
        <progress max="${lessons.length}" value="${done}" aria-label="Chapters read"></progress>
        <strong>${Math.round(done / lessons.length * 100)}%</strong>
        <small>Every journey begins with a first step.</small>
      </div>
      <section class="resume-card" aria-labelledby="next-heading">
        <div><p class="label">${state.last ? 'PICK UP WHERE YOU LEFT OFF' : 'START HERE'}</p>
        <h2 id="next-heading">${state.last ? escape(next.title) : 'Your first step starts with あ.'}</h2>
        <p class="muted">${escape(next.title)} · ${escape(next.goal)}</p></div>
        <a class="button strong" href="${resumeHref}">${resume}</a>
      </section>
      <div class="home-flow"><section class="catalog" aria-labelledby="chapter-heading">
        <div class="catalog-heading">
          <h2 id="chapter-heading">Your study path</h2><span>${lessons.length} chapters · ${stages.length} stages</span>
        </div>
        ${stages.map((stage, index) => {
          const completed = stage.ids.filter(id => state.done.includes(id)).length;
          return `<details ${stage.ids.includes(next.id) ? 'open' : ''}>
            <summary><span class="stage-index">${number(index + 1)}</span><span class="stage-name"><strong>${stage.name}</strong><small>${stage.description}</small></span><span class="stage-progress">${completed} / ${stage.ids.length} read</span></summary>
            <ol class="chapter-list">${stage.ids.map(id => {
              const chapter = lessonById(id);
              const mark = state.done.includes(id) ? '<span class="completed">Read</span>' : '';
              const rowClass = state.done.includes(id) ? 'is-done' : id === next.id ? 'is-current' : '';
              return `<li><a href="${lessonLink(id)}" class="${rowClass}"><span class="chapter-number">${number(id)}</span>
                <span><span class="chapter-title">${escape(chapter.title)}</span><span class="chapter-goal">${escape(chapter.goal)}</span></span>${mark}
              </a></li>`;
            }).join('')}</ol><a class="stage-review-link" href="#review-${index + 1}">Stage review · two new readings and listening ${Number.isInteger(state.reviewBest[index + 1]) ? `· best ${state.reviewBest[index + 1]}` : ''} →</a></details>`;
        }).join('')}
        <p class="course-crosslink">Studying for the Japanese-Language Proficiency Test? <a href="JLPT_Reading_Quest.html">Open the JLPT N5/N4 course.</a></p>
      </section><aside class="home-rail" aria-label="After the chapters">
      <section class="paper-card"><h2>Learn on paper, too.</h2><p>The free starter workbook covers chapters 1–15 and the original practice exams. New chapters 16–36 are available here in the app.</p>${downloadLink()}</section>
      <section class="exambox"><p class="label">EXAM PRACTICE</p><h2>JFT-Basic practice exams</h2>
        <p>Try two original tests with 48 questions each. Get explanations and a breakdown by section after you submit.</p>
        <a class="button strong" href="#exams">Open exam practice</a>
      </section></aside></div>`;
  }

  function reference() {
    return `<details><summary>Number and date reference</summary><div class="details-body japanese" lang="ja">
      <p>0 ゼロ · 1 いち · 2 に · 3 さん · 4 よん · 5 ご · 6 ろく · 7 なな · 8 はち · 9 きゅう · 10 じゅう · 100 ひゃく</p>
      <p>11 十一（じゅういち） · 20 二十（にじゅう） · 48 四十八（よんじゅうはち）</p>
      <p>Months use 月（がつ）. Remember 四月（しがつ）, 七月（しちがつ）, and 九月（くがつ）.</p>
      <p>月曜日（げつようび） · 火曜日（かようび） · 水曜日（すいようび） · 木曜日（もくようび） · 金曜日（きんようび） · 土曜日（どようび） · 日曜日（にちようび）</p>
      <p>1日 ついたち · 2日 ふつか · 3日 みっか · 4日 よっか · 5日 いつか · 6日 むいか · 7日 なのか · 8日 ようか · 9日 ここのか · 10日 とおか</p>
      <p>14日 じゅうよっか · 19日 じゅうくにち · 20日 はつか · 24日 にじゅうよっか · 29日 にじゅうくにち</p>
      <p>四時（よじ） · 七時（しちじ） · 九時（くじ） · 十分（じゅっぷん） · 九時半（くじはん）</p>
      <p>百円（ひゃくえん） · 三百円（さんびゃくえん） · 六百円（ろっぴゃくえん） · 八百円（はっぴゃくえん）</p>
    </div></details>`;
  }

  function kanaChart(lesson) {
    return `<button class="button" id="kana-toggle" aria-pressed="false" type="button">Hide readings</button>
      <div class="kana-grid" id="kana-grid">${lesson.chart.flat().map(cell => cell
        ? `<div class="kana-cell"><b lang="ja">${escape(cell[0])}</b><span class="kana-reading">${escape(cell[1])}</span>${listenButton(cell[0], `Hear ${cell[0]}`)}</div>`
        : '<div class="kana-cell blank" aria-hidden="true"></div>').join('')}</div>
      <p class="muted">${copy(lesson.clue)}</p>`;
  }

  function examples(lesson) {
    return `<ul class="examples">${lesson.examples.map(([ja, en, note]) => `<li>
      <p class="japanese" lang="ja">${copy(ja)} ${listenButton(ja, `Listen to ${ja}`)}</p><p><strong>${escape(en)}</strong></p>
      <p class="muted">${copy(note)}</p></li>`).join('')}</ul>`;
  }

  function scriptContent(script) {
    return script.map(([who, ja, en]) => `<div class="script-turn"><strong>${escape(who)}</strong>
      <p class="japanese" lang="ja">${copy(ja)}</p><p class="muted">${escape(en)}</p></div>`).join('');
  }

  function shiftTable() {
    return `<table>
      <caption class="muted">Ken’s shift schedule</caption>
      <thead><tr><th scope="col">Day</th><th scope="col">Previous</th><th scope="col">Updated</th></tr></thead>
      <tbody><tr><th scope="row" lang="ja">火曜日</th><td>9:00–17:00</td><td>11:00–19:00</td></tr>
      <tr><th scope="row" lang="ja">水曜日</th><td>9:00–17:00</td><td>9:00–17:00</td></tr></tbody>
    </table>`;
  }

  function lessonPassage(lesson) {
    if (!lesson.passage) return '';
    return `<section id="reading" aria-labelledby="reading-label"><h2 id="reading-label">Read</h2>
      <div class="passage"><h3>${escape(lesson.passage[0])}</h3>
      <div class="passage-lines japanese" lang="ja">${lesson.passage.slice(1).flatMap(x => x.split(/<br\s*\/?\s*>/i)).map(x => `<p>${copy(x)} ${listenButton(x, 'Listen to this line')}</p>`).join('')}</div>
      ${lesson.id === 11 ? shiftTable() : ''}</div>
      <details><summary>Show translation</summary><div class="details-body"><p>${escape(lesson.translation)}</p></div></details>
      ${continueTo('listening', 'Listen to the dialogue')}
    </section>`;
  }

  function choiceIndexes(question) {
    return question.choices.map((_, index) => index);
  }

  function shuffledChoices(question) {
    const order = choiceIndexes(question);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }

  function questionHTML(question, id, selected, required, order = choiceIndexes(question)) {
    return `<fieldset class="question"><legend>${id + 1}. ${sentence(question.prompt)}</legend>
      ${question.skill ? `<p class="label">${escape(question.skill)}</p>` : ''}
      ${question.audio ? `<div class="question-audio">${listenButton(question.audio, 'Play the question audio')}</div>` : ''}
      ${order.map((index, position) =>
        `<label class="choice"><input type="radio" name="q${id}" value="${index}" ${index === selected ? 'checked' : ''} ${required && position === 0 ? 'required' : ''}>
          <span class="choice-letter" aria-hidden="true">${String.fromCharCode(65 + position)}</span>
          <span>${sentence(question.choices[index])}</span></label>`).join('')}
      </fieldset>`;
  }

  function checkpointQuestions(lesson) {
    const readingStart = lesson.questions.findIndex(q => q.skill === 'Reading');
    const listeningStart = lesson.questions.findIndex(q => q.skill === 'Listening');
    return lesson.questions.map((q, i) => {
      const readingSource = i === readingStart && lesson.passage ? `<div class="checkpoint-source" aria-label="Reading material for the next questions">
        <p class="label">READ THIS BEFORE ANSWERING</p><h3>${escape(lesson.passage[0])}</h3>
        <div class="japanese" lang="ja">${lesson.passage.slice(1).flatMap(x => x.split(/<br\s*\/?\s*>/i)).map(line => `<p>${copy(line)}</p>`).join('')}</div>
        ${lesson.id === 11 ? shiftTable() : ''}</div>` : '';
      const listeningSource = i === listeningStart ? `<div class="checkpoint-source" aria-label="Audio for the next questions">
        <p class="label">LISTEN BEFORE ANSWERING</p><h3>${lesson.chart ? 'Hear the word' : 'Hear the conversation'}</h3>
        <div class="dialogue-audio">${lesson.script.map(([who, ja], index) => `<div><span>${escape(who)}</span>${listenButton(ja, `Play line ${index + 1} by ${who}`)}</div>`).join('')}</div></div>` : '';
      return readingSource + listeningSource + questionHTML(q, i, null, true, shuffledChoices(q));
    }).join('');
  }

  function score(questions, selections) {
    return questions.reduce((total, question, i) => total + Number(selections[i] === question.answer), 0);
  }

  function answerList(questions, selections) {
    return `<ol>${questions.map((question, i) => {
      const correct = question.answer === selections[i];
      const picked = question.choices[selections[i]];
      return `<li><strong class="${correct ? '' : 'missed'}">${correct ? 'Correct' : 'Review'}</strong>
        ${picked && !correct ? `· You chose ${sentence(picked)}` : ''}
        <div><b>Answer</b> ${sentence(question.choices[question.answer])}</div>
        <div>${copy(question.why)}</div></li>`;
    }).join('')}</ol>`;
  }

  function setFurigana() {
    document.documentElement.classList.toggle('furigana-hidden', !state.furigana);
    const button = document.querySelector('#furigana');
    if (button) button.setAttribute('aria-pressed', String(state.furigana));
  }

  function showChapter(lesson, section) {
    const id = lesson.id;
    const done = state.done.includes(id);
    const hadScore = Number.isInteger(state.best[id]);
    const outline = [['words', lesson.chart ? 'Kana chart' : 'Vocabulary'], ['examples', 'Worked examples'],
      ...(lesson.passage ? [['reading', 'Reading']] : []), ['listening', 'Listening'],
      ...(lesson.secondScript || lesson.kanaDrill ? [['drills', 'Try it yourself']] : []), ['practice', 'Mixed checkpoint']];
    reader.innerHTML = `
      <div class="reader-top"><a href="#chapters">All JFT-Basic chapters</a>
        <button class="button" id="furigana" type="button">Furigana</button></div>
      <div class="reader-grid">
        <details class="outline" ${window.matchMedia('(min-width: 1121px)').matches ? 'open' : ''}><summary>On this page</summary>
          <nav aria-label="Lesson contents">${outline.map(([slug, label]) => `<a href="${lessonLink(id, slug)}">${label}</a>`).join('')}</nav>
        </details>
        <article class="sheet">
          <p class="label">CHAPTER ${number(id)} OF ${lessons.length}</p>
          <h1 id="reader-heading" tabindex="-1">${escape(lesson.title)}</h1>
          <p class="lede"><strong>After this chapter</strong> · ${escape(lesson.goal)}</p>
          <p>${copy(lesson.scene)}</p>
          <section id="words" aria-labelledby="words-label">
            <h2 id="words-label">${lesson.chart ? 'Meet the sounds' : 'Words for this situation'}</h2>
            ${lesson.chart ? kanaChart(lesson) : `<dl class="vocabulary">${lesson.words.map(([ja, en]) =>
              `<div><dt class="japanese" lang="ja">${copy(ja)} ${listenButton(ja, `Hear ${ja}`)}</dt><dd>${escape(en)}</dd></div>`).join('')}</dl>`}
            ${id === 4 ? reference() : ''}
            ${continueTo('examples', 'Read the examples')}
          </section>
          <section id="examples" aria-labelledby="examples-label"><h2 id="examples-label">Worked examples</h2>
            <p>${copy(lesson.teach)}</p>${examples(lesson)}
            ${continueTo(lesson.passage ? 'reading' : 'listening', lesson.passage ? 'Read a real-life text' : 'Listen to the dialogue')}</section>
          ${lessonPassage(lesson)}
          <section id="listening" aria-labelledby="listening-label"><h2 id="listening-label">Listen to the dialogue</h2>
            <p>Play each line and listen before opening the transcript. Try to catch the speaker’s goal and the important detail.</p>
            <h3>Conversation 1 · learn the situation</h3>
            <div class="dialogue-audio">${lesson.script.map(([who, ja], i) => `<div><span>${escape(who)}</span>${listenButton(ja, `Play line ${i + 1} by ${who}`)}</div>`).join('')}</div>
            <details><summary>Open script and translation</summary><div class="details-body">${scriptContent(lesson.script)}</div></details>
            ${lesson.secondScript ? `<h3>Conversation 2 · a different exchange</h3>
              <div class="dialogue-audio">${lesson.secondScript.map(([who, ja], i) => `<div><span>${escape(who)}</span>${listenButton(ja, `Play line ${i + 1} by ${who}`)}</div>`).join('')}</div>
              <details><summary>Open the second script and translation</summary><div class="details-body">${scriptContent(lesson.secondScript)}</div></details>` : ''}
            ${continueTo(lesson.secondScript || lesson.kanaDrill ? 'drills' : 'practice', lesson.secondScript || lesson.kanaDrill ? 'Try the activities' : 'Try the checkpoint')}
          </section>
          ${lesson.kanaDrill ? `<section id="drills" aria-labelledby="drills-label"><h2 id="drills-label">Recall the sounds</h2>
            <p>Say each character before opening its answer. Listen, repeat, then return to the chart for any sound you missed.</p>
            <div class="recall-grid">${lesson.chart.flat().filter(Boolean).slice(0, 16).map(([kana, reading]) => `<details><summary class="japanese" lang="ja">${escape(kana)}</summary><p>${escape(reading)} ${listenButton(kana, `Hear ${kana}`)}</p></details>`).join('')}</div>
            ${continueTo('practice', 'Take the mixed checkpoint')}
          </section>` : ''}
          ${lesson.secondScript ? `<section id="drills" aria-labelledby="drills-label"><h2 id="drills-label">Try it yourself</h2>
            <p>Recall the words first. Then respond to the situation aloud or in writing before opening the model answer.</p>
            <div class="recall-grid">${lesson.words.slice(0, 4).map(([ja, en]) => `<details><summary>${escape(en)}</summary><p class="japanese" lang="ja">${copy(ja)} ${listenButton(ja, `Hear ${ja}`)}</p></details>`).join('')}</div>
            <section class="practice-task" aria-labelledby="practice-task-label"><h3 id="practice-task-label">Real-life task</h3>
              <p>${escape(lesson.task[0])}</p>
              <label class="response-label" for="task-response">Your response</label>
              <textarea id="task-response" rows="3" placeholder="Try a short response in Japanese"></textarea>
              <div class="voice-practice" aria-label="Record and play your answer">
                <button class="button" id="record-voice" type="button">● Record my answer</button>
                <button class="button" id="stop-recording" type="button" disabled>Stop recording</button>
                <audio id="recording-playback" controls hidden></audio>
                <p id="recording-status" class="muted" role="status">Your recording stays in this browser tab. It disappears when you leave the chapter.</p>
              </div>
              <p class="muted">Check that your response fits the situation and includes the important detail. Speaking aloud is fine too.</p>
              <details><summary>Show a possible response</summary><div class="details-body"><p class="japanese" lang="ja">${copy(lesson.task[1])}</p></div></details>
              <button class="button task-done" id="mark-task" type="button" ${state.taskDone.includes(id) ? 'disabled' : ''}>${state.taskDone.includes(id) ? 'Task practiced' : 'I practiced this task'}</button>
            </section>
            ${continueTo('practice', 'Take the mixed checkpoint')}
          </section>` : ''}
          <section id="practice" aria-labelledby="practice-label"><h2 id="practice-label">Chapter checkpoint</h2>
            <p>${lesson.questions.length} mixed questions: vocabulary, expressions, reading, and listening. The answer choices change order when you retry.</p>
            <p id="chapter-best" class="muted">${hadScore ? `Best score: ${state.best[id]} / ${lesson.questions.length}` : ''}</p>
            <form id="checkpoint">
              <fieldset class="checkpoint-items" id="checkpoint-items" aria-label="Checkpoint questions">${checkpointQuestions(lesson)}</fieldset>
              <button class="button strong" id="check-answers" type="submit">Check my answers</button>
            </form>
            <div class="result" id="checkpoint-result" tabindex="-1" aria-live="polite"></div>
            <button class="button" id="retry-checkpoint" type="button" hidden>Try checkpoint again</button>
            ${lesson.task && !lesson.secondScript ? `<section class="practice-task" aria-labelledby="practice-task-label">
              <h3 id="practice-task-label">Try it yourself</h3>
              <p>${escape(lesson.task[0])}</p>
              <details><summary>Show example response</summary><div class="details-body"><p class="japanese">${copy(lesson.task[1])}</p></div></details>
            </section>` : ''}
          </section>
          <section class="actions" aria-label="Chapter progress">
            <button class="button" id="mark-read" type="button" ${done ? 'disabled' : ''}>${done ? 'Chapter read' : 'Mark as read'}</button>
            <a class="button strong" href="${id === lessons.length ? '#exams' : lessonLink(id + 1)}">${id === lessons.length ? 'Exam practice' : 'Next chapter'}</a>
          </section>
        </article>
      </div>`;
    const furigana = document.querySelector('#furigana');
    furigana.addEventListener('click', () => {
      state.furigana = !state.furigana;
      save();
      setFurigana();
    });
    setFurigana();
    const mark = document.querySelector('#mark-read');
    const markRead = () => {
      lessonDone(id);
      mark.textContent = 'Chapter read';
      mark.disabled = true;
    };
    mark.addEventListener('click', markRead);
    const form = document.querySelector('#checkpoint');
    const items = document.querySelector('#checkpoint-items');
    const submit = document.querySelector('#check-answers');
    const retry = document.querySelector('#retry-checkpoint');
    const result = document.querySelector('#checkpoint-result');
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (submit.disabled) return;
      const values = new FormData(form);
      const selected = lesson.questions.map((_, i) => values.has(`q${i}`) ? Number(values.get(`q${i}`)) : null);
      const points = score(lesson.questions, selected);
      state.missed[id] = selected.flatMap((choice, index) => choice === lesson.questions[index].answer ? [] : [index]);
      state.best[id] = Math.max(Number(state.best[id]) || 0, points);
      state.last = { id, section: 'practice' };
      markRead();
      updateSidebar(id <= 2 ? 'kana' : 'learn');
      document.querySelector('#chapter-best').textContent = `Best score: ${state.best[id]} / ${lesson.questions.length}`;
      result.innerHTML = `<h3>${points} of ${lesson.questions.length} correct</h3>${answerList(lesson.questions, selected)}`;
      items.disabled = true;
      submit.disabled = true;
      retry.hidden = false;
      result.focus();
    });
    retry.addEventListener('click', () => {
      items.innerHTML = checkpointQuestions(lesson);
      items.disabled = false;
      submit.disabled = false;
      result.innerHTML = '';
      retry.hidden = true;
      items.querySelector('input').focus();
    });
    const taskButton = document.querySelector('#mark-task');
    if (taskButton) taskButton.addEventListener('click', () => {
      if (!state.taskDone.includes(id)) state.taskDone.push(id);
      taskButton.textContent = 'Task practiced';
      taskButton.disabled = true;
      save();
    });
    const recordButton = document.querySelector('#record-voice');
    if (recordButton) {
      const stopButton = document.querySelector('#stop-recording');
      const playback = document.querySelector('#recording-playback');
      const status = document.querySelector('#recording-status');
      const generation = practiceGeneration;
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        recordButton.disabled = true;
        status.textContent = 'Recording is unavailable in this browser. You can type or say your answer aloud.';
      } else {
        recordButton.addEventListener('click', async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (generation !== practiceGeneration) { stream.getTracks().forEach(track => track.stop()); return; }
            practiceStream = stream;
            const chunks = [];
            const recorder = new window.MediaRecorder(stream);
            practiceRecorder = recorder;
            recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
            recorder.onstop = () => {
              stream.getTracks().forEach(track => track.stop());
              practiceStream = null;
              if (generation !== practiceGeneration) return;
              if (!chunks.length) {
                recordButton.disabled = false;
                stopButton.disabled = true;
                status.textContent = 'No audio was captured. Please try recording again.';
                return;
              }
              if (practicePlaybackUrl) URL.revokeObjectURL(practicePlaybackUrl);
              const clip = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
              practicePlaybackUrl = URL.createObjectURL(clip);
              playback.src = practicePlaybackUrl;
              playback.hidden = false;
              recordButton.disabled = false;
              stopButton.disabled = true;
              status.textContent = 'Recording ready. Use the player to hear your answer.';
            };
            recorder.start();
            recordButton.disabled = true;
            stopButton.disabled = false;
            status.textContent = 'Recording… speak your answer, then press Stop recording.';
          } catch {
            practiceStream?.getTracks().forEach(track => track.stop());
            practiceStream = null;
            recordButton.disabled = false;
            stopButton.disabled = true;
            status.textContent = 'Microphone access was not available. You can type or say your answer aloud.';
          }
        });
        stopButton.addEventListener('click', () => {
          if (practiceRecorder?.state === 'recording') practiceRecorder.stop();
          stopButton.disabled = true;
        });
      }
    }
    const kana = document.querySelector('#kana-toggle');
    if (kana) kana.addEventListener('click', () => {
      const hidden = document.querySelector('#kana-grid').classList.toggle('conceal');
      kana.textContent = hidden ? 'Show readings' : 'Hide readings';
      kana.setAttribute('aria-pressed', String(hidden));
    });
    state.last = { id, section };
    save();
  }

  function showStats() {
    const done = new Set(state.done).size;
    const attempted = lessons.filter(l => Number.isInteger(state.best[l.id]));
    const missedChapters = lessons.filter(l => Array.isArray(state.missed[l.id]) && state.missed[l.id].length);
    const scoreText = exam => Number.isInteger(state.mockBest[exam.id]) ? `${state.mockBest[exam.id]} / 48` : 'Unattempted';
    reader.innerHTML = `
      <div class="reader-top"><a href="#chapters">All JFT-Basic chapters</a></div>
      <article class="sheet">
        <p class="label">JFT-BASIC</p>
        <h1 id="reader-heading" tabindex="-1">Your progress</h1>
        <p class="muted">JFT-Basic progress is saved in this browser.</p>
        <div class="stats-grid">
          <div class="stat-tile"><strong>${done} / ${lessons.length}</strong><span>Chapters read</span></div>
          <div class="stat-tile"><strong>${attempted.length} / ${lessons.length}</strong><span>Checkpoints taken</span></div>
          <div class="stat-tile"><strong>${state.taskDone.length} / ${lessons.filter(l => l.task).length}</strong><span>Real-life tasks practiced</span></div>
          <div class="stat-tile"><strong>${Object.keys(state.reviewBest).length} / ${reviews.length}</strong><span>Stage reviews taken</span></div>
          ${exams.map(exam => `<div class="stat-tile"><strong>${scoreText(exam)}</strong><span>Mock ${exam.id.toUpperCase()} best score</span></div>`).join('')}
        </div>
        <section><h2>Checkpoint results</h2>
          ${attempted.length
            ? `<table><thead><tr><th scope="col">Chapter</th><th scope="col">Best score</th></tr></thead>
              <tbody>${attempted.map(l => `<tr><th scope="row"><a href="${lessonLink(l.id, 'practice')}">${escape(l.title)}</a></th>
                <td>${state.best[l.id]} / ${l.questions.length}</td></tr>`).join('')}</tbody></table>`
            : '<p>Take a chapter checkpoint to see your result here.</p>'}
          <a class="button" href="#exams">Go to exam prep</a>
        </section>
        ${missedChapters.length ? `<section><h2>Review missed questions</h2><p>Return to these checkpoints and retry the items you missed.</p>
          <ul>${missedChapters.map(l => `<li><a href="${lessonLink(l.id, 'practice')}">${escape(l.title)}</a> · ${state.missed[l.id].length} to revisit</li>`).join('')}</ul></section>` : ''}
      </article>`;
  }

  function reviewQuestions(review) {
    const sourceQuestions = review.questions.map(([prompt, choices, answer, why, skill]) => ({
      prompt, choices, answer, why, skill: skill || 'New reading', audio: skill === 'Listening' ? review.spoken : undefined,
    }));
    const reading = extraReadings.find(item => item.stage === review.id);
    const extendedQuestions = reading ? reading.questions.map(([prompt, choices, answer, why]) => ({
      prompt, choices, answer, why, skill: 'Everyday reading',
    })) : [];
    const stage = stages[review.id - 1];
    const recap = stage.ids.flatMap(id => {
      const lesson = lessonById(id);
      const vocabulary = lesson.questions.find(q => q.skill === 'Vocabulary' || q.skill === 'Kana recall');
      const expression = lesson.questions.find(q => q.skill === 'Expression');
      return [vocabulary, expression].filter(Boolean);
    }).slice(0, 8);
    return [...sourceQuestions, ...extendedQuestions, ...recap];
  }

  function showReview(review) {
    const questions = reviewQuestions(review);
    const reading = extraReadings.find(item => item.stage === review.id);
    const sourceCount = review.questions.length;
    const readingCount = reading?.questions.length || 0;
    reader.innerHTML = `<div class="reader-top"><a href="#chapters">All JFT-Basic chapters</a></div>
      <article class="sheet exam-layout"><p class="label">STAGE ${number(review.id)} REVIEW</p>
        <h1 id="reader-heading" tabindex="-1">${escape(review.title)}</h1>
        <p>Read two original everyday texts, listen to a new message, then review words and expressions from this stage.</p>
        <p class="muted">${questions.length} questions · Best score: ${Number.isInteger(state.reviewBest[review.id]) ? `${state.reviewBest[review.id]} / ${questions.length}` : 'Not taken yet'}</p>
        <form id="review-form"><fieldset class="checkpoint-items" aria-label="Stage review questions">
          <div class="passage"><h2>${escape(review.sourceTitle)}</h2><p class="japanese" lang="ja">${copy(review.source)}</p></div>
          ${questions.slice(0, sourceCount).map((q, i) => questionHTML(q, i, null, true, shuffledChoices(q))).join('')}
          ${reading ? `<div class="passage"><p class="label">${escape(reading.kind)} · new reading</p><h2>${escape(reading.title)}</h2>
            <div class="passage-lines japanese" lang="ja">${reading.source.map(line => `<p>${copy(line)}</p>`).join('')}</div></div>
            ${questions.slice(sourceCount, sourceCount + readingCount).map((q, i) => questionHTML(q, i + sourceCount, null, true, shuffledChoices(q))).join('')}
            <div class="practice-task"><h3>Use it yourself</h3><p>${escape(reading.task[0])}</p>
              <details><summary>See a possible response</summary><p class="japanese" lang="ja">${copy(reading.task[1])}</p></details></div>` : ''}
          ${questions.slice(sourceCount + readingCount).map((q, i) => questionHTML(q, i + sourceCount + readingCount, null, true, shuffledChoices(q))).join('')}
          </fieldset>
          <button class="button strong" type="submit">Check my answers</button></form>
        <div class="result" id="review-result" tabindex="-1" aria-live="polite"></div>
        <a class="button" href="#review-${review.id}" id="retry-review" hidden>Try review again</a>
      </article>`;
    document.querySelector('#review-form').addEventListener('submit', event => {
      event.preventDefault();
      const form = event.currentTarget;
      const values = new FormData(form);
      const selected = questions.map((_, i) => values.has(`q${i}`) ? Number(values.get(`q${i}`)) : null);
      const points = score(questions, selected);
      state.reviewBest[review.id] = Math.max(Number(state.reviewBest[review.id]) || 0, points);
      save();
      document.querySelector('#review-result').innerHTML = `<h2>${points} of ${questions.length} correct</h2>
        <p><strong>New text in English:</strong> ${escape(review.translation)}</p>
        ${reading ? `<p><strong>${escape(reading.title)} in English:</strong> ${escape(reading.translation)}</p>` : ''}
        <p><strong>Spoken message:</strong> ${copy(review.spoken)}</p>${answerList(questions, selected)}`;
      form.querySelector('fieldset').disabled = true;
      form.querySelector('button[type=submit]').disabled = true;
      const retry = document.querySelector('#retry-review');
      retry.hidden = false;
      retry.addEventListener('click', event => { event.preventDefault(); showReview(review); setHeading(document.querySelector('#reader-heading'), true); });
      document.querySelector('#review-result').focus();
    });
  }

  function showExamMenu() {
    reader.innerHTML = `<div class="reader-top"><a href="#chapters">All JFT-Basic chapters</a>${downloadLink()}</div>
      <article class="sheet exam-layout">
        <p class="label">EXAM PRACTICE</p><h1 id="reader-heading" tabindex="-1">JFT-Basic practice exams</h1>
        <p>Each mock has 48 original questions and a 60-minute timer. The reading sections include schedules, notices, a personal account, and an information sheet. You’ll get your score and explanations at the end.</p>
        <p>Listening sections play one group at a time, up to twice per recording. Scripts and explanations appear after you submit the mock.</p>
        <p>For extra reading practice, open the seven stage reviews. Each now has a second original everyday message or notice and five new comprehension questions.</p>
        <p class="muted">The everyday task approach follows <a href="https://www.irodori.jpf.go.jp/en/about.html">Irodori’s Can-do study model</a>. The Ikigai Quest texts and questions here are original, not official Irodori or JFT-Basic items.</p>
        ${exams.map(exam => `<section><h2>Mock ${exam.id.toUpperCase()}</h2>
          <p class="muted">${Number.isInteger(state.mockBest[exam.id]) ? `Best score: ${state.mockBest[exam.id]} / 48` : 'Four sections · 12 questions each'}</p>
          <a class="button strong" href="#mock-${exam.id}">${validAttempt(exam) ? 'Resume' : 'Open'} Mock ${exam.id.toUpperCase()}</a></section>`).join('')}
        <section><h2>Official sample question map</h2>
          <p>The Japan Foundation publishes 11 sample screens across the test categories. Past test questions are not publicly released. Open the originals to see their layout and question style; the Ikigai Quest practice items are independently written.</p>
          <ol>${officialSamples.map(([section, category, purpose], i) => `<li><a href="https://www.jpf.go.jp/jft-basic/sample/q${number(i + 1)}.html" target="_blank" rel="noopener noreferrer">Sample ${number(i + 1)} · ${escape(category)}</a> <span class="muted">${escape(section)} · ${escape(purpose)}</span></li>`).join('')}</ol>
          <p><a href="https://www.jpf.go.jp/jft-basic/e/faq/">Japan Foundation FAQ on published questions</a></p>
        </section>
        <section><h2>Free extra reading and listening practice</h2>
          <p>Use these independent question banks for unfamiliar material. Their questions and mock scores are not official JFT-Basic items or score predictions.</p>
          <ul>
            <li><a href="https://freetag.jp/en/jft-basic/index.html" target="_blank" rel="noopener noreferrer">FreeTag JFT-Basic practice</a> · separate reading and listening sets, MP3 listening clips, and timed practice. The publisher says it has 200 questions in each section.</li>
            <li><a href="https://zuttonihon.jp/app/jft-basic/en/" target="_blank" rel="noopener noreferrer">Zutto Nihon practice</a> · reading and listening questions plus one timed mock. Listening uses your device’s read-aloud voice.</li>
            <li><a href="https://jftprep.com/jft-basic-mock-test" target="_blank" rel="noopener noreferrer">JFT Prep free mock 1</a> · a 50-question, 60-minute test with reading and two-play listening. Further mocks are paid.</li>
          </ul>
          <p>Check the <a href="https://www.jpf.go.jp/jft-basic/sample/q07.html" target="_blank" rel="noopener noreferrer">official listening sample</a> and <a href="https://www.jpf.go.jp/jft-basic/sample/q10.html" target="_blank" rel="noopener noreferrer">official reading sample</a> for the exam’s own presentation.</p>
        </section>
        <section><h2>Official test format</h2>
          <p>These mocks use practice scores. When you want to try the real interface, open the Japan Foundation’s sample questions.</p>
          <a href="https://www.jpf.go.jp/jft-basic/sample/q01.html">Official JFT-Basic sample questions</a>
        </section>
      </article>`;
  }

  const questionsIn = section => section.groups.flatMap(group => group.questions);

  function validAttempt(exam) {
    const attempt = state.attempts[exam.id];
    return attempt && attempt.version === 2 && Number.isFinite(attempt.deadline) && Array.isArray(attempt.answers)
      && Number.isInteger(attempt.section) && exam.sections[attempt.section] ? attempt : null;
  }

  function finishExam(exam, attempt) {
    clearInterval(ticking);
    const questions = exam.sections.flatMap(questionsIn);
    const points = score(questions, attempt.answers);
    state.mockBest[exam.id] = Math.max(Number(state.mockBest[exam.id]) || 0, points);
    delete state.attempts[exam.id];
    latestResult = { id: exam.id, points, answers: attempt.answers };
    save();
    showExamResult(exam, latestResult);
    setHeading(document.querySelector('#reader-heading'), true);
    window.scrollTo(0, 0);
  }

  function showExamResult(exam, result) {
    stopAudio();
    let offset = 0;
    reader.innerHTML = `<div class="reader-top"><a href="#exams">All practice exams</a></div>
      <article class="sheet exam-layout"><p class="label">PRACTICE RESULTS</p>
        <h1 id="reader-heading" tabindex="-1">Mock ${exam.id.toUpperCase()}</h1>
        <p class="lede"><strong>${result.points} / 48 correct</strong></p>
        ${exam.sections.map(section => {
          const questions = questionsIn(section);
          const selected = result.answers.slice(offset, offset + questions.length);
          offset += questions.length;
          return `<section><h2>${section.title} · ${score(questions, selected)} / ${questions.length}</h2>
            <details><summary>Review the answers</summary><div class="details-body">${answerList(questions, selected)}</div></details>
            ${section.groups.some(group => group.script) ? `<details><summary>Read the listening scripts</summary><div class="details-body japanese" lang="ja">${section.groups.filter(group => group.script).map(group => `<p>${copy(group.script, false)}</p>`).join('')}</div></details>` : ''}
          </section>`;
        }).join('')}
        <section class="actions"><button class="button" id="retry-mock" type="button">Try again</button>
          <a class="button strong" href="#exams">Back to exam practice</a></section>
      </article>`;
    document.querySelector('#retry-mock').addEventListener('click', () => {
      latestResult = null;
      showMock(exam);
      setHeading(document.querySelector('#reader-heading'), true);
      window.scrollTo(0, 0);
    });
  }

  function showMock(exam) {
    stopAudio();
    clearInterval(ticking);
    if (latestResult?.id === exam.id) {
      showExamResult(exam, latestResult);
      return;
    }
    const attempt = validAttempt(exam);
    const name = `Mock ${exam.id.toUpperCase()}`;
    if (!attempt) {
      reader.innerHTML = `<div class="reader-top"><a href="#exams">All practice exams</a></div>
        <article class="sheet exam-layout"><p class="label">JFT-BASIC PRACTICE</p>
          <h1 id="reader-heading" tabindex="-1">${name}</h1>
          <p>Set aside 60 minutes for 48 questions. Submit each section when you’re ready to move on. Unanswered questions count as incorrect.</p>
          <p class="muted">The timer keeps running when you leave the page.</p>
          <button class="button strong" id="begin-mock" type="button">Start 60-minute mock</button>
        </article>`;
      document.querySelector('#begin-mock').addEventListener('click', () => {
        const questions = exam.sections.flatMap(questionsIn);
        state.attempts[exam.id] = {
          version: 2,
          deadline: Date.now() + 60 * 60 * 1000,
          section: 0,
          group: 0,
          plays: {},
          answers: questions.map(() => null),
          choices: questions.map(shuffledChoices),
        };
        save();
        showMock(exam);
        setHeading(document.querySelector('#reader-heading'), true);
      });
      return;
    }
    if (attempt.deadline <= Date.now()) {
      finishExam(exam, attempt);
      return;
    }
    const section = exam.sections[attempt.section];
    const listening = section.title === 'Listening Comprehension';
    const groupIndex = listening && Number.isInteger(attempt.group) ? Math.min(attempt.group, section.groups.length - 1) : 0;
    const visibleGroups = listening ? [section.groups[groupIndex]] : section.groups;
    let offset = exam.sections.slice(0, attempt.section).reduce((total, s) => total + questionsIn(s).length, 0);
    if (listening) offset += section.groups.slice(0, groupIndex).reduce((total, group) => total + group.questions.length, 0);
    reader.innerHTML = `<div class="reader-top"><a href="#exams">Exit to exam practice</a></div>
      <article class="sheet exam-layout">
        <div class="exam-header"><p class="label">${name} · Section ${attempt.section + 1} of ${exam.sections.length}${listening ? ` · Audio ${groupIndex + 1} of ${section.groups.length}` : ''}</p>
          <p class="clock" id="mock-clock" aria-label="Time remaining" role="timer"></p></div>
        <h1 id="reader-heading" tabindex="-1">${section.title}</h1>
        ${listening ? '<p class="muted">Listen up to twice, answer this group, then continue. Earlier listening groups cannot be reopened during this attempt.</p>' : ''}
        <form id="mock-form">
          ${visibleGroups.map(group => `
            ${group.text ? `<div class="mock-source">
              <p class="${group.script ? '' : 'japanese'}" ${group.script ? '' : 'lang="ja"'}>${copy(group.text, false)}</p>
              ${group.script ? `<div class="exam-audio">${listenButton(group.script, 'Play the listening recording', exam.id)}<span>Listen, then answer the questions below.</span></div>` : ''}
            </div>` : ''}
            ${group.questions.map(question => {
              const number = offset++;
              return questionHTML(question, number, attempt.answers[number], false, attempt.choices?.[number]);
            }).join('')}`).join('')}
          <button class="button strong" type="submit">${attempt.section === exam.sections.length - 1 ? 'Submit mock' : listening && groupIndex < section.groups.length - 1 ? 'Continue to next audio' : 'Submit section and continue'}</button>
        </form>
      </article>`;
    const form = document.querySelector('#mock-form');
    form.addEventListener('change', event => {
      if (event.target.type !== 'radio') return;
      attempt.answers[Number(event.target.name.slice(1))] = Number(event.target.value);
      save();
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (listening && groupIndex < section.groups.length - 1) {
        attempt.group = groupIndex + 1;
        save();
        showMock(exam);
        setHeading(document.querySelector('#reader-heading'), true);
        window.scrollTo(0, 0);
      } else if (attempt.section === exam.sections.length - 1) {
        finishExam(exam, attempt);
      } else {
        attempt.section++;
        attempt.group = 0;
        save();
        showMock(exam);
        setHeading(document.querySelector('#reader-heading'), true);
        window.scrollTo(0, 0);
      }
    });
    const clock = document.querySelector('#mock-clock');
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((attempt.deadline - Date.now()) / 1000));
      clock.textContent = `${number(Math.floor(seconds / 60))}:${number(seconds % 60)} left`;
      if (seconds === 0) finishExam(exam, attempt);
      return seconds;
    };
    if (tick()) ticking = window.setInterval(tick, 1000);
  }

  function updateSidebar(section) {
    document.querySelectorAll('[data-course-nav]').forEach(link => {
      if (link.dataset.courseNav === section) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    const lastLesson = lessonById(state.last?.id);
    const card = document.querySelector('#sidebar-resume');
    card.hidden = !lastLesson;
    if (lastLesson) {
      const link = document.querySelector('#sidebar-lesson');
      link.href = lessonLink(lastLesson.id, state.last.section);
      link.textContent = lastLesson.title;
    }
  }

  function render() {
    stopAudio();
    const hash = location.hash.slice(1);
    const match = /^chapter-(\d+)(?:\/([a-z]+))?$/.exec(hash);
    const lesson = match && lessonById(Number(match[1]));
    if (!lesson || currentChapter !== lesson.id) clearPracticeRecording();
    const section = lesson && recognizedSections.includes(match[2]) ? match[2] : null;
    if (hash === 'reader-heading') {
      document.querySelector('#reader-heading')?.focus();
      return;
    }
    clearInterval(ticking);
    if (lesson) {
      if (currentChapter !== lesson.id) {
        currentChapter = lesson.id;
        showChapter(lesson, section);
      }
      state.last = { id: lesson.id, section };
      save();
      updateSidebar(lesson.id <= 2 ? 'kana' : 'learn');
    } else {
      currentChapter = null;
      const exam = exams.find(e => hash === `mock-${e.id}`);
      const review = reviews.find(item => hash === `review-${item.id}`);
      if (review) {
        showReview(review);
        updateSidebar('learn');
      } else if (exam) {
        showMock(exam);
        updateSidebar('exams');
      } else if (hash === 'exams') {
        showExamMenu();
        updateSidebar('exams');
      } else if (hash === 'stats') {
        showStats();
        updateSidebar('stats');
      } else {
        showHome();
        updateSidebar('learn');
      }
    }
    const heading = document.querySelector('#reader-heading');
    setHeading(heading, renderCount > 0 && !section);
    renderCount++;
    if (section) {
      const target = document.getElementById(section);
      if (target) target.scrollIntoView({ block: 'start' });
      else window.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }

  document.querySelector('.skip').addEventListener('click', event => {
    event.preventDefault();
    document.querySelector('#reader-heading')?.focus();
  });
  reader.addEventListener('click', event => {
    const button = event.target.closest?.('[data-audio-id]');
    if (!button) return;
    if (button.disabled) return;
    const playingThisClip = activeAudio && activeAudioId === button.dataset.audioId;
    stopAudio();
    if (playingThisClip) return;
    if (button.dataset.mockExam) {
      const attempt = state.attempts[button.dataset.mockExam];
      if (!attempt) return;
      attempt.plays ||= {};
      if ((attempt.plays[button.dataset.audioId] || 0) >= 2) return;
      attempt.plays[button.dataset.audioId] = (attempt.plays[button.dataset.audioId] || 0) + 1;
      save();
    }
    const audio = new Audio(`jft/audio/${button.dataset.audioId}.mp3`);
    activeAudio = audio;
    activeAudioId = button.dataset.audioId;
    button.classList.add('is-playing');
    button.textContent = '■ Stop';
    audio.onended = audio.onerror = () => { if (activeAudio === audio) stopAudio(); };
    audio.play().catch(() => { if (activeAudio === audio) stopAudio(); });
  });
  window.addEventListener('hashchange', render);
  render();
  window.ikigaiJftReady = true;
})();
