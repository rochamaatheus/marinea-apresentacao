const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('site-nav');
if (toggle && nav) {
  const setOpen = open => { nav.classList.toggle('open', open); toggle.setAttribute('aria-expanded', String(open)); };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  nav.addEventListener('click', e => { if (e.target.closest('a[href^="#"]')) setOpen(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); toggle.focus(); } });
}

document.querySelectorAll('.video[data-video]').forEach(button => {
  button.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${button.dataset.video}?autoplay=1&rel=0`;
    frame.title = button.getAttribute('aria-label') || 'Vídeo';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture';
    frame.allowFullscreen = true;
    button.replaceChildren(frame);
    button.removeAttribute('aria-label');
    button.style.cursor = 'default';
  }, { once: true });
});

const toast = document.createElement('div');
toast.className = 'demo-toast';
toast.setAttribute('role', 'status');
document.body.append(toast);
let toastTimer;
document.addEventListener('click', e => {
  const trigger = e.target.closest('[data-demo]');
  if (!trigger) return;
  e.preventDefault();
  toast.textContent = trigger.dataset.demo;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3800);
});

document.querySelectorAll('[data-tabs]').forEach(group => {
  const tabs = [...group.querySelectorAll('[role="tab"]')];
  const select = tab => tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', e => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const next = tabs[(i + step + tabs.length) % tabs.length];
      select(next);
      next.focus();
    });
  });
});

const revealHidden = target => {
  const panel = target && target.closest('[role="tabpanel"][hidden]');
  if (!panel) return;
  const tab = document.querySelector(`[role="tab"][aria-controls="${panel.id}"]`);
  if (tab) tab.click();
};
document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#"]:not([data-demo])');
  if (link && link.hash.length > 1) revealHidden(document.getElementById(link.hash.slice(1)));
}, true);
if (location.hash.length > 1) revealHidden(document.getElementById(location.hash.slice(1)));

const breath = document.querySelector('[data-breath]');
if (breath) {
  const button = breath.querySelector('button');
  const label = breath.querySelector('[data-breath-label]');
  const count = breath.querySelector('[data-breath-count]');
  let timer, seconds = 0, running = false;
  const stop = () => {
    clearInterval(timer);
    running = false;
    breath.classList.remove('running', 'out');
    label.textContent = 'Pronta para começar?';
    count.textContent = '';
    button.textContent = 'Respirar por 1 minuto';
  };
  const tick = () => {
    const phase = seconds % 10;
    const inhale = phase < 5;
    breath.classList.toggle('out', !inhale);
    label.textContent = inhale ? 'Inspire devagar' : 'Solte o ar devagar';
    count.textContent = String(5 - (phase % 5));
    seconds++;
    if (seconds > 60) { stop(); label.textContent = 'Obrigada por esse minuto.'; }
  };
  button.addEventListener('click', () => {
    if (running) return stop();
    running = true;
    seconds = 0;
    breath.classList.add('running');
    button.textContent = 'Parar';
    tick();
    timer = setInterval(tick, 1000);
  });
}
