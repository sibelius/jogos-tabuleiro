// Contadores de Histórias — as cartas (dados + desenho em SVG).
// Serve para o servidor (require → tags para os robôs) e para o navegador (window.HISTORIAS_CARTAS).
// Cada carta: [paleta, chão, enfeite, 'emoji x y tamanho [giro] [opacidade] | ...', 'tags'].
// Coordenadas num quadro de 100 x 140. x negativo = emoji espelhado (na posição |x|).
(function (raiz) {
  const PALETAS = {
    noite: ['#0b1a4a', '#3b2a7a', '#8a5bb8', '#241a4f'],
    aurora: ['#0a2a43', '#1f7a7a', '#8ef0c8', '#12384a'],
    poente: ['#2b1055', '#d54b6a', '#ffb36b', '#5a2a4f'],
    manha: ['#8fd3ff', '#c9ecff', '#fff4d6', '#7ccf6b'],
    mar: ['#1d4e89', '#3fa7d6', '#b8f2ff', '#2f6f9f'],
    floresta: ['#1b3a2a', '#3f7d4f', '#bfe6a8', '#2b5e36'],
    deserto: ['#f79d5c', '#fbc57a', '#ffe8b0', '#e0a458'],
    doce: ['#ff9ec7', '#ffc8dd', '#fff0f6', '#ffafcc'],
    tempestade: ['#2d3142', '#4f5d75', '#9aa5b8', '#3a4152'],
    espaco: ['#05030f', '#1a0b3b', '#3e1f7a', '#2a2140'],
    neve: ['#a9c9ff', '#dbe9ff', '#ffffff', '#eef5ff'],
    lavanda: ['#6a4c93', '#b392ea', '#f1e3ff', '#9d7fd6'],
    fogo: ['#3d0c02', '#b3261e', '#ff9f1c', '#4a1a0a'],
    neblina: ['#5f6f7a', '#a6b8c2', '#e3ecef', '#7d8e97'],
    ouro: ['#7a4b00', '#e0a100', '#fff1a8', '#c98f00'],
    fundo: ['#021b33', '#06466b', '#0f7fa8', '#0a3550'],
  };

  const DADOS = [
    ['noite', 'colinas', 'estrelas', '🐋 50 52 40 -12|🏰 50 100 32|🌙 82 18 16', 'baleia voar sonho noite castelo impossível'],
    ['manha', 'nuvens', 'brilhos', '☁️ 50 104 64|🦊 44 84 26|📖 62 90 16 -12', 'raposa ler livro nuvem calma história'],
    ['manha', 'grama', 'brilhos', '🌳 50 70 66|🔑 34 52 12 25|🔑 64 44 12 -20|🔑 56 68 10 40', 'chave árvore segredo crescer natureza'],
    ['fundo', 'mar', 'bolhas', '🐙 50 96 34|🎻 28 70 18 -30|🎵 72 50 14|🎶 60 28 12', 'polvo música mar tocar alegria'],
    ['espaco', 'lua', 'estrelas', '🧒 40 100 24|🎈 26 62 18|🪐 70 38 34 -15', 'criança espaço sonho sozinho balão planeta'],
    ['tempestade', 'mar', 'chuva', '🌀 50 40 44|⚡ 22 30 18 15|⛵ 50 100 28 -10', 'tempestade barco perigo coragem mar'],
    ['lavanda', 'colinas', 'brilhos', '🌈 50 42 64|🐌 50 102 28|🏠 54 84 14', 'caracol casa lar devagar arco-íris paciência'],
    ['deserto', 'duna', 'nenhum', '☀️ 72 30 30|⏳ 62 86 32|🐫 -26 104 26', 'deserto tempo viagem calor espera'],
    ['neve', 'neve', 'neve', '❄️ 80 22 14|🐧 34 104 24|🐧 -62 106 20|☕ 48 116 10', 'pinguim frio amizade inverno aconchego'],
    ['floresta', 'grama', 'vagalumes', '🍄 50 88 52|🐭 72 112 14|🕯️ 34 110 10', 'cogumelo casa floresta pequeno magia rato'],
    ['fundo', 'pedras', 'bolhas', '🏰 50 104 34|🐠 24 52 16|🐠 -76 38 12|🧜‍♀️ 62 72 26 -10', 'sereia mar castelo fundo segredo reino'],
    ['noite', 'telhados', 'estrelas', '🌕 50 44 54 0 0.9|🐈‍⬛ 50 102 22', 'gato noite lua solidão observar'],
    ['aurora', 'neve', 'estrelas', '✨ 50 34 22|🦌 44 100 30', 'aurora rena frio magia silêncio'],
    ['doce', 'nuvens', 'brilhos', '🎈 76 30 16|🎈 24 36 14 -10|🎂 50 102 40|🐘 50 66 26', 'festa aniversário doce elefante alegria impossível'],
    ['manha', 'agua', 'brilhos', '🪷 30 112 14|🐸 52 102 26|👑 52 86 14 -8', 'sapo príncipe coroa lago conto magia'],
    ['fogo', 'pedras', 'nenhum', '🐉 -54 58 50|🥚 30 110 16|🔥 72 108 16', 'dragão fogo perigo cuidar ovo mãe'],
    ['neblina', 'colinas', 'nenhum', '☁️ 24 60 34 0 0.7|🚪 50 90 40|👣 50 122 12', 'porta mistério escolha neblina caminho desconhecido'],
    ['ouro', 'grama', 'brilhos', '🌻 50 84 52|🐝 28 48 16 -15|🍯 74 112 16', 'abelha flor verão trabalho doce sol'],
    ['espaco', 'nenhum', 'estrelas', '⭐ 80 24 14|🌍 22 116 40|🚀 54 66 40 -30', 'foguete espaço viagem aventura longe'],
    ['mar', 'ilha', 'nenhum', '☀️ 80 24 22|🌴 56 88 36|🍾 26 116 12 70', 'ilha sozinho mensagem praia saudade'],
    ['lavanda', 'nuvens', 'brilhos', '🌈 50 30 52|🦄 50 76 40', 'unicórnio magia fantasia arco-íris sonho'],
    ['noite', 'grama', 'vagalumes', '🌲 20 88 52|🦉 54 62 28|📜 64 100 16 10', 'coruja sabedoria noite silêncio saber'],
    ['tempestade', 'telhados', 'chuva', '☂️ 50 70 46|🐱 50 104 20', 'chuva gato abrigo proteção cuidar'],
    ['manha', 'colinas', 'nenhum', '🪁 72 28 26 20|🧒 34 102 22|🐕 52 110 16', 'pipa vento brincar liberdade infância cachorro'],
    ['fundo', 'nenhum', 'bolhas', '🐳 50 56 56|🔦 28 104 14 -30|🐡 74 104 14', 'fundo escuro mar gigante explorar'],
    ['poente', 'mar', 'nenhum', '💕 51 68 16|🦩 40 96 36|🦩 -62 98 32', 'amor par flamingo pôr-do-sol romance dança'],
    ['floresta', 'grama', 'nenhum', '🐻 50 92 38|🍯 74 108 16|🐝 70 70 10', 'urso mel gula doce floresta'],
    ['noite', 'agua', 'estrelas', '🌙 50 30 22|🛶 50 106 28|🏮 38 96 12', 'lago noite calma viagem lanterna reflexo'],
    ['espaco', 'nenhum', 'estrelas', '🌕 68 96 46|🐄 38 48 28 -25', 'vaca pular lua impossível risada'],
    ['ouro', 'nenhum', 'brilhos', '👑 50 56 44|💎 30 104 18|💰 70 104 20', 'tesouro riqueza rei ouro ganância'],
    ['neve', 'neve', 'nenhum', '☀️ 80 24 24|⛄ 50 94 44|💧 66 116 8', 'derreter tempo fim calor triste boneco-de-neve'],
    ['doce', 'grama', 'brilhos', '🌷 20 112 14|🐇 40 102 26|🥕 66 104 20 -30', 'coelho primavera fome jardim comida'],
    ['fogo', 'nenhum', 'nenhum', '🌋 50 100 62|🦖 -24 118 20', 'vulcão dinossauro antigo perigo explosão passado'],
    ['lavanda', 'agua', 'brilhos', '🪞 50 56 34|🦢 50 104 28', 'reflexo espelho vaidade cisne calma'],
    ['manha', 'nuvens', 'nenhum', '🏰 50 84 42|☁️ 28 108 30|☁️ 72 110 30', 'castelo nuvem céu reino sonho alto'],
    ['noite', 'colinas', 'estrelas', '☄️ 70 30 22 -20|🔭 38 100 26|🧒 20 108 16', 'estrela desejo observar noite esperança'],
    ['aurora', 'mar', 'estrelas', '🧊 50 114 30|🐻‍❄️ 50 98 26', 'gelo sozinho mudança frio perdido'],
    ['tempestade', 'pedras', 'chuva', '⚡ 80 28 16|🕯️ 50 78 42|🚢 20 108 16', 'luz esperança guia tempestade farol'],
    ['floresta', 'grama', 'vagalumes', '🧚 50 54 26|🍃 30 80 14 30|🌸 70 104 16', 'fada magia pequeno natureza voar'],
    ['deserto', 'duna', 'nenhum', '🦅 70 34 18 -10|🌵 30 94 36|🐍 62 114 16', 'deserto sede calor solidão'],
    ['manha', 'grama', 'brilhos', '🎈 76 38 14|🎪 50 86 46|🤹 24 112 14', 'circo festa alegria show espetáculo'],
    ['noite', 'telhados', 'nenhum', '🦇 28 38 16|👻 72 58 22 10|🏚️ 50 96 38', 'medo assombrado fantasma noite susto casa'],
    ['doce', 'nuvens', 'brilhos', '🍭 30 88 32 -10|🍬 72 96 18 20|🧁 52 104 22', 'doce guloseima alegria infância festa'],
    ['mar', 'ilha', 'nenhum', '🌊 82 86 22|🐢 50 106 28|🥚 30 116 10', 'tartaruga nascer praia começo viagem'],
    ['espaco', 'grama', 'estrelas', '🛸 50 38 40|👽 70 76 18|🐄 46 104 20', 'alienígena mistério óvni estranho vaca'],
    ['neblina', 'colinas', 'nenhum', '☁️ 26 100 30 0 0.6|🕰️ 50 66 44 -10|🍂 72 110 14', 'relógio tempo passado esquecer saudade antigo'],
    ['noite', 'pedras', 'estrelas', '🌕 72 32 30|🐺 -40 94 32', 'lobo lua uivar noite selvagem'],
    ['lavanda', 'nenhum', 'brilhos', '🎭 50 60 46|🌹 50 104 20 20', 'teatro máscara fingir segredo emoção'],
    ['manha', 'agua', 'nenhum', '🦆 28 104 22|🦆 50 106 17|🦆 68 108 13', 'família fila seguir pequeno lago'],
    ['tempestade', 'neve', 'neve', '🏔️ 50 84 64|🧗 44 62 16', 'montanha desafio subir coragem alto frio'],
    ['ouro', 'colinas', 'nenhum', '☀️ 50 40 30|🌾 24 98 34|🌾 76 100 34|🐓 50 106 24', 'fazenda manhã acordar trabalho campo'],
    ['fundo', 'pedras', 'bolhas', '🦀 50 112 22|🐚 28 114 14|🗝️ 74 116 14 20', 'segredo praia caranguejo tesouro escondido'],
    ['doce', 'colinas', 'brilhos', '🕊️ 72 32 22|💌 48 62 40 -8', 'carta amor mensagem paz saudade'],
    ['noite', 'pedras', 'vagalumes', '🌲 18 88 30|🌲 82 86 28|🏕️ 50 96 40|🔥 50 118 14', 'acampar história fogueira amigos aventura'],
    ['fogo', 'nenhum', 'brilhos', '🌞 50 52 60|🦋 50 110 20 -10', 'borboleta sol coragem sonho perigo'],
    ['manha', 'nenhum', 'nuvens', '🎈 50 38 44|🏠 50 90 30', 'casa balão voar aventura liberdade viagem'],
    ['neve', 'neve', 'neve', '🛷 52 104 26 -10|🐕 30 102 18', 'trenó brincar inverno velocidade diversão'],
    ['aurora', 'agua', 'estrelas', '🌙 80 24 16|🐬 50 70 36 -20', 'golfinho pular noite alegria mar liberdade'],
    ['lavanda', 'nuvens', 'estrelas', '🐑 30 48 18|🐑 54 36 16|💤 72 62 18|🛏️ 50 102 36', 'sono dormir sonho carneiro noite contar'],
    ['poente', 'colinas', 'nenhum', '💨 18 82 18|🚂 52 100 36', 'trem viagem partida saudade caminho'],
    ['floresta', 'grama', 'brilhos', '🦋 64 56 28 10|🐛 38 108 18', 'mudança crescer borboleta transformação natureza'],
    ['mar', 'mar', 'nenhum', '🌊 50 60 56|🏄 50 92 30', 'onda surfe coragem mar aventura'],
    ['espaco', 'lua', 'estrelas', '🌍 24 30 22|🧑‍🚀 50 92 30|🚩 72 104 16', 'astronauta conquista lua longe saudade'],
    ['ouro', 'nenhum', 'brilhos', '⭐ 24 34 14 -15|⭐ 76 40 14 15|🏆 50 72 46', 'vitória prêmio orgulho campeão'],
    ['neblina', 'agua', 'nenhum', '☁️ 50 26 50|🪜 50 78 44', 'subir escada céu desafio sonho'],
    ['tempestade', 'telhados', 'chuva', '💧 32 52 10|🧍 50 104 26', 'triste chuva sozinho lágrima'],
    ['doce', 'grama', 'brilhos', '💞 50 74 14|🐶 34 102 24|🐱 -64 102 22', 'amizade amigos carinho diferentes'],
    ['noite', 'nenhum', 'estrelas', '🌙 80 20 14|🎠 50 86 52', 'carrossel girar noite infância lembrança parque'],
    ['manha', 'colinas', 'nenhum', '🏁 86 88 16|🐇 70 100 24|🐢 30 106 20', 'corrida lento rápido paciência vencer'],
    ['floresta', 'pedras', 'nenhum', '🏛️ 50 90 46|🌿 22 108 18|🐍 74 112 14', 'ruína antigo esquecido passado explorar'],
    ['fundo', 'nenhum', 'bolhas', '🐙 50 56 30|🎁 50 96 30', 'presente surpresa fundo mar curiosidade'],
    ['lavanda', 'colinas', 'brilhos', '🧙 44 94 32|🪄 70 70 18 -30|✨ 80 54 12', 'magia mago feitiço varinha poder'],
    ['poente', 'mar', 'nenhum', '⚓ 50 90 36|🐚 28 116 12', 'âncora parar ficar mar porto espera'],
    ['aurora', 'neve', 'estrelas', '🌨️ 70 30 20|🛖 50 98 34', 'cabana abrigo inverno aconchego lar'],
    ['espaco', 'nenhum', 'estrelas', '🪐 28 30 20|🐱 52 70 30 20|☄️ 78 100 18', 'gato espaço flutuar curiosidade sonho'],
    ['noite', 'agua', 'estrelas', '🏮 30 62 14|🏮 58 42 12|🏮 80 72 10', 'lanterna desejo luz noite celebração'],
    ['fogo', 'pedras', 'brilhos', '🎸 50 66 46 -20|🔥 50 112 20', 'rock música barulho energia fogo'],
    ['manha', 'grama', 'brilhos', '🧺 50 106 24|🍉 28 114 14|🐜 72 116 10', 'piquenique família verão comida alegria'],
    ['neblina', 'pedras', 'nenhum', '🐅 60 68 48 0 0.3|🐈 40 108 20', 'gato sombra grande coragem imaginação'],
    ['ouro', 'colinas', 'nenhum', '📚 50 100 30|📚 50 80 28 4|📚 50 60 26 -4|🐛 52 44 12', 'livro saber estudar ler escola'],
    ['doce', 'nuvens', 'brilhos', '👸 36 94 30|🐉 -70 54 30', 'princesa dragão amizade conto coragem'],
    ['tempestade', 'mar', 'chuva', '🚢 50 70 22|🦑 50 104 40', 'monstro gigante mar medo lenda'],
    ['lavanda', 'agua', 'brilhos', '🎐 50 48 30|🍃 30 90 12 -20|🍃 70 80 12 30', 'vento som calma paz leve'],
    ['neblina', 'nenhum', 'nenhum', '🗺️ 50 62 38 -10|🧭 30 104 20|❌ 70 74 10', 'mapa aventura tesouro explorar caminho'],
    ['poente', 'duna', 'estrelas', '🧞 50 60 38|🪔 50 102 20', 'gênio desejo magia lâmpada poder'],
    ['manha', 'agua', 'brilhos', '🐟 -30 88 14|🎣 68 70 34 -10|👢 42 110 14', 'pescar surpresa paciência lago risada'],
    ['doce', 'colinas', 'nuvens', '🐖 50 60 30 -10|🪽 34 54 16|🪽 -66 54 16', 'porco voar impossível sonho risada'],
    ['floresta', 'grama', 'vagalumes', '🏡 50 96 36|🌳 18 88 36|💡 50 76 10', 'casa lar família aconchego noite'],
  ];

  function parseEls(s) {
    return s.split('|').map(p => {
      const [e, x, y, t, r, o] = p.trim().split(/\s+/);
      return { e, x: Math.abs(+x), y: +y, s: +t, r: +(r || 0), o: +(o || 1), flip: +x < 0 };
    });
  }

  const CARTAS = DADOS.map(([paleta, chao, enfeite, els, tags], id) => ({ id, paleta, chao, enfeite, els: parseEls(els), tags: tags.split(' ') }));

  // ----- desenho -----
  function rng(seed) {
    let a = seed * 2654435761 >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  let seq = 0;

  function chao(tipo, pal, r, uid) {
    const cor = pal[3];
    switch (tipo) {
      case 'colinas': return `<path d="M0 ${104 + r() * 6} Q 25 ${90 + r() * 8} 50 ${104} T 100 ${100 + r() * 6} L100 140 L0 140Z" fill="${cor}" opacity=".75"/>
        <path d="M0 ${116} Q 30 ${104 + r() * 6} 60 ${116} T 100 ${112} L100 140 L0 140Z" fill="${cor}"/>`;
      case 'grama': return `<rect x="0" y="112" width="100" height="28" fill="${cor}"/><path d="M0 112 Q 50 106 100 112Z" fill="${cor}"/>` +
        Array.from({ length: 7 }, () => { const x = r() * 96 + 2, y = 116 + r() * 20; return `<path d="M${x} ${y} l1.5 -4 l1.5 4 M${x + 3} ${y} l1.5 -3" stroke="rgba(255,255,255,.35)" stroke-width="1" fill="none"/>`; }).join('');
      case 'mar': return `<rect x="0" y="108" width="100" height="32" fill="#2a7fc1"/>` +
        [108, 116, 124, 132].map((y, i) => `<path d="M0 ${y} q 6.25 -4 12.5 0 t 12.5 0 t 12.5 0 t 12.5 0 t 12.5 0 t 12.5 0 t 12.5 0 t 12.5 0" fill="none" stroke="rgba(255,255,255,${.55 - i * .1})" stroke-width="1.4" transform="translate(${-r() * 12} 0)"/>`).join('');
      case 'duna': return `<path d="M0 110 Q 30 96 60 110 T 100 106 L100 140 L0 140Z" fill="#f2b766"/><path d="M0 122 Q 40 110 70 124 T 100 120 L100 140 L0 140Z" fill="#e39a4a"/>`;
      case 'nuvens': return Array.from({ length: 8 }, (_, i) => `<circle cx="${i * 14 + r() * 6}" cy="${126 + r() * 8}" r="${12 + r() * 6}" fill="white" opacity=".9"/>`).join('') + `<rect x="0" y="130" width="100" height="10" fill="white" opacity=".9"/>`;
      case 'ilha': return `<rect x="0" y="112" width="100" height="28" fill="#2a8fc9"/><ellipse cx="50" cy="114" rx="36" ry="7" fill="#f7d78b"/>` +
        `<path d="M0 124 q 6 -3 12 0 t 12 0 t 12 0 t 12 0 t 12 0 t 12 0 t 12 0 t 12 0 t 12 0" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.2"/>`;
      case 'neve': return `<path d="M0 106 Q 30 94 55 108 T 100 102 L100 140 L0 140Z" fill="#f4f9ff"/><path d="M0 120 Q 40 110 70 122 T 100 118 L100 140 L0 140Z" fill="#dfeaf8"/>`;
      case 'lua': return `<path d="M0 108 Q 50 96 100 108 L100 140 L0 140Z" fill="#b9b6c9"/>` +
        Array.from({ length: 5 }, () => `<ellipse cx="${r() * 90 + 5}" cy="${114 + r() * 22}" rx="${3 + r() * 5}" ry="${1.5 + r() * 2}" fill="#8e8aa3"/>`).join('');
      case 'agua': return `<rect x="0" y="112" width="100" height="28" fill="url(#${uid}a)"/>` +
        Array.from({ length: 6 }, () => { const x = r() * 80 + 5, y = 116 + r() * 20; return `<line x1="${x}" y1="${y}" x2="${x + 6 + r() * 10}" y2="${y}" stroke="rgba(255,255,255,.45)" stroke-width="1"/>`; }).join('');
      case 'telhados': {
        let d = 'M0 140 L0 118', x = 0;
        while (x < 100) { const w = 10 + r() * 12, h = 104 + r() * 12; d += ` L${x} ${h} L${x + w / 2} ${h - 6} L${x + w} ${h}`; x += w; }
        return `<path d="${d} L100 140Z" fill="${cor}" opacity=".95"/>` +
          Array.from({ length: 4 }, () => `<rect x="${r() * 90 + 3}" y="${120 + r() * 14}" width="3" height="3.5" fill="#ffe28a" opacity=".85"/>`).join('');
      }
      case 'pedras': return `<path d="M0 118 L12 110 L22 116 L34 106 L48 114 L60 108 L74 116 L86 106 L100 112 L100 140 L0 140Z" fill="${cor}"/>` +
        `<path d="M0 128 L18 122 L40 128 L62 120 L84 128 L100 124 L100 140 L0 140Z" fill="rgba(0,0,0,.18)"/>`;
      default: return '';
    }
  }

  function enfeite(tipo, r) {
    const n = { estrelas: 22, bolhas: 12, neve: 22, brilhos: 10, chuva: 26, vagalumes: 12, nuvens: 4 }[tipo] || 0;
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = r() * 100, y = r() * (tipo === 'chuva' || tipo === 'neve' ? 130 : 95);
      if (tipo === 'estrelas') s += `<circle cx="${x}" cy="${y}" r="${.3 + r() * .9}" fill="white" opacity="${.4 + r() * .6}"/>`;
      else if (tipo === 'bolhas') s += `<circle cx="${x}" cy="${y + 20}" r="${1 + r() * 2.5}" fill="none" stroke="rgba(255,255,255,.6)" stroke-width=".6"/>`;
      else if (tipo === 'neve') s += `<circle cx="${x}" cy="${y}" r="${.5 + r() * 1}" fill="white" opacity=".9"/>`;
      else if (tipo === 'brilhos') s += `<path d="M${x} ${y - 2.5} L${x + .7} ${y - .7} L${x + 2.5} ${y} L${x + .7} ${y + .7} L${x} ${y + 2.5} L${x - .7} ${y + .7} L${x - 2.5} ${y} L${x - .7} ${y - .7}Z" fill="white" opacity="${.5 + r() * .5}"/>`;
      else if (tipo === 'chuva') s += `<line x1="${x}" y1="${y}" x2="${x - 2}" y2="${y + 6}" stroke="rgba(220,235,255,.55)" stroke-width=".6"/>`;
      else if (tipo === 'vagalumes') s += `<circle cx="${x}" cy="${y + 30}" r="${.8 + r()}" fill="#fff59d" opacity=".9"/>`;
      else if (tipo === 'nuvens') { const w = 14 + r() * 10; s += `<g opacity=".85" fill="white"><ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w / 3}"/><ellipse cx="${x + w / 3}" cy="${y - w / 5}" rx="${w / 2}" ry="${w / 3}"/></g>`; }
    }
    return s;
  }

  function svg(id) {
    const c = CARTAS[id];
    if (!c) return '';
    const pal = PALETAS[c.paleta];
    const r = rng(id + 7);
    const uid = 'hc' + id + '_' + (++seq);
    const gx = 15 + r() * 70, gy = 15 + r() * 50;
    const els = c.els.map(el => {
      const flip = el.flip, s = el.s;
      const t = `translate(${el.x} ${el.y}) rotate(${el.r})${flip ? ' scale(-1 1)' : ''}`;
      return `<text transform="${t}" font-size="${s}" text-anchor="middle" dominant-baseline="central" opacity="${el.o}">${el.e}</text>`;
    }).join('');
    return `<svg class="hc-arte" viewBox="0 0 100 140" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${uid}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal[0]}"/><stop offset=".6" stop-color="${pal[1]}"/><stop offset="1" stop-color="${pal[2]}"/></linearGradient>
        <radialGradient id="${uid}r"><stop offset="0" stop-color="white" stop-opacity=".45"/><stop offset="1" stop-color="white" stop-opacity="0"/></radialGradient>
        <linearGradient id="${uid}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal[1]}"/><stop offset="1" stop-color="${pal[0]}"/></linearGradient>
        <radialGradient id="${uid}v"><stop offset=".6" stop-color="black" stop-opacity="0"/><stop offset="1" stop-color="black" stop-opacity=".35"/></radialGradient>
      </defs>
      <rect width="100" height="140" fill="url(#${uid}g)"/>
      <circle cx="${gx}" cy="${gy}" r="${30 + r() * 20}" fill="url(#${uid}r)"/>
      ${enfeite(c.enfeite, r)}
      ${chao(c.chao, pal, r, uid)}
      <g style="font-family:'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif">${els}</g>
      <rect width="100" height="140" fill="url(#${uid}v)"/>
    </svg>`;
  }

  const api = { CARTAS, PALETAS, svg };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.HISTORIAS_CARTAS = api;
})(typeof window !== 'undefined' ? window : this);
