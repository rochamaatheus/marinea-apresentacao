(() => {
  const A = '../assets/';
  const SITE = 'psicologamarineafediuk.com';
  const TIPOS = {
    produto: {
      plural: 'Produtos', um: 'produto', novo: 'Novo produto', botao: 'Ver e comprar', ajuda: 'Livros, e-books, cursos e kits.',
      link: 'Onde a pessoa compra',
      dica: 'Abra a página do produto na Amazon, na Hotmart ou na loja onde ele é vendido. Copie o endereço que aparece lá em cima, na barra do navegador, e cole aqui.',
      exemplo: 'Ex.: https://www.amazon.com.br/livro-o-incrivel-nicolau',
    },
    material: {
      plural: 'Materiais', um: 'material', novo: 'Novo material', botao: 'Abrir material', ajuda: 'Vídeos, exercícios e arquivos para baixar.',
      link: 'Onde está o vídeo ou o arquivo',
      dica: 'Abra o vídeo no YouTube (ou o PDF no Google Drive). Copie o endereço que aparece lá em cima, na barra do navegador, e cole aqui.',
      exemplo: 'Ex.: https://www.youtube.com/watch?v=...',
    },
    artigo: { plural: 'Artigos', um: 'artigo', novo: 'Novo artigo', botao: 'Ler artigo', ajuda: 'Textos do blog. Você escreve aqui mesmo e o site cria a página do artigo sozinho.' },
  };
  const ICON = {
    inicio: '<path d="M4 11l8-7 8 7v9H4z"/>',
    produto: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
    material: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M10 9.5l5 2.5-5 2.5z"/>',
    artigo: '<path d="M6 4h9l3 3v13H6z"/><path d="M9 11h6M9 15h6"/>',
    site: '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5H5V6h5"/>',
    sair: '<path d="M10 4H5v16h5"/><path d="M14 8l4 4-4 4M18 12H9"/>',
    desfazer: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    refazer: '<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
    lista: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
    numerada: '<path d="M10 6h10M10 12h10M10 18h10"/><path d="M4 5l1.5-1V9M3.5 13.5c.4-.9 2.8-1 2.6.6-.1.8-2.6 2.2-2.6 2.9h2.8"/>',
    citacao: '<path d="M7 7c-2 1-3 3-3 6v4h5v-5H6c0-2 1-3 2.5-3.6zM17 7c-2 1-3 3-3 6v4h5v-5h-3c0-2 1-3 2.5-3.6z"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    imagem: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/>',
    video: '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M10.5 9.5l4 2.5-4 2.5z"/>',
    divisoria: '<path d="M4 12h16"/>',
  };
  const svg = n => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- regras automáticas dos artigos ----------
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const hoje = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const dataBR = iso => { const [y, m, d] = (iso || hoje()).split('-').map(Number); return `${d} de ${MESES[m - 1]} de ${y}`; };
  const slugify = t => {
    const s = String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (s.length <= 90) return s;
    return s.slice(0, 90).replace(/-[^-]*$/, '');
  };
  const textoDeHtml = h => { const d = document.createElement('div'); d.innerHTML = h || ''; return d.textContent || ''; };
  const contaPalavras = t => (t.match(/[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu) || []).length;
  const minutos = palavras => Math.max(1, Math.round(palavras / 160)); // leitura atenta, como no blog atual
  const corta = (t, n) => (t.length <= n ? t : t.slice(0, n).replace(/\s+\S*$/, '') + '…');
  const primeiroParagrafo = h => { const d = document.createElement('div'); d.innerHTML = h || ''; const p = [...d.querySelectorAll('p')].find(x => x.textContent.trim().length > 40); return p ? p.textContent.trim() : ''; };
  const resumoDe = it => (it.resumoManual && it.desc ? it.desc : corta(primeiroParagrafo(it.html), 200));

  // ---------- links de produtos e materiais ----------
  const normalizaLink = v => {
    let s = v.trim();
    if (!s) return '';
    if (/^\/\//.test(s)) s = 'https:' + s;
    if (!/^[a-z]+:/i.test(s) && /^[\w-]+(\.[\w-]+)+/.test(s)) s = 'https://' + s; // colou sem o https://
    try { const u = new URL(s); return /^https?:$/.test(u.protocol) && u.hostname.includes('.') ? u.href : null; } catch { return null; }
  };
  const reconhece = url => {
    if (!url) return null;
    const h = new URL(url).hostname.replace(/^www\./, '');
    if (/amazon\./.test(h) || h === 'amzn.to') return { nome: 'página da Amazon', botao: 'Comprar na Amazon' };
    if (/hotmart\./.test(h) || h === 'go.hotmart.com') return { nome: 'página da Hotmart', botao: 'Comprar na Hotmart' };
    if (/(kiwify|eduzz|monetizze)\./.test(h)) return { nome: 'página de venda', botao: 'Comprar agora' };
    if (/(youtube\.com|youtu\.be)$/.test(h)) return { nome: 'vídeo do YouTube', botao: 'Assistir no YouTube' };
    if (/drive\.google\.com|docs\.google\.com/.test(h)) return { nome: 'arquivo do Google Drive', botao: 'Abrir o arquivo' };
    if (/\.pdf($|\?)/i.test(url)) return { nome: 'arquivo PDF', botao: 'Baixar o PDF' };
    if (/instagram\.com$/.test(h)) return { nome: 'publicação do Instagram', botao: 'Ver no Instagram' };
    return { nome: 'endereço em ' + h, botao: null };
  };

  let nextId = 20;
  const AI = window.ARTIGO_INVERNO || { linha: '', html: '<p></p>' };
  const items = [
    { id: 1, tipo: 'produto', titulo: 'Kit de Primeiros Socorros', desc: 'Exercícios de coerência cardíaca para os momentos de ansiedade.', link: 'https://exemplo.com/kit', img: A + 'd-capa-kit-coerencia.webp', ativo: true },
    { id: 2, tipo: 'produto', titulo: 'O Incrível Nicolau', desc: 'Livro infantil sobre emoções.', link: 'https://www.amazon.com.br/', img: A + 'd-livro-nicolau.webp', ativo: true },
    { id: 3, tipo: 'produto', titulo: 'Micoco', desc: 'Livro infantil ilustrado.', link: 'https://www.amazon.com.br/', img: A + 'd-livro-micoco.webp', ativo: true },
    { id: 4, tipo: 'material', titulo: 'Boas-vindas ao canal', desc: 'Vídeo de apresentação.', link: 'https://www.youtube.com/', img: A + 'd-video-boas-vindas.webp', ativo: true },
    { id: 5, tipo: 'material', titulo: 'Inteligência emocional', desc: 'Vídeo sobre como reconhecer o que sentimos.', link: 'https://www.youtube.com/', img: A + 'd-video-inteligencia-emocional.webp', ativo: true },
    { id: 6, tipo: 'artigo', titulo: 'O convite do inverno: por que precisamos desacelerar para permanecer saudáveis', linha: AI.linha, html: AI.html, desc: '', resumoManual: false, img: A + 'd-blog-inverno.webp', data: '2026-07-02', slug: 'o-convite-do-inverno-por-que-precisamos-desacelerar-para-permanecer-saudaveis', slugManual: false, ativo: true },
    { id: 7, tipo: 'artigo', titulo: 'Morar fora pode despertar dores emocionais profundas', linha: '', html: '<p>Muitas pessoas sonham durante anos com a possibilidade de viver em outro país. Planejam. Organizam documentos. Aprendem idiomas. Imaginam oportunidades. Idealizam uma nova vida.</p><p>E, de fato, morar fora pode trazer experiências transformadoras.</p>', desc: '', resumoManual: false, img: A + 'd-blog-morar-fora.webp', data: '2026-05-29', slug: 'morar-fora-pode-despertar-dores-emocionais-profundas', slugManual: false, ativo: true },
    { id: 8, tipo: 'artigo', titulo: 'O corpo guarda aquilo que a mente tenta esquecer', linha: '', html: '<p>Há dores que conseguimos explicar. Outras, não. Algumas pessoas chegam à psicoterapia dizendo: “Minha vida está boa, mas eu continuo ansiosa.”</p>', desc: '', resumoManual: false, img: A + 'd-blog-corpo.webp', data: '2026-05-21', slug: 'o-corpo-guarda-aquilo-que-a-mente-tenta-esquecer', slugManual: false, ativo: false },
  ];

  const app = document.getElementById('app');
  const toastEl = document.getElementById('toast');
  let toastTimer;
  const toast = msg => { toastEl.textContent = msg; toastEl.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => (toastEl.hidden = true), 4200); };
  const DEMO = ' (no site final, isso fica salvo de verdade)';
  let logged = false;
  let editorAtual = null;
  let salvarPendente = null;

  // O editor (Tiptap) só é baixado quando ela abre um artigo: o resto do painel continua leve.
  let editorPronto;
  const carregaEditor = () => editorPronto || (editorPronto = new Promise((ok, falha) => {
    const s = document.createElement('script');
    s.src = A + 'editor.js';
    s.onload = () => ok(window.MarineaEditor);
    s.onerror = () => { editorPronto = null; falha(new Error('editor')); };
    document.head.appendChild(s);
  }));

  const nav = cur => {
    const l = (h, n, t, c) => `<a href="#${h}"${c === cur ? ' aria-current="page"' : ''}>${svg(n)}<span>${t}</span></a>`;
    return `<nav class="side" aria-label="Menu do painel"><p class="sign">Marínea Fediuk</p>${l('inicio', 'inicio', 'Início', 'inicio')}${l('lista/produto', 'produto', 'Produtos', 'produto')}${l('lista/material', 'material', 'Materiais', 'material')}${l('lista/artigo', 'artigo', 'Artigos', 'artigo')}<span class="sp"></span><a href="../" class="out">${svg('site')}<span>Ver o site</span></a><button class="lnk out" data-sair>${svg('sair')}<span>Sair</span></button></nav>`;
  };
  const shell = (cur, body, cls = '') => `<div class="mobile-top"><span class="sign">Marínea Fediuk</span><button data-sair>Sair</button></div><div class="shell">${nav(cur)}<main class="main${cls}" id="conteudo">${body}</main></div>`;

  const statusHtml = it => {
    if (it.tipo !== 'artigo') return `<span class="status${it.ativo ? '' : ' off'}">${it.ativo ? 'Aparece no site' : 'Rascunho, não aparece no site'}</span>`;
    const min = minutos(contaPalavras(textoDeHtml(it.html)));
    return `<span class="status${it.ativo ? '' : ' off'}">${it.ativo ? 'Publicado' : 'Rascunho, só você vê'}</span><span class="meta"> · ${dataBR(it.data)} · ${min} min de leitura</span>`;
  };
  const rowHtml = it => `<li class="row"><img src="${esc(it.img || A + 'd-marinea-640.webp')}" alt="" width="72" height="72"><div><h3>${esc(it.titulo || 'Artigo sem título')}</h3><p>${esc(it.tipo === 'artigo' ? resumoDe(it) : it.desc)}</p>${statusHtml(it)}</div><div class="ops"><a class="btn sec small" href="#editar/${it.id}">${it.tipo === 'artigo' ? 'Abrir e editar' : 'Editar'}</a><button class="btn sec small" data-alterna="${it.id}">${it.ativo ? 'Esconder do site' : 'Mostrar no site'}</button><button class="btn danger small" data-remove="${it.id}">Remover</button></div></li>`;

  // Reduz a foto no próprio navegador antes de enviar: fica leve no site sem ela precisar pensar nisso.
  const preparaImagem = (file, max = 1600) => new Promise((ok, falha) => {
    if (!/^image\/(jpeg|png|webp|gif|avif)$/.test(file.type)) return falha(new Error('Esse arquivo não é uma imagem. Use JPG, PNG ou WebP.'));
    if (file.size > 15 * 1024 * 1024) return falha(new Error('Essa imagem é grande demais (mais de 15 MB). Tente outra ou tire um print dela.'));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(b => (b ? ok(URL.createObjectURL(b)) : falha(new Error('Não consegui ler essa imagem.'))), 'image/webp', 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); falha(new Error('Não consegui abrir essa imagem.')); };
    img.src = url;
  });

  // Janela simples com um ou dois campos (usada para link e vídeo).
  function pergunta({ titulo, texto, campos, ok = 'Aplicar', extra }) {
    return new Promise(resolve => {
      const volta = document.activeElement;
      const m = document.createElement('div');
      m.className = 'modal';
      m.innerHTML = `<form class="box" role="dialog" aria-modal="true" aria-labelledby="pt" novalidate><h2 id="pt">${titulo}</h2>${texto ? `<p>${texto}</p>` : ''}${campos.map((c, i) => `<div class="field"><label for="pc${i}">${c.rotulo}</label><input id="pc${i}" type="text" value="${esc(c.valor || '')}" placeholder="${esc(c.ph || '')}"${c.url ? ' inputmode="url" autocomplete="off" spellcheck="false"' : ''}>${c.dica ? `<span class="hint">${c.dica}</span>` : ''}</div>`).join('')}<p class="error" role="alert" hidden></p><div class="form-actions"><button class="btn" type="submit">${ok}</button>${extra ? `<button class="btn danger" type="button" data-extra>${extra}</button>` : ''}<button class="btn sec" type="button" data-nao>Cancelar</button></div></form>`;
      document.body.appendChild(m);
      const fecha = v => { m.remove(); if (volta) volta.focus(); resolve(v); };
      const er = m.querySelector('.error');
      m.querySelector('#pc0').focus();
      m.querySelector('#pc0').select();
      m.addEventListener('click', ev => {
        if (ev.target === m || ev.target.hasAttribute('data-nao')) fecha(null);
        else if (ev.target.hasAttribute('data-extra')) fecha({ extra: true });
      });
      m.addEventListener('keydown', ev => { if (ev.key === 'Escape') fecha(null); });
      m.querySelector('form').addEventListener('submit', ev => {
        ev.preventDefault();
        const vals = campos.map((c, i) => m.querySelector('#pc' + i).value);
        const erro = campos.map((c, i) => c.valida && c.valida(vals[i])).find(Boolean);
        if (erro) { er.textContent = erro; er.hidden = false; return; }
        fecha({ vals });
      });
    });
  }

  const views = {
    login(err) {
      app.innerHTML = `<div class="login"><form class="login-card" id="login" novalidate><p class="sign">Marínea Fediuk</p><h1>Entrar no painel</h1>${err ? `<p class="error" role="alert">${err}</p>` : ''}<div class="field"><label for="email">E-mail</label><input id="email" type="email" autocomplete="username" inputmode="email" value="marinea@exemplo.com"></div><div class="field"><label for="senha">Senha</label><div class="pass"><input id="senha" type="password" autocomplete="current-password" value="demonstracao"><button type="button" data-ver aria-pressed="false">Mostrar</button></div></div><button class="btn" style="width:100%" type="submit">Entrar</button></form></div>`;
      app.querySelector('#email').focus();
    },
    inicio() {
      const recentes = [...items].reverse().slice(0, 4);
      app.innerHTML = shell('inicio', `<h1>Olá, Marínea</h1><p class="lead">O que você quer fazer hoje?</p><div class="actions">${Object.entries(TIPOS).map(([k, t]) => `<a class="action" href="#novo/${k}"><b>${t.novo}</b><span>${k === 'artigo' ? 'Escreva o texto do blog aqui mesmo.' : t.ajuda}</span></a>`).join('')}</div><h2>Últimos itens</h2><ul class="list">${recentes.map(rowHtml).join('')}</ul>`);
    },
    lista(tipo) {
      const t = TIPOS[tipo];
      const lista = items.filter(i => i.tipo === tipo);
      if (tipo === 'artigo') lista.sort((a, b) => (b.data || '').localeCompare(a.data || ''));
      app.innerHTML = shell(tipo, `<div class="head-row"><div><h1>${t.plural}</h1><p class="lead">${t.ajuda}</p></div><a class="btn" href="#novo/${tipo}">+ ${t.novo}</a></div>${lista.length ? `<ul class="list">${lista.map(rowHtml).join('')}</ul>` : `<p class="empty">Nada por aqui ainda. Clique em "${t.novo}" para começar.</p>`}`);
    },

    // ---------- produtos e materiais ----------
    form(tipo, id) {
      const t = TIPOS[tipo];
      const it = id ? items.find(i => i.id === id) : { tipo, titulo: '', desc: '', link: '', img: '', ativo: true };
      if (!it) return go('inicio');
      app.innerHTML = shell(tipo, `<h1>${id ? 'Editar ' + t.um : t.novo}</h1><p class="lead">Preencha e veja na prévia como vai aparecer no site.</p><form class="edit" id="form" novalidate><div><div class="field"><span class="lab" id="lab-foto">Foto ou capa</span><label class="drop" id="drop" aria-labelledby="lab-foto"><input type="file" id="foto" accept="image/jpeg,image/png,image/webp"><span id="drop-txt">${it.img ? `<img src="${esc(it.img)}" alt="Foto atual">` : 'Clique para escolher uma imagem<br><small>JPG, PNG ou WebP</small>'}</span></label><span class="hint">O site ajusta o tamanho sozinho.</span></div><div class="field"><label for="titulo">Título</label><input type="text" id="titulo" maxlength="120" value="${esc(it.titulo)}"></div><div class="field"><label for="desc">Descrição curta</label><textarea id="desc" maxlength="400">${esc(it.desc)}</textarea><span class="hint">Duas ou três frases são o suficiente.</span></div><div class="field"><label for="link">${t.link}</label><span class="hint como" id="link-dica">${t.dica}</span><input type="text" id="link" inputmode="url" autocomplete="off" spellcheck="false" placeholder="${esc(t.exemplo)}" value="${esc(it.link)}" aria-describedby="link-dica link-ok"><span class="hint reconhecido" id="link-ok" aria-live="polite"></span></div><div class="field"><label class="switch"><input type="checkbox" id="ativo"${it.ativo ? ' checked' : ''}><span>Mostrar no site</span></label><span class="hint">Desmarque para guardar como rascunho.</span></div><p class="error" id="erro" role="alert" hidden></p><div class="form-actions"><button class="btn" type="submit">Salvar</button><a class="btn sec" href="#lista/${tipo}">Cancelar</a></div></div><aside class="preview" aria-label="Prévia"><p class="lab">Como vai aparecer no site</p><div class="pcard"><div class="ph" id="p-img">${it.img ? `<img src="${esc(it.img)}" alt="">` : 'A foto aparece aqui'}</div><div class="pb"><h3 id="p-t">${esc(it.titulo) || 'Título'}</h3><p id="p-d">${esc(it.desc)}</p><span class="go" id="p-go">${t.botao}</span></div></div></aside></form>`);
      let img = it.img;
      const $ = s => app.querySelector(s);
      $('#titulo').addEventListener('input', e => ($('#p-t').textContent = e.target.value || 'Título'));
      $('#desc').addEventListener('input', e => ($('#p-d').textContent = e.target.value));
      const mostraLink = () => {
        const bruto = $('#link').value, url = normalizaLink(bruto), ok = $('#link-ok');
        ok.className = 'hint reconhecido';
        if (!bruto.trim()) { ok.textContent = ''; $('#p-go').textContent = t.botao; return; }
        if (url === null) { ok.classList.add('ruim'); ok.textContent = 'Isso ainda não parece um endereço de internet. Ele costuma começar com https://'; return; }
        const r = reconhece(url);
        ok.textContent = `✓ Reconhecido: ${r.nome}.${r.botao ? ` No site, o botão vai dizer “${r.botao}”.` : ''}`;
        $('#p-go').textContent = r.botao || t.botao;
      };
      $('#link').addEventListener('input', mostraLink);
      $('#link').addEventListener('blur', () => { const u = normalizaLink($('#link').value); if (u) $('#link').value = u; });
      mostraLink();
      $('#foto').addEventListener('change', async e => {
        const f = e.target.files[0];
        if (!f) return;
        try {
          img = await preparaImagem(f, 1200);
          $('#drop-txt').innerHTML = `<img src="${img}" alt="Foto escolhida">`;
          $('#p-img').innerHTML = `<img src="${img}" alt="">`;
        } catch (x) { const er = $('#erro'); er.textContent = x.message; er.hidden = false; }
      });
      $('#form').addEventListener('submit', e => {
        e.preventDefault();
        const titulo = $('#titulo').value.trim(), link = normalizaLink($('#link').value);
        const er = $('#erro');
        if (!titulo) { er.textContent = 'Escreva um título para continuar.'; er.hidden = false; $('#titulo').focus(); return; }
        if (link === null) { er.textContent = 'O endereço colado não parece um link. Abra a página no navegador, copie o endereço lá em cima e cole de novo.'; er.hidden = false; $('#link').focus(); return; }
        const dados = { titulo, desc: $('#desc').value.trim(), link, img, ativo: $('#ativo').checked };
        if (id) Object.assign(it, dados); else items.push({ id: nextId++, tipo, ...dados });
        toast('Salvo.' + DEMO);
        go('lista/' + tipo);
      });
    },

    // ---------- artigos: escritos aqui mesmo ----------
    artigo(id) {
      const novo = !id;
      const it = novo
        ? { id: null, tipo: 'artigo', titulo: '', linha: '', html: '', desc: '', resumoManual: false, img: '', data: hoje(), slug: '', slugManual: false, ativo: false }
        : items.find(i => i.id === id);
      if (!it) return go('inicio');
      const B = (cmd, icone, rotulo, texto) => `<button type="button" data-cmd="${cmd}" aria-label="${rotulo}" title="${rotulo}">${icone ? svg(icone) : ''}${texto ? `<span>${texto}</span>` : ''}</button>`;
      app.innerHTML = shell('artigo', `
        <div class="art-barra">
          <a class="voltar" href="#lista/artigo">← Artigos</a>
          <span class="salvo" id="salvo" aria-live="polite">${novo ? 'O painel salva sozinho enquanto você escreve.' : 'Tudo salvo.'}</span>
          <span class="sp"></span>
          <button class="btn sec small" type="button" id="ver">Ver como fica no site</button>
          <button class="btn small" type="button" id="publicar">${it.ativo ? 'Atualizar no site' : 'Publicar no site'}</button>
        </div>
        <details class="como-funciona"${novo ? ' open' : ''}><summary>Como funciona?</summary><ol>
          <li><b>Escreva aqui como no Word.</b> Pode digitar ou colar o texto do Word ou do Google Docs: os subtítulos, negritos e listas vêm junto.</li>
          <li><b>Não precisa salvar.</b> Enquanto você escreve, o painel guarda sozinho como rascunho, que só você vê.</li>
          <li><b>Clique em “Publicar no site”.</b> O artigo ganha uma página própria no site, com o endereço mostrado ao lado. Você não precisa colar link nenhum.</li>
        </ol></details>
        <div class="art-grid">
          <div class="folha">
            <label class="sr" for="titulo">Título do artigo</label>
            <textarea id="titulo" class="art-titulo" rows="1" maxlength="160" placeholder="Título do artigo">${esc(it.titulo)}</textarea>
            <label class="sr" for="linha">Frase abaixo do título (opcional)</label>
            <textarea id="linha" class="art-linha" rows="1" maxlength="200" placeholder="Frase abaixo do título (opcional)">${esc(it.linha)}</textarea>
            <div class="toolbar" role="toolbar" aria-label="Formatação do texto" id="toolbar">
              <div class="grupo">${B('undo', 'desfazer', 'Desfazer (Ctrl+Z)')}${B('redo', 'refazer', 'Refazer (Ctrl+Y)')}</div>
              <div class="grupo"><label class="sr" for="estilo">Estilo do parágrafo</label><select id="estilo" title="Estilo do parágrafo"><option value="p">Texto normal</option><option value="h2">Subtítulo</option><option value="h3">Subtítulo menor</option></select></div>
              <div class="grupo">${B('bold', '', 'Negrito (Ctrl+B)', '<b>N</b>')}${B('italic', '', 'Itálico (Ctrl+I)', '<i>I</i>')}${B('link', 'link', 'Link (Ctrl+K)', 'Link')}</div>
              <div class="grupo">${B('bulletList', 'lista', 'Lista com marcadores')}${B('orderedList', 'numerada', 'Lista numerada')}${B('blockquote', 'citacao', 'Citação em destaque', 'Citação')}</div>
              <div class="grupo">${B('image', 'imagem', 'Inserir imagem', 'Imagem')}${B('youtube', 'video', 'Inserir vídeo do YouTube', 'Vídeo')}${B('hr', 'divisoria', 'Linha divisória')}</div>
              <input type="file" id="img-texto" accept="image/*" hidden>
            </div>
            <div class="bolha" id="bolha" role="toolbar" aria-label="Formatar seleção">${B('bold', '', 'Negrito', '<b>N</b>')}${B('italic', '', 'Itálico', '<i>I</i>')}${B('link', 'link', 'Link')}${B('h2', '', 'Transformar em subtítulo', 'Subtítulo')}</div>
            <div id="editor" class="editor-area"><p class="carregando">Abrindo o editor…</p></div>
            <p class="contagem" id="contagem" aria-live="off"></p>
          </div>
          <aside class="art-lado" aria-label="Dados da publicação">
            <section><h2>Situação</h2><p class="status${it.ativo ? '' : ' off'}" id="situacao">${it.ativo ? 'Publicado no site' : 'Rascunho, só você vê'}</p>${it.ativo ? '<button class="lnk" type="button" id="despublicar">Tirar do site e voltar a rascunho</button>' : ''}</section>
            <section><h2><label for="data">Data do artigo</label></h2><input type="date" id="data" value="${esc(it.data)}"><span class="hint">${novo ? 'Já vem com a data de hoje. Mude só se quiser.' : 'É a data que aparece no blog.'}</span></section>
            <section><h2>Endereço no site</h2><p class="endereco" id="endereco"></p><span class="hint" id="endereco-dica">Criado sozinho a partir do título.</span>
              <details class="avancado"><summary>Alterar o endereço</summary><label class="sr" for="slug">Endereço</label><input type="text" id="slug" value="${esc(it.slug)}" spellcheck="false"><span class="hint">Use só letras, números e hífen. Depois de publicado, mudar o endereço quebra links já compartilhados.</span><button class="lnk" type="button" id="slug-auto">Voltar a criar pelo título</button></details></section>
            <section><h2><span id="lab-capa">Foto de capa</span></h2><label class="drop pequena" aria-labelledby="lab-capa"><input type="file" id="capa" accept="image/jpeg,image/png,image/webp"><span id="capa-txt">${it.img ? `<img src="${esc(it.img)}" alt="Capa atual">` : 'Clique para escolher<br><small>Aparece no blog e quando o link é enviado no WhatsApp</small>'}</span></label></section>
            <section><h2>Como aparece no blog</h2><div class="pcard"><div class="ph" id="p-img">${it.img ? `<img src="${esc(it.img)}" alt="">` : 'A capa aparece aqui'}</div><div class="pb"><p class="p-data" id="p-data"></p><h3 id="p-t"></h3><p id="p-d"></p><span class="go">Ler artigo</span></div></div>
              <label class="switch resumo-sw"><input type="checkbox" id="resumo-manual"${it.resumoManual ? ' checked' : ''}><span>Quero escrever o resumo do card</span></label>
              <div id="resumo-box"${it.resumoManual ? '' : ' hidden'}><label class="sr" for="resumo">Resumo</label><textarea id="resumo" maxlength="300" placeholder="Duas frases que convidem a ler">${esc(it.desc)}</textarea></div>
              <span class="hint" id="resumo-dica">${it.resumoManual ? '' : 'O resumo é feito sozinho com o começo do texto.'}</span></section>
          </aside>
        </div>`, ' art');

      const $ = s => app.querySelector(s);
      let editor = null, timer = null;
      const auto = el => { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; };
      ['#titulo', '#linha'].forEach(s => { auto($(s)); $(s).addEventListener('input', e => auto(e.target)); $(s).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (s === '#titulo') $('#linha').focus(); else if (editor) editor.commands.focus('start'); } }); });

      const atualizaLado = () => {
        if (!it.slugManual) it.slug = slugify($('#titulo').value);
        $('#slug').value = it.slug;
        $('#endereco').innerHTML = it.slug ? `${SITE}/<b>${esc(it.slug)}</b>/` : `${SITE}/<i>o-titulo-do-artigo</i>/`;
        $('#endereco-dica').textContent = it.slugManual ? 'Endereço escolhido por você.' : 'Criado sozinho a partir do título.';
        $('#p-t').textContent = $('#titulo').value || 'Título do artigo';
        const h = editor ? editor.getHTML() : it.html;
        const pal = editor ? editor.storage.characterCount.words() : contaPalavras(textoDeHtml(h));
        $('#p-data').textContent = `${dataBR($('#data').value)} · ${minutos(pal)} min de leitura`;
        $('#p-d').textContent = $('#resumo-manual').checked && $('#resumo').value.trim() ? $('#resumo').value.trim() : corta(primeiroParagrafo(h), 200) || 'O resumo aparece aqui quando você começar a escrever.';
        $('#contagem').textContent = pal ? `${pal.toLocaleString('pt-BR')} palavras · cerca de ${minutos(pal)} min de leitura` : '';
      };

      const coleta = () => {
        it.titulo = $('#titulo').value.trim();
        it.linha = $('#linha').value.trim();
        if (editor) it.html = editor.isEmpty ? '' : editor.getHTML();
        it.data = $('#data').value || hoje();
        it.resumoManual = $('#resumo-manual').checked;
        it.desc = it.resumoManual ? $('#resumo').value.trim() : '';
      };
      const hora = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const salvaAgora = () => {
        clearTimeout(timer); timer = null;
        coleta();
        if (it.id === null) {
          if (!it.titulo && !it.html) return; // nada escrito ainda
          it.id = nextId++;
          items.push(it);
          history.replaceState(null, '', '#editar/' + it.id);
        }
        $('#salvo').textContent = `${it.ativo ? 'Alterações guardadas' : 'Rascunho salvo'} às ${hora()}${it.ativo ? '. Clique em “Atualizar no site” para o público ver.' : '.'}`;
        $('#salvo').classList.remove('pendente');
      };
      salvarPendente = () => { if (timer) salvaAgora(); };
      const mudou = () => {
        atualizaLado();
        $('#salvo').textContent = 'Salvando…';
        $('#salvo').classList.add('pendente');
        clearTimeout(timer);
        timer = setTimeout(salvaAgora, 1200);
      };
      $('#titulo').addEventListener('input', mudou);
      $('#linha').addEventListener('input', mudou);
      $('#data').addEventListener('change', mudou);
      $('#resumo').addEventListener('input', mudou);
      $('#resumo-manual').addEventListener('change', e => {
        $('#resumo-box').hidden = !e.target.checked;
        $('#resumo-dica').textContent = e.target.checked ? '' : 'O resumo é feito sozinho com o começo do texto.';
        if (e.target.checked && !$('#resumo').value.trim()) $('#resumo').value = corta(primeiroParagrafo(editor ? editor.getHTML() : it.html), 200);
        if (e.target.checked) $('#resumo').focus();
        mudou();
      });
      $('#slug').addEventListener('input', e => { it.slugManual = true; it.slug = slugify(e.target.value.replace(/\s/g, '-')) || ''; mudou(); });
      $('#slug').addEventListener('blur', e => (e.target.value = it.slug));
      $('#slug-auto').addEventListener('click', () => { it.slugManual = false; mudou(); });
      $('#capa').addEventListener('change', async e => {
        const f = e.target.files[0];
        if (!f) return;
        try {
          it.img = await preparaImagem(f, 1200);
          $('#capa-txt').innerHTML = `<img src="${it.img}" alt="Capa escolhida">`;
          $('#p-img').innerHTML = `<img src="${it.img}" alt="">`;
          mudou();
        } catch (x) { toast(x.message); }
      });
      atualizaLado();

      const publicar = () => {
        salvaAgora();
        if (!it.titulo) { toast('Falta o título do artigo.'); $('#titulo').focus(); return; }
        if (!editor || editor.isEmpty) { toast('O artigo ainda está sem texto.'); editor && editor.commands.focus(); return; }
        const era = it.ativo;
        it.ativo = true;
        toast((era ? 'Artigo atualizado no site: ' : 'Publicado! O artigo já está no site: ') + `${SITE}/${it.slug}/` + DEMO);
        go('lista/artigo');
      };
      $('#publicar').addEventListener('click', publicar);
      const desp = $('#despublicar');
      if (desp) desp.addEventListener('click', () => { salvaAgora(); it.ativo = false; toast('O artigo saiu do site e voltou a ser rascunho.' + DEMO); route(); });
      $('#ver').addEventListener('click', () => { coleta(); previa(it); });

      carregaEditor().then(ME => {
        if (!app.contains($('#editor'))) return; // ela saiu da tela antes de carregar
        $('#editor').innerHTML = '';
        const toolbar = $('#toolbar'), bolha = $('#bolha');

        const pedeLink = async () => {
          const atual = editor.getAttributes('link').href || '';
          const vazio = editor.state.selection.empty && !atual;
          const campos = [{ rotulo: 'Endereço do link', valor: atual, ph: 'https://', url: true, dica: 'Copie o endereço na barra do navegador e cole aqui.', valida: v => (normalizaLink(v) ? '' : 'Isso não parece um endereço de internet.') }];
          if (vazio) campos.push({ rotulo: 'Texto que vai aparecer', ph: 'Ex.: veja o estudo completo', valida: v => (v.trim() ? '' : 'Escreva o texto do link.') });
          const r = await pergunta({ titulo: atual ? 'Editar link' : 'Inserir link', texto: vazio ? '' : 'O trecho selecionado vai virar um link.', campos, extra: atual ? 'Remover link' : null });
          if (!r) return editor.commands.focus();
          if (r.extra) return editor.chain().focus().extendMarkRange('link').unsetLink().run();
          const href = normalizaLink(r.vals[0]);
          if (vazio) editor.chain().focus().insertContent({ type: 'text', text: r.vals[1].trim(), marks: [{ type: 'link', attrs: { href } }] }).insertContent(' ').run();
          else editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
        };
        const pedeVideo = async () => {
          const r = await pergunta({
            titulo: 'Inserir vídeo do YouTube', ok: 'Inserir vídeo',
            campos: [{ rotulo: 'Endereço do vídeo', ph: 'https://www.youtube.com/watch?v=...', url: true, dica: 'Abra o vídeo no YouTube, copie o endereço lá em cima e cole aqui.', valida: v => (/(youtube\.com|youtu\.be)\//i.test(v) ? '' : 'Esse endereço não é de um vídeo do YouTube.') }],
          });
          if (!r) return editor.commands.focus();
          if (!editor.chain().focus().setYoutubeVideo({ src: normalizaLink(r.vals[0]) }).run()) toast('Não consegui reconhecer esse vídeo. Confira o endereço.');
        };
        const insereImagens = async (files, pos) => {
          for (const f of files) {
            try {
              const src = await preparaImagem(f);
              const ch = editor.chain().focus();
              if (typeof pos === 'number') ch.insertContentAt(pos, { type: 'figure', attrs: { src } }).run();
              else ch.setFigure({ src }).run();
            } catch (x) { toast(x.message); }
          }
          toast('Imagem inserida. Clique embaixo dela para escrever uma legenda.');
        };

        editor = ME.create({
          element: $('#editor'),
          content: it.html || '',
          bubble: bolha,
          onUpdate: mudou,
          onSelection: () => marca(),
          onImageFiles: insereImagens,
          onLinkShortcut: pedeLink,
        });
        editorAtual = editor;

        const executa = cmd => {
          const c = editor.chain().focus();
          ({
            undo: () => c.undo().run(), redo: () => c.redo().run(),
            bold: () => c.toggleBold().run(), italic: () => c.toggleItalic().run(),
            bulletList: () => c.toggleBulletList().run(), orderedList: () => c.toggleOrderedList().run(),
            blockquote: () => c.toggleBlockquote().run(), hr: () => c.setHorizontalRule().run(),
            h2: () => c.toggleHeading({ level: 2 }).run(),
            link: pedeLink, youtube: pedeVideo,
            image: () => $('#img-texto').click(),
          })[cmd]();
        };
        const clique = e => { const b = e.target.closest('button[data-cmd]'); if (b) { e.preventDefault(); executa(b.dataset.cmd); } };
        toolbar.addEventListener('click', clique);
        bolha.addEventListener('mousedown', e => e.preventDefault()); // não perde a seleção ao clicar
        bolha.addEventListener('click', clique);
        $('#img-texto').addEventListener('change', e => { insereImagens([...e.target.files]); e.target.value = ''; });
        $('#estilo').addEventListener('change', e => {
          const v = e.target.value, c = editor.chain().focus();
          (v === 'p' ? c.setParagraph() : c.setHeading({ level: Number(v[1]) })).run();
        });

        // Botões acesos conforme onde o cursor está, como no Word.
        function marca() {
          const ativo = { bold: 'bold', italic: 'italic', link: 'link', bulletList: 'bulletList', orderedList: 'orderedList', blockquote: 'blockquote' };
          app.querySelectorAll('[data-cmd]').forEach(b => {
            const k = b.dataset.cmd;
            if (ativo[k]) b.setAttribute('aria-pressed', String(editor.isActive(ativo[k])));
            else if (k === 'h2') b.setAttribute('aria-pressed', String(editor.isActive('heading', { level: 2 })));
          });
          $('#estilo').value = editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : 'p';
          $('[data-cmd=undo]').disabled = !editor.can().undo();
          $('[data-cmd=redo]').disabled = !editor.can().redo();
        }
        marca();
        atualizaLado();
        if (novo) $('#titulo').focus();
      }).catch(() => { $('#editor').innerHTML = '<p class="error">Não consegui abrir o editor. Confira a internet e recarregue a página.</p>'; });
    },
  };

  // Prévia da página do artigo, no visual do site.
  function previa(it) {
    const volta = document.activeElement;
    const pal = contaPalavras(textoDeHtml(it.html));
    const m = document.createElement('div');
    m.className = 'previa';
    m.innerHTML = `<div class="previa-barra"><span>Prévia: é assim que o artigo aparece em <b>${SITE}/${esc(it.slug || 'o-titulo-do-artigo')}/</b></span><button class="btn small" type="button" data-fecha>Voltar a editar</button></div>
      <article class="pagina-artigo" role="dialog" aria-modal="true" aria-label="Prévia do artigo" tabindex="-1">
        <a class="volta-blog">Voltar ao blog</a>
        <p class="p-data">${dataBR(it.data)} · ${minutos(pal)} min de leitura</p>
        <h1>${esc(it.titulo || 'Título do artigo')}</h1>
        ${it.linha ? `<p class="linha">${esc(it.linha)}</p>` : ''}
        ${it.img ? `<img class="capa" src="${esc(it.img)}" alt="">` : ''}
        <div class="artigo-texto">${it.html || '<p><i>O texto do artigo aparece aqui.</i></p>'}</div>
        <div class="assinatura"><p class="sign">Marínea Maria Fediuk</p><p>Psicóloga Mestre · CRP 12/01526<br>Atendimento presencial em Joinville, SC, e online.</p><span class="go">Conversar pelo WhatsApp</span></div>
      </article>`;
    document.body.appendChild(m);
    document.body.style.overflow = 'hidden';
    const fecha = () => { m.remove(); document.body.style.overflow = ''; if (volta) volta.focus(); };
    m.querySelector('[data-fecha]').focus();
    m.addEventListener('click', e => { if (e.target.closest('[data-fecha]')) fecha(); else if (e.target.closest('a')) e.preventDefault(); });
    m.addEventListener('keydown', e => { if (e.key === 'Escape') fecha(); });
  }

  const go = h => { location.hash = '#' + h; };
  function route() {
    if (editorAtual) { editorAtual.destroy(); editorAtual = null; }
    salvarPendente = null;
    const [r, a] = location.hash.slice(1).split('/');
    if (!logged) return views.login();
    if (r === 'lista' && TIPOS[a]) views.lista(a);
    else if (r === 'novo' && a === 'artigo') views.artigo();
    else if (r === 'novo' && TIPOS[a]) views.form(a);
    else if (r === 'editar') {
      const it = items.find(i => i.id === Number(a));
      if (!it) views.inicio(); else if (it.tipo === 'artigo') views.artigo(it.id); else views.form(it.tipo, it.id);
    } else views.inicio();
    window.scrollTo(0, 0);
    const h = document.querySelector('#conteudo h1');
    if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  }

  app.addEventListener('submit', e => {
    if (e.target.id !== 'login') return;
    e.preventDefault();
    logged = true; // protótipo: qualquer entrada, até vazia, abre o painel
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

  // Salva o que estiver pendente antes de sair da tela do artigo.
  window.addEventListener('hashchange', () => { if (salvarPendente) salvarPendente(); route(); });
  route();
})();
