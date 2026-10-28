(() => {
  const A = '../assets/';
  const TIPOS = {
    produto: { plural: 'Produtos', um: 'produto', novo: 'Novo produto', link: 'Link de compra', dica: 'Cole o endereço da Amazon, da Hotmart ou da plataforma onde o produto é vendido.', botao: 'Ver e comprar', ajuda: 'Livros, e-books, cursos e kits.' },
    material: { plural: 'Materiais', um: 'material', novo: 'Novo material', link: 'Link do vídeo ou do arquivo', dica: 'Cole o endereço do YouTube ou de um PDF.', botao: 'Abrir material', ajuda: 'Vídeos, exercícios e arquivos para baixar.' },
    artigo: { plural: 'Artigos', um: 'artigo', novo: 'Novo artigo', link: 'Link do artigo', dica: 'Se o texto completo estiver em outro endereço, cole aqui.', botao: 'Ler artigo', ajuda: 'Textos do blog.' },
  };
  const ICON = {
    inicio: '<path d="M4 11l8-7 8 7v9H4z"/>',
    produto: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
    material: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M10 9.5l5 2.5-5 2.5z"/>',
    artigo: '<path d="M6 4h9l3 3v13H6z"/><path d="M9 11h6M9 15h6"/>',
    site: '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5H5V6h5"/>',
    sair: '<path d="M10 4H5v16h5"/><path d="M14 8l4 4-4 4M18 12H9"/>',
  };
  const svg = n => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let nextId = 20;
  const items = [
    { id: 1, tipo: 'produto', titulo: 'Kit de Primeiros Socorros', desc: 'Exercícios de coerência cardíaca para os momentos de ansiedade.', link: 'https://exemplo.com/kit', img: A + 'd-capa-kit-coerencia.webp', ativo: true },
    { id: 2, tipo: 'produto', titulo: 'O Incrível Nicolau', desc: 'Livro infantil sobre emoções.', link: 'https://amazon.com.br/', img: A + 'd-livro-nicolau.webp', ativo: true },
    { id: 3, tipo: 'produto', titulo: 'Micoco', desc: 'Livro infantil ilustrado.', link: 'https://amazon.com.br/', img: A + 'd-livro-micoco.webp', ativo: true },
    { id: 4, tipo: 'material', titulo: 'Boas-vindas ao canal', desc: 'Vídeo de apresentação.', link: 'https://youtube.com/', img: A + 'd-video-boas-vindas.webp', ativo: true },
    { id: 5, tipo: 'material', titulo: 'Inteligência emocional', desc: 'Vídeo sobre como reconhecer o que sentimos.', link: 'https://youtube.com/', img: A + 'd-video-inteligencia-emocional.webp', ativo: true },
    { id: 6, tipo: 'artigo', titulo: 'Morar fora e a saudade', desc: 'O que acontece com o corpo e com a cabeça quando mudamos de país.', link: '', img: A + 'd-blog-morar-fora.webp', ativo: true },
    { id: 7, tipo: 'artigo', titulo: 'Inverno e humor', desc: 'Rascunho do próximo texto.', link: '', img: A + 'd-blog-inverno.webp', ativo: false },
  ];

  const app = document.getElementById('app');
  const toastEl = document.getElementById('toast');
  let toastTimer;
  const toast = msg => { toastEl.textContent = msg; toastEl.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => (toastEl.hidden = true), 4200); };
  const DEMO = ' (no site final, isso fica salvo de verdade)';
  let logged = false;

  const nav = cur => {
    const l = (h, n, t, c) => `<a href="#${h}"${c === cur ? ' aria-current="page"' : ''}>${svg(n)}<span>${t}</span></a>`;
    return `<nav class="side" aria-label="Menu do painel"><p class="sign">Marínea Fediuk</p>${l('inicio', 'inicio', 'Início', 'inicio')}${l('lista/produto', 'produto', 'Produtos', 'produto')}${l('lista/material', 'material', 'Materiais', 'material')}${l('lista/artigo', 'artigo', 'Artigos', 'artigo')}<span class="sp"></span><a href="../" class="out">${svg('site')}<span>Ver o site</span></a><button class="lnk out" data-sair>${svg('sair')}<span>Sair</span></button></nav>`;
  };
  const shell = (cur, body) => `<div class="mobile-top"><span class="sign">Marínea Fediuk</span><button data-sair>Sair</button></div><div class="shell">${nav(cur)}<main class="main" id="conteudo">${body}</main></div>`;

  const rowHtml = it => `<li class="row"><img src="${esc(it.img || A + 'd-marinea-640.webp')}" alt="" width="72" height="72"><div><h3>${esc(it.titulo)}</h3><p>${esc(it.desc)}</p><span class="status${it.ativo ? '' : ' off'}">${it.ativo ? 'Aparece no site' : 'Rascunho, não aparece no site'}</span></div><div class="ops"><a class="btn sec small" href="#editar/${it.id}">Editar</a><button class="btn sec small" data-alterna="${it.id}">${it.ativo ? 'Esconder do site' : 'Mostrar no site'}</button><button class="btn danger small" data-remove="${it.id}">Remover</button></div></li>`;

  const views = {
    login(err) {
      app.innerHTML = `<div class="login"><form class="login-card" id="login" novalidate><p class="sign">Marínea Fediuk</p><h1>Entrar no painel</h1><p>Aqui você e sua filha adicionam produtos, materiais e artigos do site.</p>${err ? `<p class="error" role="alert">${err}</p>` : ''}<div class="field"><label for="email">E-mail</label><input id="email" type="email" autocomplete="username" inputmode="email"></div><div class="field"><label for="senha">Senha</label><div class="pass"><input id="senha" type="password" autocomplete="current-password"><button type="button" data-ver aria-pressed="false">Mostrar</button></div></div><button class="btn" style="width:100%" type="submit">Entrar</button></form></div>`;
      app.querySelector('#email').focus();
    },
    inicio() {
      const recentes = [...items].reverse().slice(0, 4);
      app.innerHTML = shell('inicio', `<h1>Olá, Marínea</h1><p class="lead">O que você quer fazer hoje?</p><div class="actions">${Object.entries(TIPOS).map(([k, t]) => `<a class="action" href="#novo/${k}"><b>${t.novo}</b><span>${t.ajuda}</span></a>`).join('')}</div><h2>Últimos itens</h2><ul class="list">${recentes.map(rowHtml).join('')}</ul>`);
    },
    lista(tipo) {
      const t = TIPOS[tipo];
      const lista = items.filter(i => i.tipo === tipo);
      app.innerHTML = shell(tipo, `<div class="head-row"><div><h1>${t.plural}</h1><p class="lead">${t.ajuda}</p></div><a class="btn" href="#novo/${tipo}">+ ${t.novo}</a></div>${lista.length ? `<ul class="list">${lista.map(rowHtml).join('')}</ul>` : `<p class="empty">Nada por aqui ainda. Clique em "${t.novo}" para começar.</p>`}`);
    },
    form(tipo, id) {
      const t = TIPOS[tipo];
      const it = id ? items.find(i => i.id === id) : { tipo, titulo: '', desc: '', link: '', img: '', ativo: true };
      if (!it) return go('inicio');
      app.innerHTML = shell(tipo, `<h1>${id ? 'Editar ' + t.um : t.novo}</h1><p class="lead">Preencha e veja na prévia como vai aparecer no site.</p><form class="edit" id="form" novalidate><div><div class="field"><span class="lab" id="lab-foto">Foto ou capa</span><label class="drop" id="drop" aria-labelledby="lab-foto"><input type="file" id="foto" accept="image/jpeg,image/png,image/webp"><span id="drop-txt">${it.img ? `<img src="${esc(it.img)}" alt="Foto atual">` : 'Clique para escolher uma imagem<br><small>JPG, PNG ou WebP, até 5 MB</small>'}</span></label><span class="hint">O site ajusta o tamanho sozinho.</span></div><div class="field"><label for="titulo">Título</label><input type="text" id="titulo" maxlength="120" value="${esc(it.titulo)}"></div><div class="field"><label for="desc">Descrição curta</label><textarea id="desc" maxlength="400">${esc(it.desc)}</textarea><span class="hint">Duas ou três frases são o suficiente.</span></div><div class="field"><label for="link">${t.link}</label><input type="url" id="link" inputmode="url" placeholder="https://" value="${esc(it.link)}"><span class="hint">${t.dica}</span></div><div class="field"><label class="switch"><input type="checkbox" id="ativo"${it.ativo ? ' checked' : ''}><span>Mostrar no site</span></label><span class="hint">Desmarque para guardar como rascunho.</span></div><p class="error" id="erro" role="alert" hidden></p><div class="form-actions"><button class="btn" type="submit">Salvar</button><a class="btn sec" href="#lista/${tipo}">Cancelar</a></div></div><aside class="preview" aria-label="Prévia"><p class="lab">Como vai aparecer no site</p><div class="pcard"><div class="ph" id="p-img">${it.img ? `<img src="${esc(it.img)}" alt="">` : 'A foto aparece aqui'}</div><div class="pb"><h3 id="p-t">${esc(it.titulo) || 'Título'}</h3><p id="p-d">${esc(it.desc)}</p><span class="go">${t.botao}</span></div></div></aside></form>`);
      let img = it.img;
      const $ = s => app.querySelector(s);
      $('#titulo').addEventListener('input', e => ($('#p-t').textContent = e.target.value || 'Título'));
      $('#desc').addEventListener('input', e => ($('#p-d').textContent = e.target.value));
      $('#foto').addEventListener('change', e => {
        const f = e.target.files[0];
        if (!f) return;
        if (!/^image\/(jpeg|png|webp)$/.test(f.type) || f.size > 5 * 1024 * 1024) { const er = $('#erro'); er.textContent = 'Escolha uma imagem JPG, PNG ou WebP de até 5 MB.'; er.hidden = false; return; }
        img = URL.createObjectURL(f);
        $('#drop-txt').innerHTML = `<img src="${img}" alt="Foto escolhida">`;
        $('#p-img').innerHTML = `<img src="${img}" alt="">`;
      });
      $('#form').addEventListener('submit', e => {
        e.preventDefault();
        const titulo = $('#titulo').value.trim(), link = $('#link').value.trim();
        const er = $('#erro');
        if (!titulo) { er.textContent = 'Escreva um título para continuar.'; er.hidden = false; $('#titulo').focus(); return; }
        if (link && !/^https?:\/\/\S+$/i.test(link)) { er.textContent = 'O link precisa começar com https://'; er.hidden = false; $('#link').focus(); return; }
        const dados = { titulo, desc: $('#desc').value.trim(), link, img, ativo: $('#ativo').checked };
        if (id) Object.assign(it, dados); else items.push({ id: nextId++, tipo, ...dados });
        toast('Salvo.' + DEMO);
        go('lista/' + tipo);
      });
    },
  };

  const go = h => { location.hash = '#' + h; };
  function route() {
    const [r, a] = location.hash.slice(1).split('/');
    if (!logged) return views.login();
    if (r === 'lista' && TIPOS[a]) views.lista(a);
    else if (r === 'novo' && TIPOS[a]) views.form(a);
    else if (r === 'editar') { const it = items.find(i => i.id === Number(a)); it ? views.form(it.tipo, it.id) : views.inicio(); }
    else views.inicio();
    window.scrollTo(0, 0);
    const h = document.querySelector('#conteudo h1');
    if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  }

  app.addEventListener('submit', e => {
    if (e.target.id !== 'login') return;
    e.preventDefault();
    const email = e.target.querySelector('#email').value.trim(), senha = e.target.querySelector('#senha').value;
    if (!email || !senha) return views.login('Preencha o e-mail e a senha.');
    logged = true;
    go('inicio');
    route();
  });

  app.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-ver')) {
      const i = app.querySelector('#senha'), ver = i.type === 'password';
      i.type = ver ? 'text' : 'password';
      b.textContent = ver ? 'Esconder' : 'Mostrar';
      b.setAttribute('aria-pressed', String(ver));
    } else if (b.hasAttribute('data-sair')) { logged = false; go('entrar'); route(); }
    else if (b.dataset.alterna) {
      const it = items.find(i => i.id === Number(b.dataset.alterna));
      it.ativo = !it.ativo;
      toast(it.ativo ? 'Agora aparece no site.' + DEMO : 'Escondido do site.' + DEMO);
      route();
    } else if (b.dataset.remove) {
      const it = items.find(i => i.id === Number(b.dataset.remove));
      const m = document.createElement('div');
      m.className = 'modal';
      m.innerHTML = `<div class="box" role="alertdialog" aria-modal="true" aria-labelledby="mt"><h2 id="mt">Remover este item?</h2><p>"${esc(it.titulo)}" vai sair do site. Se preferir só esconder por um tempo, use "Esconder do site".</p><div class="form-actions"><button class="btn danger" data-sim>Sim, remover</button><button class="btn sec" data-nao>Voltar</button></div></div>`;
      document.body.appendChild(m);
      const fecha = () => { m.remove(); b.focus(); };
      m.querySelector('[data-nao]').focus();
      m.addEventListener('click', ev => {
        if (ev.target === m || ev.target.hasAttribute('data-nao')) fecha();
        else if (ev.target.hasAttribute('data-sim')) { items.splice(items.indexOf(it), 1); m.remove(); toast('Removido.' + DEMO); route(); }
      });
      m.addEventListener('keydown', ev => { if (ev.key === 'Escape') fecha(); });
    }
  });

  window.addEventListener('hashchange', route);
  route();
})();
