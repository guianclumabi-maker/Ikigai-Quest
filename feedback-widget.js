(() => {
  const ENDPOINT = window.IKIGAI_FEEDBACK_ENDPOINT || '';
  const modalMarkup = `
    <dialog class="feedback-dialog" aria-labelledby="feedbackTitle">
      <div class="feedback-head"><span class="feedback-mark">✉</span><div><p class="feedback-kicker">HELP US MAKE IT BETTER</p><h2 id="feedbackTitle">Share a thought with us</h2></div><button type="button" class="feedback-close" aria-label="Close feedback form">×</button></div>
      <p class="feedback-intro">Report a problem, point out a lesson correction, or suggest what you’d like to learn next.</p>
      <form class="feedback-form">
        <label>What would you like to share?<select name="category" required><option value="Report a problem">Report a problem</option><option value="Lesson correction">Incorrect Japanese or lesson correction</option><option value="Suggest a lesson">Suggest a lesson</option><option value="General suggestion">Other suggestion</option></select></label>
        <label>Which lesson or page? <span>(optional)</span><input name="page" maxlength="160" placeholder="For example, Hiragana advanced sounds"></label>
        <label>Your message<textarea name="message" required minlength="8" maxlength="4000" rows="5" placeholder="What happened, or what would you recommend?"></textarea></label>
        <label>Email if you’d like a reply <span>(optional)</span><input type="email" name="contact" maxlength="200" placeholder="Your email is only used to reply to you"></label>
        <div class="feedback-trap" aria-hidden="true"><label>Leave this field empty<input name="website" tabindex="-1" autocomplete="off"></label></div>
        <p class="feedback-privacy">Your report will go to the private Ikigai Quest inbox. The project owner’s email address will not be shown here. You can leave your own email blank.</p>
        <div class="feedback-actions"><p class="feedback-status" aria-live="polite"></p><button class="feedback-submit" type="submit">Send feedback</button></div>
      </form>
    </dialog>`;
  function setup() {
    if (document.querySelector('.feedback-dialog')) return;
    document.body.insertAdjacentHTML('beforeend', modalMarkup);
    const dialog = document.querySelector('.feedback-dialog');
    const form = dialog.querySelector('form');
    const status = dialog.querySelector('.feedback-status');
    const submit = dialog.querySelector('.feedback-submit');
    if (!ENDPOINT) { submit.disabled = true; status.textContent = 'Private inbox setup is still in progress.'; }
    dialog.querySelector('.feedback-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { if (window.setSideTab) window.setSideTab('Learn'); });
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    document.querySelectorAll('[data-feedback-trigger]').forEach(button => button.addEventListener('click', event => { event.preventDefault(); window.openIkigaiFeedback(); }));
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!ENDPOINT) {
        status.textContent = 'The private inbox is being connected. Please try again soon.';
        return;
      }
      const data = Object.fromEntries(new FormData(form).entries());
      if (data.message.trim().length < 8) { status.textContent = 'Please add a little more detail.'; return; }
      submit.disabled = true;
      status.textContent = 'Sending your note…';
      try {
        await fetch(ENDPOINT, { method:'POST', mode:'no-cors', headers:{'Content-Type':'text/plain;charset=UTF-8'}, body:JSON.stringify(data) });
        form.reset();
        status.textContent = 'Thank you. Your feedback has been sent.';
      } catch (_) {
        status.textContent = 'Could not send right now. Please try again in a moment.';
      } finally { submit.disabled = false; }
    });
  }
  window.openIkigaiFeedback = () => { setup(); if (window.setSideTab) window.setSideTab('Feedback'); document.querySelector('.feedback-dialog').showModal(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
