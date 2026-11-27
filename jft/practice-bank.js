(() => {
  'use strict';
  const root = document.querySelector('#bank');
  const bank = window.ikigaiJftPracticeBank;
  if (!root || !bank) return;
  const availableAudio = new Set(window.ikigaiJftPracticeAudio || []);
  const key = 'ikigaiJftPracticeBankV1';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch { saved = {}; }
  let timer = null;
  let deadline = 0;
  let challenge = null;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const audioId = value => {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619) >>> 0;
    return 'a' + hash.toString(16).padStart(8, '0');
  };
  const shuffled = count => {
    const order = Array.from({ length: count }, (_, index) => index);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  };
  const totalDone = mode => bank[mode].filter(item => Number.isInteger(saved[item.id])).length;
  function audio(source) {
    const id = audioId(source);
    if (!availableAudio.has(id)) return '<p class="alert">This recording is unavailable. Please try another set.</p>';
    return `<div class="audio-box"><strong>Listen before answering</strong><audio controls preload="none" src="jft/practice-bank-audio/${id}.mp3" aria-label="Play the Japanese recording"></audio><p>Replay as needed. The Japanese transcript appears after you submit.</p></div>`;
  }
  function sourceHTML(item, mode) {
    return mode === 'reading'
      ? `<div class="source" lang="ja" aria-label="Reading material">${escape(item.source)}</div>`
      : audio(item.source);
  }
  function questionsHTML(item, prefix) {
    return item.questions.map((q, i) => `<fieldset class="question"><legend>${i + 1}. ${escape(q.prompt)}</legend>${shuffled(q.choices.length).map(index => `<label class="choice"><input type="radio" name="${prefix}-${i}" value="${index}" required>${escape(q.choices[index])}</label>`).join('')}</fieldset>`).join('');
  }
  function list(mode) {
    const active = mode === 'reading' ? 'Reading' : 'Listening';
    const items = bank[mode];
    const done = totalDone(mode);
    root.innerHTML = `<section class="hero"><span class="eyebrow">Independent JFT-Basic-style practice</span><h1 id="practice-title" tabindex="-1">Read and listen to something new.</h1><p>Choose a short set, find the clues, and learn from every answer. These are original Ikigai Quest situations, not official exam questions.</p></section>
      <div class="summary"><span>40 reading sets · 200 questions</span><span>40 listening sets · 200 questions</span><span>One recording per listening set</span></div>
      <nav class="toolbar" aria-label="Practice skills"><a class="pill" href="#reading" ${mode === 'reading' ? 'aria-current="page"' : ''}>Reading</a><a class="pill" href="#listening" ${mode === 'listening' ? 'aria-current="page"' : ''}>Listening</a><a class="pill" href="#challenge">20-question timed mix</a></nav>
      <h2>${active} practice</h2><p class="section-intro">${mode === 'reading' ? 'Read a notice or message before choosing answers. Every question has a visible source.' : 'Play the Japanese recording before answering. The transcript and explanations appear after you finish.'} ${done} of ${items.length} sets completed.</p>
      <div class="progress" aria-label="${done} of ${items.length} sets completed"><span style="width:${done / items.length * 100}%"></span></div>
      <div class="topics">${Array.from({ length: 10 }, (_, topic) => `<section class="topic"><h2>${escape(items[topic * 4].title)}</h2><p>${escape(items[topic * 4].kind)} · four practice sets</p><div class="set-links">${items.slice(topic * 4, topic * 4 + 4).map((set, index) => `<a class="set-link" href="#${mode}-${set.id}">Set ${index + 1}<small>${Number.isInteger(saved[set.id]) ? `${saved[set.id]}/5 best` : 'New'}</small></a>`).join('')}</div></section>`).join('')}</div>`;
  }
  function results(form, items, mode, challengeMode = false) {
    let correct = 0;
    let total = 0;
    const notes = [];
    items.forEach((item, setIndex) => item.questions.forEach((q, i) => {
      const chosen = form.querySelector(`input[name="s${setIndex}-${i}"]:checked`);
      const choice = chosen ? Number(chosen.value) : -1;
      total++;
      if (choice === q.answer) correct++;
      notes.push(`<div class="answer-note"><strong>${total}. ${choice === q.answer ? 'Correct' : 'Review'} · ${escape(q.prompt)}</strong><p>Answer: ${escape(q.choices[q.answer])}. ${escape(q.explanation)}</p></div>`);
    }));
    if (!challengeMode) {
      saved[items[0].id] = Math.max(saved[items[0].id] || 0, correct);
      try { localStorage.setItem(key, JSON.stringify(saved)); } catch { /* Practice still works without storage. */ }
    }
    form.querySelectorAll('input').forEach(input => { input.disabled = true; });
    form.querySelector('button[type="submit"]').disabled = true;
    const transcript = mode === 'listening' || challengeMode
      ? `<h3>Listening transcripts</h3>${items.filter(item => item.id.startsWith('l')).map(item => `<p lang="ja">${escape(item.source)}</p>`).join('')}` : '';
    const result = document.querySelector('#result');
    result.innerHTML = `<h2>${correct} / ${total} correct</h2>${transcript}${notes.join('')}<div class="actions"><a class="action" href="#${mode}">Choose another set</a><a class="action" href="jft-basic.html#exams">Back to Exam prep</a></div>`;
    result.hidden = false;
    result.focus();
  }
  function openSet(mode, id) {
    const item = bank[mode].find(set => set.id === id);
    if (!item) { list(mode); return; }
    if (mode === 'listening' && !availableAudio.has(audioId(item.source))) {
      root.innerHTML = `<article class="sheet"><a href="#listening">← All listening sets</a><h1 id="practice-title">Recording unavailable</h1><p>This set needs its audio file before you can answer it. Please try another set.</p></article>`;
      return;
    }
    const label = mode === 'reading' ? 'Reading' : 'Listening';
    root.innerHTML = `<article class="sheet"><a href="#${mode}">← All ${mode} sets</a><p class="eyebrow" style="color:#087f78">${label} · ${escape(item.kind)}</p><h1 id="practice-title" tabindex="-1">${escape(item.title)}</h1><p class="muted">Five questions · ${mode === 'reading' ? 'Read the text before answering.' : 'Play the recording before answering. The transcript comes after submission.'}</p>${sourceHTML(item, mode)}<form id="practice-form">${questionsHTML(item, 's0')}<div class="actions"><button class="action primary" type="submit">Check my answers</button></div></form><div class="feedback" id="result" tabindex="-1" hidden></div></article>`;
    document.querySelector('#practice-form').addEventListener('submit', event => { event.preventDefault(); results(event.currentTarget, [item], mode); });
  }
  function showChallenge() {
    if (!challenge) {
      const audioReady = bank.listening.filter(item => availableAudio.has(audioId(item.source)));
      if (audioReady.length < 2) {
        root.innerHTML = `<article class="sheet"><a href="#reading">← Practice bank</a><h1 id="practice-title">Recordings unavailable</h1><p>The timed mix needs two listening recordings. Please try again later.</p></article>`;
        return;
      }
      const readOrder = shuffled(bank.reading.length);
      const listenOrder = shuffled(audioReady.length);
      challenge = [bank.reading[readOrder[0]], audioReady[listenOrder[0]], bank.reading[readOrder[1]], audioReady[listenOrder[1]]];
      deadline = Date.now() + 20 * 60_000;
    }
    root.innerHTML = `<article class="sheet"><a href="#reading">← Practice bank</a><p class="eyebrow" style="color:#087f78">Timed mixed practice</p><h1 id="practice-title" tabindex="-1">A fresh 20-question challenge</h1><p class="muted">Two new reading texts and two listening recordings. You have 20 minutes. Unanswered questions count as missed when time ends.</p><p class="timer" id="timer" role="timer" aria-label="Time remaining"></p><form id="practice-form">${challenge.map((item, index) => `<section class="challenge-source"><h2>${index + 1}. ${escape(item.title)} · ${item.id.startsWith('r') ? 'Reading' : 'Listening'}</h2>${sourceHTML(item, item.id.startsWith('r') ? 'reading' : 'listening')}${questionsHTML(item, `s${index}`)}</section>`).join('')}<button class="action primary" type="submit">Finish challenge</button></form><div class="feedback" id="result" tabindex="-1" hidden></div></article>`;
    const form = document.querySelector('#practice-form');
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      document.querySelector('#timer').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')} remaining`;
      if (!seconds) { clearInterval(timer); form.dispatchEvent(new Event('submit', { cancelable: true })); }
    };
    form.addEventListener('submit', event => {
      event.preventDefault(); clearInterval(timer);
      results(form, challenge, 'reading', true);
      challenge = null;
    });
    tick(); timer = setInterval(tick, 1000);
  }
  function render() {
    clearInterval(timer);
    const hash = location.hash.slice(1);
    const match = /^(reading|listening)-([rl]\d{2})$/.exec(hash);
    if (match) openSet(match[1], match[2]);
    else if (hash === 'challenge') showChallenge();
    else { challenge = null; list(hash === 'listening' ? 'listening' : 'reading'); }
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', render);
  render();
})();
