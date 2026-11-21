(() => {
  const ENDPOINT = window.IKIGAI_FEEDBACK_ENDPOINT || '';
  const modalMarkup = `
    <dialog class="feedback-dialog" aria-labelledby="feedbackTitle">
      <div class="feedback-head">
        <span class="feedback-mark">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </span>
        <div>
          <p class="feedback-kicker">HELP US MAKE IT BETTER</p>
          <h2 id="feedbackTitle">Share a thought with us</h2>
        </div>
        <button type="button" class="feedback-close" aria-label="Close feedback form">×</button>
      </div>
      <p class="feedback-intro">Report a problem, point out a lesson correction, or suggest what you'd like to learn next.</p>
      <form class="feedback-form">
        <label>What would you like to share?
          <select name="category" required>
            <option value="Report a problem">Report a problem</option>
            <option value="Lesson correction">Incorrect Japanese or lesson correction</option>
            <option value="Suggest a lesson">Suggest a lesson</option>
            <option value="General suggestion">Other suggestion</option>
          </select>
        </label>
        <label>Which lesson or page? <span>(optional)</span>
          <input name="page" maxlength="160" placeholder="For example: Point to people and things, or Hiragana">
        </label>
        <label>Your message
          <textarea name="message" required minlength="4" maxlength="4000" rows="5" placeholder="What happened, or what would you recommend?"></textarea>
        </label>
        <label>Email if you'd like a reply <span>(optional)</span>
          <input type="email" name="contact" maxlength="200" placeholder="Your email is only used to reply to you">
        </label>
        <div class="feedback-trap" aria-hidden="true">
          <label>Leave this field empty<input name="website" tabindex="-1" autocomplete="off"></label>
        </div>
        <p class="feedback-privacy">Your feedback helps improve Ikigai Quest. You can leave your email blank if you prefer to remain anonymous.</p>
        <div class="feedback-actions">
          <p class="feedback-status" aria-live="polite"></p>
          <button class="feedback-submit" type="submit">Send feedback</button>
        </div>
      </form>
    </dialog>`;

  function setup() {
    if (document.querySelector('.feedback-dialog')) return;
    document.body.insertAdjacentHTML('beforeend', modalMarkup);
    const dialog = document.querySelector('.feedback-dialog');
    const form = dialog.querySelector('form');
    const status = dialog.querySelector('.feedback-status');
    const submit = dialog.querySelector('.feedback-submit');

    dialog.querySelector('.feedback-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      if (window.setSideTab) window.setSideTab('Learn');
      if (typeof window.leaveFeedbackTab === 'function') window.leaveFeedbackTab();
    });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });

    document.querySelectorAll('[data-feedback-trigger]').forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        window.openIkigaiFeedback();
      });
    });

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (data.website) return; // bot honeypot
      if (data.message.trim().length < 4) {
        status.textContent = 'Please add a little more detail.';
        return;
      }

      submit.disabled = true;
      status.style.color = '#087e78';
      status.textContent = 'Sending feedback…';

      // Always save to localStorage so no user feedback is ever lost
      try {
        const stored = JSON.parse(localStorage.getItem('ikigai_feedback_submissions') || '[]');
        stored.push({
          ...data,
          submittedAt: new Date().toISOString()
        });
        localStorage.setItem('ikigai_feedback_submissions', JSON.stringify(stored));
      } catch (e) {
        console.warn('LocalStorage save failed', e);
      }

      // If remote endpoint is configured, send to remote endpoint
      if (ENDPOINT) {
        try {
          await fetch(ENDPOINT, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
            body: JSON.stringify(data)
          });
        } catch (err) {
          console.warn('Remote endpoint dispatch failed, saved locally', err);
        }
      }

      form.reset();
      status.textContent = '✓ Thank you! Your feedback has been received.';
      submit.disabled = false;
      setTimeout(() => {
        if (dialog.open) dialog.close();
        status.textContent = '';
      }, 2500);
    });
  }

  window.openIkigaiFeedback = () => {
    setup();
    if (window.setSideTab) window.setSideTab('Feedback');
    const dialog = document.querySelector('.feedback-dialog');
    if (dialog && !dialog.open) {
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
