// Editor de artigos do painel da Marínea.
// Base: Tiptap 3 (MIT, sobre o ProseMirror). Este arquivo vira assets/editor.js com `npm run build`.
// O esquema abaixo é a lista do que pode existir num artigo: tudo o que não está aqui
// (cores, fontes, scripts, estilos colados do Word) é descartado ao colar ou importar.
import { Editor, Node, Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Youtube from '@tiptap/extension-youtube';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import { Placeholder, CharacterCount } from '@tiptap/extensions';

// Só aceita imagens do próprio site, https ou recém-escolhidas no computador (blob:).
// Bloqueia data:, file: (imagem colada do Word que não existe na internet) e javascript:.
const safeSrc = src => {
  if (!src) return null;
  const s = src.trim();
  if (/^(https?:|blob:)/i.test(s) || /^(\.{0,2}\/)?[\w-]+(\/[\w.-]+)*\.(webp|jpe?g|png|gif|avif)$/i.test(s)) return s;
  return null;
};

// Imagem com legenda: <figure><img><figcaption>legenda</figcaption></figure>
const Figure = Node.create({
  name: 'figure',
  group: 'block',
  content: 'inline*',
  marks: 'italic',
  draggable: true,
  isolating: true,
  addAttributes() {
    return { src: { default: null }, alt: { default: '' } };
  },
  parseHTML() {
    const attrs = img => {
      const src = img && safeSrc(img.getAttribute('src'));
      return src ? { src, alt: img.getAttribute('alt') || '' } : false;
    };
    return [
      { tag: 'figure', contentElement: 'figcaption', getAttrs: el => attrs(el.querySelector('img')) },
      { tag: 'img[src]', getAttrs: el => attrs(el) },
    ];
  },
  renderHTML({ node }) {
    return ['figure', {}, ['img', { src: node.attrs.src, alt: node.attrs.alt, loading: 'lazy' }], ['figcaption', 0]];
  },
  addCommands() {
    return {
      setFigure: ({ src, alt = '', caption = '' }) => ({ commands }) =>
        commands.insertContent({ type: this.name, attrs: { src, alt }, content: caption ? [{ type: 'text', text: caption }] : [] }),
    };
  },
});

// Limpa o que o Word, o Google Docs e o WordPress colocam junto ao copiar.
const limpaColagem = html =>
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<\/?o:p>/gi, '')
    .replace(/<meta[^>]*>/gi, '');

function create({ element, content, bubble, onUpdate, onSelection, onImageFiles, onLinkShortcut }) {
  const imagens = files => [...(files || [])].filter(f => /^image\//.test(f.type));
  const editor = new Editor({
    element,
    content,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        strike: false,
        underline: false,
        link: {
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          defaultProtocol: 'https',
          protocols: ['mailto'],
          isAllowedUri: (url, ctx) => /^(https?:|mailto:)/i.test(url) && ctx.defaultValidate(url),
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
      }),
      Figure,
      Youtube.configure({ nocookie: true, modestBranding: true, width: 640, height: 360 }),
      Placeholder.configure({
        includeChildren: true,
        placeholder: ({ node }) => (node.type.name === 'heading' ? 'Subtítulo' : 'Comece a escrever o artigo aqui. Pode colar do Word ou do Google Docs.'),
      }),
      CharacterCount,
      Extension.create({
        name: 'atalhosMarinea',
        addKeyboardShortcuts: () => ({ 'Mod-k': () => (onLinkShortcut && onLinkShortcut(), true) }),
      }),
      ...(bubble
        ? [BubbleMenu.configure({
            element: bubble,
            shouldShow: ({ editor: ed, state }) => !state.selection.empty && !ed.isActive('figure') && !ed.isActive('youtube'),
          })]
        : []),
    ],
    editorProps: {
      attributes: { class: 'artigo-texto', 'aria-label': 'Texto do artigo', 'aria-multiline': 'true', spellcheck: 'true', lang: 'pt-BR' },
      transformPastedHTML: limpaColagem,
      handlePaste: (view, event) => {
        const f = imagens(event.clipboardData && event.clipboardData.files);
        if (!f.length || !onImageFiles) return false;
        onImageFiles(f);
        return true;
      },
      handleDrop: (view, event, slice, moved) => {
        if (moved) return false;
        const f = imagens(event.dataTransfer && event.dataTransfer.files);
        if (!f.length || !onImageFiles) return false;
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
        onImageFiles(f, pos && pos.pos);
        return true;
      },
    },
    onUpdate: ({ editor: ed }) => onUpdate && onUpdate(ed),
    onSelectionUpdate: ({ editor: ed }) => onSelection && onSelection(ed),
    onTransaction: ({ editor: ed }) => onSelection && onSelection(ed),
  });
  return editor;
}

window.MarineaEditor = { create, safeSrc };
