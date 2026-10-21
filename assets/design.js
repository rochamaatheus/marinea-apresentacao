const header = document.querySelector('.site-header');
const hero = document.querySelector('.hero');
const float = document.querySelector('.whats-float');
let ticking = false, lastY = scrollY, idleTimer, idleOpens = 0;
const onScroll = () => {
  ticking = false;
  const y = scrollY;
  header.classList.toggle('scrolled', y > 8);
  if (float) {
    const visible = y > hero.offsetHeight * 0.6;
    if (visible && !float.classList.contains('show')) openFloat(4200);
    float.classList.toggle('show', visible);
    if (y > lastY + 4) float.classList.remove('open');
    clearTimeout(idleTimer);
    if (visible && idleOpens < 2) idleTimer = setTimeout(() => { idleOpens++; openFloat(3200); }, 6000);
  }
  lastY = y;
};
let closeTimer;
function openFloat(ms) {
  float.classList.add('open');
  clearTimeout(closeTimer);
  closeTimer = setTimeout(() => float.classList.remove('open'), ms);
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

const targets = document.querySelectorAll('[data-reveal],[data-gallery],[data-trace],.footer-brand strong');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in');
    entry.target.dispatchEvent(new Event('reveal'));
    io.unobserve(entry.target);
  }), { rootMargin: '0px 0px -10% 0px' });
  targets.forEach(target => io.observe(target));
} else {
  targets.forEach(target => target.classList.add('in'));
}

document.querySelectorAll('[data-open-tab]').forEach(link => {
  link.addEventListener('click', () => document.getElementById(link.dataset.openTab)?.click());
});

const narrow = matchMedia('(max-width: 900px)');
const pathTabs = document.querySelector('.path-tabs');
if (pathTabs) {
  const place = () => {
    const tab = pathTabs.querySelector('[aria-selected="true"]');
    pathTabs.style.setProperty('--y', `${tab.offsetTop}px`);
    pathTabs.style.setProperty('--h', `${tab.offsetHeight}px`);
  };
  new MutationObserver(place).observe(pathTabs, { attributes: true, subtree: true, attributeFilter: ['aria-selected'] });
  addEventListener('resize', place);
  document.fonts?.ready.then(place);
  place();
  pathTabs.addEventListener('click', e => {
    const tab = e.target.closest('[role="tab"]');
    if (!tab || !narrow.matches) return;
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    requestAnimationFrame(() => { if (panel.getBoundingClientRect().top > innerHeight * 0.55) panel.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  });
}

const coherence = document.querySelector('[data-coherence]');
if (coherence) {
  const section = coherence.closest('.breath-section');
  const button = coherence.querySelector('[data-toggle]');
  const label = coherence.querySelector('[data-label]');
  const count = coherence.querySelector('[data-count]');
  const dots = [...coherence.querySelectorAll('.breath-dots li')];
  const set = (el, text) => { if (el.textContent !== text) el.textContent = text; };
  const pulse = () => { if (navigator.vibrate) navigator.vibrate(12); };
  let timer, start, inhale;
  const stop = message => {
    clearInterval(timer);
    timer = null;
    coherence.classList.remove('running');
    section.classList.remove('focus');
    set(label, message || 'Pronta para começar?');
    set(count, '');
    if (!message) dots.forEach(dot => dot.classList.remove('on'));
    button.textContent = message ? 'Respirar mais um minuto' : 'Respirar por 1 minuto';
  };
  const tick = () => {
    const seconds = (performance.now() - start) / 1000;
    if (seconds >= 60) return stop('Obrigada por esse minuto.');
    const phase = seconds % 10;
    const now = phase < 5;
    if (now !== inhale) { inhale = now; pulse(); }
    set(label, now ? 'Inspire devagar' : 'Solte o ar devagar');
    set(count, String(5 - Math.floor(phase % 5)));
    dots.forEach((dot, i) => dot.classList.toggle('on', i < Math.floor(seconds / 10)));
  };
  button.addEventListener('click', () => {
    if (timer) return stop();
    dots.forEach(dot => dot.classList.remove('on'));
    coherence.classList.add('running');
    section.classList.add('focus');
    start = performance.now();
    inhale = undefined;
    button.textContent = 'Parar';
    tick();
    timer = setInterval(tick, 100);
  });
}

document.querySelectorAll('.video[data-src]').forEach(button => {
  button.addEventListener('click', () => {
    const video = document.createElement('video');
    video.src = button.dataset.src;
    video.poster = button.querySelector('img').src;
    video.controls = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.setAttribute('aria-label', button.getAttribute('aria-label').replace('Assistir: ', ''));
    button.replaceChildren(video);
    button.removeAttribute('aria-label');
    button.style.cursor = 'default';
    video.play().catch(() => {});
  }, { once: true });
});

const bubble = document.querySelector('[data-type]');
if (bubble) {
  const card = bubble.closest('.contact-card');
  const preview = bubble.closest('.chat-preview');
  const text = bubble.textContent;
  bubble.textContent = '';
  card.addEventListener('reveal', () => {
    let i = 0;
    bubble.classList.add('typing');
    const type = () => {
      bubble.textContent = text.slice(0, ++i);
      if (i < text.length) return setTimeout(type, text[i - 1] === ',' || text[i - 1] === '!' ? 260 : 34);
      bubble.classList.remove('typing');
      preview.classList.add('done');
    };
    setTimeout(type, 700);
  }, { once: true });
}

const gallery = document.querySelector('[data-gallery]');
const box = document.querySelector('.lightbox');
if (gallery && box && box.showModal) {
  const photos = [...gallery.querySelectorAll('img')];
  const image = box.querySelector('img');
  const caption = box.querySelector('figcaption');
  let index = 0;
  const show = i => {
    index = (i + photos.length) % photos.length;
    image.src = photos[index].currentSrc || photos[index].src;
    image.alt = photos[index].alt;
    caption.textContent = `${photos[index].alt} (${index + 1} de ${photos.length})`;
  };
  gallery.addEventListener('click', e => {
    const item = e.target.closest('button');
    if (!item) return;
    show(photos.indexOf(item.querySelector('img')));
    box.showModal();
  });
  box.querySelector('.lb-prev').addEventListener('click', () => show(index - 1));
  box.querySelector('.lb-next').addEventListener('click', () => show(index + 1));
  box.querySelector('.lb-close').addEventListener('click', () => box.close());
  box.addEventListener('click', e => { if (e.target === box) box.close(); });
  box.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
  let startX = null;
  box.addEventListener('pointerdown', e => { startX = e.clientX; });
  box.addEventListener('pointerup', e => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });
}
