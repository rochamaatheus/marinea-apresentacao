# Psicóloga Marínea Fediuk: novo site

Apresentação da Agência Kamino do novo site da Psicóloga Marínea Maria Fediuk (CRP 12/01526), a partir do modelo 3 aprovado pela cliente.

- `index.html`: design final da página inicial (paleta, fontes e fotos da cliente).
- `wireframe/index.html`: o mesmo modelo 3 em wireframe (estrutura em cinza).
- `wireframe/mentoria-dona-de-si.html`: estrutura da página da mentoria.
- `ideias/`: endereços antigos, que redirecionam para o wireframe.

A barra no rodapé da tela alterna entre wireframe e design final e mantém a seção que está sendo vista.

Site estático publicado pelo GitHub Pages. As páginas têm `noindex, nofollow` e não aparecem em buscadores. Os botões de WhatsApp e de compra são demonstrativos. Este repositório contém apenas a versão publicada; a fonte editável fica no projeto local da Kamino.

## Painel: editor de artigos

- Os artigos são escritos no próprio painel (`painel/`), com editor de texto [Tiptap 3](https://tiptap.dev) (MIT, sobre o ProseMirror). Ele aceita texto colado do Word e do Google Docs e descarta estilos, scripts e links `javascript:`.
- O endereço do artigo, o tempo de leitura e o resumo do card são criados sozinhos. O campo de link existe só em Produtos e Materiais, com explicação e reconhecimento automático (Amazon, Hotmart, YouTube, PDF etc.).
- `assets/editor.js` é gerado a partir de `tools/editor/` (`npm install && npm run build`) e só é baixado quando um artigo é aberto.
- `assets/artigo-exemplo.js` traz o artigo de 2 jul. 2026 do blog, importado do WordPress e organizado com subtítulos.
