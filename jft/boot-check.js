// Report a failed or mixed asset load instead of leaving the course apparently unresponsive.
window.addEventListener('load', () => {
  if (window.ikigaiJftReady) return;
  const reader = document.querySelector('#reader');
  if (!reader) return;
  reader.innerHTML = `<section class="load-error" role="alert">
    <h1 id="reader-heading">The lessons did not load</h1>
    <p>A lesson file may be missing or an older copy may be cached. Reload the latest course files to continue.</p>
    <a class="button strong" href="jft-basic.html?refresh=20261126b#chapters">Reload the course</a>
  </section>`;
});
