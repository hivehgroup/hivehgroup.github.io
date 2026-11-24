(() => {
  'use strict';
  const header = document.querySelector('.wrap > header');
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const links = [...document.querySelectorAll('.panto-gallery a, .app-gallery a, .app-gallery button')];
  if (!links.length || typeof HTMLDialogElement === 'undefined' || !HTMLDialogElement.prototype.showModal) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'gallery-viewer';
  dialog.setAttribute('aria-label', 'نمایش تصاویر اپلیکیشن');
  dialog.innerHTML = `<div class="viewer-layout"><div class="viewer-header"><h2 class="viewer-title" id="viewer-title"></h2><button class="viewer-close" type="button" aria-label="بستن تصویر" autofocus>×</button></div><div class="viewer-stage"><img class="viewer-image" alt=""><p class="viewer-error" role="status" hidden>تصویر بارگذاری نشد. لطفاً دوباره تلاش کنید.</p></div><div class="viewer-controls"><button type="button" class="viewer-prev" aria-label="تصویر قبلی">قبلی</button><span class="viewer-count" aria-live="polite" aria-atomic="true"></span><button type="button" class="viewer-next" aria-label="تصویر بعدی">بعدی</button></div></div>`;
  dialog.setAttribute('aria-labelledby', 'viewer-title');
  document.body.append(dialog);
  const image = dialog.querySelector('.viewer-image');
  const title = dialog.querySelector('.viewer-title');
  const count = dialog.querySelector('.viewer-count');
  const error = dialog.querySelector('.viewer-error');
  const stage = dialog.querySelector('.viewer-stage');
  const formatter = new Intl.NumberFormat('fa');
  let current = 0;
  let opener = null;
  let previousOverflow = '';
  let touchX = null;
  const show = (index) => {
    current = (index + links.length) % links.length;
    const selected = links[current];
    const caption = selected.closest('figure')?.querySelector('figcaption')?.textContent || selected.querySelector('img')?.alt || 'تصویر اپلیکیشن';
    title.textContent = caption;
    image.alt = caption;
    image.hidden = false;
    error.hidden = true;
    image.src = selected.href || selected.querySelector('img').src;
    count.textContent = `${formatter.format(current + 1)} از ${formatter.format(links.length)}`;
  };
  image.addEventListener('error', () => { image.hidden = true; error.hidden = false; });
  image.addEventListener('load', () => { image.hidden = false; error.hidden = true; });
  links.forEach((link, index) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      previousOverflow = document.body.style.overflow;
      show(index);
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    });
  });
  dialog.querySelector('.viewer-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.viewer-prev').addEventListener('click', () => show(current - 1));
  dialog.querySelector('.viewer-next').addEventListener('click', () => show(current + 1));
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    opener?.focus({ preventScroll: true });
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(current + 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(current - 1); }
  });
  stage.addEventListener('touchstart', (event) => { touchX = event.touches[0]?.clientX ?? null; }, { passive: true });
  stage.addEventListener('touchend', (event) => {
    if (touchX === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchX) - touchX;
    touchX = null;
    if (Math.abs(delta) > 60) show(current + (delta < 0 ? 1 : -1));
  }, { passive: true });
})();
