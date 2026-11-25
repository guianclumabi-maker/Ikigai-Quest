(() => {
  'use strict';
  const { lessons, exams } = window.ikigaiJft;
  const reader = document.querySelector('#reader');
  const workbook = 'pdf/Ikigai_Quest_JFT_Basic_A2_Learner_Workbook.pdf';
  const title = 'Japanese for Life in Japan';
  const stages = [
    { name: 'Start from zero', description: 'The writing systems, introductions, and everyday numbers', ids: [1, 2, 3, 4] },
    { name: 'Daily errands', description: 'Shops, food, transport, and your neighborhood', ids: [5, 6, 7, 8, 9] },
    { name: 'Life and work', description: 'Work, health, housing, and your community', ids: [10, 11, 12, 13, 14, 15] },
  ];
  const storageKey = 'ikigaiJftProgressV1';
  let state = { done: [], best: {}, mockBest: {}, attempts: {}, last: null, furigana: true };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (saved && typeof saved === 'object') {
      const { done, best, mockBest, attempts, last, furigana } = saved;
      if (Array.isArray(done)) state.done = done.filter(id => lessons.some(lesson => lesson.id === id));
      if (best && typeof best === 'object') state.best = best;
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
  const recognizedSections = ['words', 'examples', 'reading', 'listening', 'practice'];
  const jpPattern = /[\u3040-\u30ff\u3400-\u9fff]/;
  const latinPattern = /[A-Za-z]/;
  const lessonById = id => lessons.find(lesson => lesson.id === id);
  const number = n => String(n).padStart(2, '0');
  const lessonLink = (id, section) => `#chapter-${id}${recognizedSections.includes(section) ? '/' + section : ''}`;

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
    return `<a class="button" href="${workbook}" download>Download workbook</a>`;
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
      <div class="home-grid"><section class="catalog" aria-labelledby="chapter-heading">
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
            }).join('')}</ol></details>`;
        }).join('')}
        <p class="course-crosslink">Studying for the Japanese-Language Proficiency Test? <a href="JLPT_Reading_Quest.html">Open the JLPT N5/N4 course.</a></p>
      </section><aside class="home-rail" aria-label="Study resources">
      <section class="resume-card" aria-labelledby="next-heading">
        <p class="label">${state.last ? 'PICK UP WHERE YOU LEFT OFF' : 'START HERE'}</p>
        <h2 id="next-heading">${state.last ? escape(next.title) : 'Your first step starts with あ.'}</h2>
        <p class="muted">${escape(next.title)} · ${escape(next.goal)}</p>
        <a class="button strong" href="${resumeHref}">${resume}</a>
      </section>
      <section class="paper-card"><h2>Learn on paper, too.</h2><p>Download the free workbook for all lessons, scripts, and practice exams.</p>${downloadLink()}</section>
      <section class="exambox"><p class="label">CHAPTER 16</p><h2>JFT-Basic practice exams</h2>
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
        ? `<div class="kana-cell"><b lang="ja">${escape(cell[0])}</b><span class="kana-reading">${escape(cell[1])}</span></div>`
        : '<div class="kana-cell blank" aria-hidden="true"></div>').join('')}</div>
      <p class="muted">${copy(lesson.clue)}</p>`;
  }

  function examples(lesson) {
    return `<ul class="examples">${lesson.examples.map(([ja, en, note]) => `<li>
      <p class="japanese" lang="ja">${copy(ja)}</p><p><strong>${escape(en)}</strong></p>
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
      <p class="japanese" lang="ja">${lesson.passage.slice(1).map(x => copy(x)).join('<br>')}</p>
      ${lesson.id === 11 ? shiftTable() : ''}</div>
      <details><summary>Show translation</summary><div class="details-body"><p>${escape(lesson.translation)}</p></div></details>
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
      ${order.map((index, position) =>
        `<label class="choice"><input type="radio" name="q${id}" value="${index}" ${index === selected ? 'checked' : ''} ${required && position === 0 ? 'required' : ''}>
          <span class="choice-letter" aria-hidden="true">${String.fromCharCode(65 + position)}</span>
          <span>${sentence(question.choices[index])}</span></label>`).join('')}
      </fieldset>`;
  }

  function checkpointQuestions(lesson) {
    return lesson.questions.map((q, i) => questionHTML(q, i, null, true, shuffledChoices(q))).join('');
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
      ...(lesson.passage ? [['reading', 'Reading']] : []), ['listening', 'Listening script'], ['practice', 'Checkpoint']];
    reader.innerHTML = `
      <div class="reader-top"><a href="#chapters">All JFT-Basic chapters</a>
        <button class="button" id="furigana" type="button">Furigana</button></div>
      <div class="reader-grid">
        <details class="outline" ${window.matchMedia('(min-width: 1121px)').matches ? 'open' : ''}><summary>On this page</summary>
          <nav aria-label="Lesson contents">${outline.map(([slug, label]) => `<a href="${lessonLink(id, slug)}">${label}</a>`).join('')}</nav>
        </details>
        <article class="sheet">
          <p class="label">CHAPTER ${number(id)}</p>
          <h1 id="reader-heading" tabindex="-1">${escape(lesson.title)}</h1>
          <p class="lede"><strong>After this chapter</strong> · ${escape(lesson.goal)}</p>
          <p>${copy(lesson.scene)}</p>
          <section id="words" aria-labelledby="words-label">
            <h2 id="words-label">${lesson.chart ? 'Meet the sounds' : 'Words for this situation'}</h2>
            ${lesson.chart ? kanaChart(lesson) : `<dl class="vocabulary">${lesson.words.map(([ja, en]) =>
              `<div><dt class="japanese" lang="ja">${copy(ja)}</dt><dd>${escape(en)}</dd></div>`).join('')}</dl>`}
            ${id === 4 ? reference() : ''}
          </section>
          <section id="examples" aria-labelledby="examples-label"><h2 id="examples-label">Worked examples</h2>
            <p>${copy(lesson.teach)}</p>${examples(lesson)}</section>
          ${lessonPassage(lesson)}
          <section id="listening" aria-labelledby="listening-label"><h2 id="listening-label">Listening script</h2>
            <p>Ask a partner to read the script while you look away. Then answer the listening questions in the checkpoint. For self-study, you can read the script and check its meaning.</p>
            <details><summary>Open script and translation</summary><div class="details-body">${scriptContent(lesson.script)}</div></details>
          </section>
          <section id="practice" aria-labelledby="practice-label"><h2 id="practice-label">Chapter checkpoint</h2>
            <p>Choose one answer per question. You can retry the checkpoint as often as you like.</p>
            <p id="chapter-best" class="muted">${hadScore ? `Best score: ${state.best[id]} / ${lesson.questions.length}` : ''}</p>
            <form id="checkpoint">
              <fieldset class="checkpoint-items" id="checkpoint-items" aria-label="Checkpoint questions">${checkpointQuestions(lesson)}</fieldset>
              <button class="button strong" id="check-answers" type="submit">Check my answers</button>
            </form>
            <div class="result" id="checkpoint-result" tabindex="-1" aria-live="polite"></div>
            <button class="button" id="retry-checkpoint" type="button" hidden>Try checkpoint again</button>
            ${lesson.task ? `<section class="practice-task" aria-labelledby="practice-task-label">
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
      </article>`;
  }

  function showExamMenu() {
    reader.innerHTML = `<div class="reader-top"><a href="#chapters">All JFT-Basic chapters</a>${downloadLink()}</div>
      <article class="sheet exam-layout">
        <p class="label">CHAPTER 16</p><h1 id="reader-heading" tabindex="-1">JFT-Basic practice exams</h1>
        <p>Each mock has 48 original questions and a 60-minute timer. You’ll get your score and explanations at the end.</p>
        <p>For listening practice, have a partner read each script while you listen. The script is available to open separately for self-study.</p>
        ${exams.map(exam => `<section><h2>Mock ${exam.id.toUpperCase()}</h2>
          <p class="muted">${Number.isInteger(state.mockBest[exam.id]) ? `Best score: ${state.mockBest[exam.id]} / 48` : 'Four sections · 12 questions each'}</p>
          <a class="button strong" href="#mock-${exam.id}">${validAttempt(exam) ? 'Resume' : 'Open'} Mock ${exam.id.toUpperCase()}</a></section>`).join('')}
        <section><h2>Official test format</h2>
          <p>These mocks use practice scores. When you want to try the real interface, open the Japan Foundation’s sample questions.</p>
          <a href="https://www.jpf.go.jp/jft-basic/sample/q01.html">Official JFT-Basic sample questions</a>
        </section>
      </article>`;
  }

  const questionsIn = section => section.groups.flatMap(group => group.questions);

  function validAttempt(exam) {
    const attempt = state.attempts[exam.id];
    return attempt && Number.isFinite(attempt.deadline) && Array.isArray(attempt.answers)
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
          deadline: Date.now() + 60 * 60 * 1000,
          section: 0,
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
    let offset = exam.sections.slice(0, attempt.section).reduce((total, s) => total + questionsIn(s).length, 0);
    reader.innerHTML = `<div class="reader-top"><a href="#exams">Exit to exam practice</a></div>
      <article class="sheet exam-layout">
        <div class="exam-header"><p class="label">${name} · Section ${attempt.section + 1} of ${exam.sections.length}</p>
          <p class="clock" id="mock-clock" aria-label="Time remaining" role="timer"></p></div>
        <h1 id="reader-heading" tabindex="-1">${section.title}</h1>
        <form id="mock-form">
          ${section.groups.map(group => `
            ${group.text ? `<div class="mock-source">
              <p class="${group.script ? '' : 'japanese'}" ${group.script ? '' : 'lang="ja"'}>${copy(group.text, false)}</p>
              ${group.script ? `<details><summary>Script for your reading partner</summary>
                <div class="details-body japanese" lang="ja">${copy(group.script, false)}</div></details>` : ''}
            </div>` : ''}
            ${group.questions.map(question => {
              const number = offset++;
              return questionHTML(question, number, attempt.answers[number], false, attempt.choices?.[number]);
            }).join('')}`).join('')}
          <button class="button strong" type="submit">${attempt.section === exam.sections.length - 1 ? 'Submit mock' : 'Submit section and continue'}</button>
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
      if (attempt.section === exam.sections.length - 1) {
        finishExam(exam, attempt);
      } else {
        attempt.section++;
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
    const hash = location.hash.slice(1);
    const match = /^chapter-(\d+)(?:\/([a-z]+))?$/.exec(hash);
    const lesson = match && lessonById(Number(match[1]));
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
      if (exam) {
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
  window.addEventListener('hashchange', render);
  render();
})();
