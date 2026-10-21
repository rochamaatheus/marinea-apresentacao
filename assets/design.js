const header = document.querySelector('.site-header');
const hero = document.querySelector('.hero');
const float = document.querySelector('.whats-float');
let ticking = false;
const onScroll = () => {
  ticking = false;
  header.classList.toggle('scrolled', scrollY > 8);
  if (float) float.classList.toggle('show', scrollY > hero.offsetHeight * 0.6);
};
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

const targets = document.querySelectorAll('[data-reveal],[data-gallery]');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in');
    io.unobserve(entry.target);
  }), { rootMargin: '0px 0px -10% 0px' });
  targets.forEach(target => io.observe(target));
} else {
  targets.forEach(target => target.classList.add('in'));
}

document.querySelectorAll('[data-open-tab]').forEach(link => {
  link.addEventListener('click', () => document.getElementById(link.dataset.openTab)?.click());
});

const coherence = document.querySelector('[data-coherence]');
if (coherence) {
  const button = coherence.querySelector('[data-toggle]');
  const label = coherence.querySelector('[data-label]');
  const count = coherence.querySelector('[data-count]');
  const set = (el, text) => { if (el.textContent !== text) el.textContent = text; };
  let timer, start;
  const stop = message => {
    clearInterval(timer);
    timer = null;
    coherence.classList.remove('running');
    set(label, message || 'Pronta para começar?');
    set(count, '');
    button.textContent = 'Respirar por 1 minuto';
  };
  const tick = () => {
    const seconds = (performance.now() - start) / 1000;
    if (seconds >= 60) return stop('Obrigada por esse minuto.');
    const phase = seconds % 10;
    set(label, phase < 5 ? 'Inspire devagar' : 'Solte o ar devagar');
    set(count, String(5 - Math.floor(phase % 5)));
  };
  button.addEventListener('click', () => {
    if (timer) return stop();
    coherence.classList.add('running');
    start = performance.now();
    button.textContent = 'Parar';
    tick();
    timer = setInterval(tick, 100);
  });
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
