// Contadores de Histórias — um conta uma dica, os outros escolhem cartas parecidas e todos tentam
// adivinhar qual era a carta de quem contou. (Inspirado no Dixit, com cartas próprias.)
const path = require('path');
const ARQ_CARTAS = path.join(__dirname, '..', 'public', 'games', 'historias-cartas.js');
delete require.cache[require.resolve(ARQ_CARTAS)];
const { CARTAS } = require(ARQ_CARTAS);

const MAO = 6, META = 30, MAX_DICA = 40;

// ----- comparar dicas com as tags das cartas -----
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const PARADAS = new Set('de da do das dos e o a os as um uma uns umas no na nos nas em com para pra pro que meu minha seu sua eu voce ele ela se por ao mais muito tudo quando como sem nao sim ou the'.split(' '));
const raiz = w => { w = w.replace(/(oes|aes|ns)$/, 'o').replace(/s$/, ''); return w.length > 5 ? w.slice(0, 5) : w; };

const GRUPOS = [
  'noite escuro escuridao lua estrela estrelas sono dormir madrugada luar',
  'mar oceano agua onda peixe baleia praia fundo azul navegar',
  'voar voo voando asa asas ceu nuvem passaro alto leve flutuar',
  'medo assustador susto escuro monstro sombra fantasma terror',
  'amor coracao carinho abraco amizade amigo amigos paixao romance',
  'triste tristeza solidao sozinho chorar lagrima saudade melancolia',
  'alegria feliz festa diversao risada rir brincar brincadeira engracado',
  'magia magico feitico bruxa bruxo mago encanto varinha fada genio',
  'tempo relogio hora antigo velho passado lembranca memoria esquecer',
  'segredo misterio chave escondido porta tesouro enigma',
  'viagem aventura caminho explorar longe jornada partida trem mapa',
  'natureza floresta arvore planta flor jardim mato verde',
  'frio gelo neve inverno congelado',
  'calor sol verao fogo quente deserto',
  'casa lar familia aconchego abrigo cabana',
  'musica cantar som danca dancar tocar melodia',
  'livro ler leitura historia conto saber estudar escola sabedoria',
  'comida doce bolo fome delicia guloseima mel',
  'espaco planeta foguete astronauta universo galaxia alien ovni',
  'crescer semente nascer comeco vida mudanca transformacao',
  'perigo cuidado desafio coragem heroi corajoso',
  'calma paz silencio tranquilo descanso sossego',
  'sonho sonhar imaginacao fantasia surreal estranho impossivel maluco',
  'rei rainha castelo princesa principe reino coroa',
  'chuva tempestade raio trovao vento',
  'gato gatinho felino',
  'cachorro cao cachorrinho',
  'liberdade livre fugir escapar solto',
  'esperanca luz brilho farol guia desejo',
  'perdido labirinto procurar buscar',
  'vitoria vencer ganhar premio campeao corrida',
  'riqueza ouro dinheiro tesouro ganancia',
  'pequeno pequenino mini',
  'gigante enorme grande',
];
const GRUPO_DE = {};
GRUPOS.forEach((g, i) => g.split(' ').forEach(w => { const r = raiz(w); (GRUPO_DE[r] = GRUPO_DE[r] || []).push(i); }));

const palavras = s => norm(s).split(' ').filter(w => w && !PARADAS.has(w)).map(raiz);
const gruposDe = r => GRUPO_DE[r] || [];
const TAGS = CARTAS.map(c => {
  const diretas = new Set(c.tags.flatMap(t => palavras(t.replace(/-/g, ' '))));
  const grupos = new Set([...diretas].flatMap(gruposDe));
  return { diretas, grupos };
});

function combina(dica, carta) {
  const t = TAGS[carta];
  if (!t) return 0;
  let s = 0;
  for (const w of palavras(dica)) {
    if (t.diretas.has(w)) s += 2;
    else if (gruposDe(w).some(g => t.grupos.has(g))) s += 1;
  }
  return s;
}

// ----- utilidades -----
const embaralhar = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sortear = a => a[Math.floor(Math.random() * a.length)];
const outros = e => [...Array(e.n).keys()].filter(i => i !== e.narrador);

function comprar(e) {
  for (let k = 0; k < MAO; k++) for (let i = 0; i < e.n; i++) {
    const p = (e.narrador + i) % e.n;
    if (e.maos[p].length < MAO && e.baralho.length) e.maos[p].push(e.baralho.pop());
  }
}

function novaRodada(e) {
  e.fase = 'contar';
  e.dica = '';
  e.jogadas = Array(e.n).fill(null);
  e.votos = Array(e.n).fill(null);
  e.prontos = Array(e.n).fill(false);
  e.mesa = [];
}

function pontuar(e) {
  const alvo = e.jogadas[e.narrador];
  const ganhos = Array(e.n).fill(0);
  const quem = outros(e);
  const acertaram = quem.filter(i => e.votos[i] === alvo);
  const dono = {};
  e.jogadas.forEach((c, i) => { dono[c] = i; });
  let caso;
  if (acertaram.length === 0 || acertaram.length === quem.length) {
    caso = acertaram.length ? 'todos' : 'ninguem';
    quem.forEach(i => { ganhos[i] += 2; });
  } else {
    caso = 'alguns';
    ganhos[e.narrador] += 3;
    acertaram.forEach(i => { ganhos[i] += 3; });
  }
  quem.forEach(i => { const d = dono[e.votos[i]]; if (d !== e.narrador) ganhos[d] += 1; });
  ganhos.forEach((g, i) => { e.pontos[i] += g; });
  e.res = { narrador: e.narrador, dica: e.dica, alvo, mesa: e.mesa.slice(), dono, votos: e.votos.slice(), ganhos, acertaram, caso };
  e.fase = 'resultado';
  if (Math.max(...e.pontos) >= META || e.baralho.length < e.n) e.fase = 'fim';
}

const nomeDe = (e, i) => e.nomes[i] || `Jogador ${i + 1}`;
const listaNomes = ns => ns.length <= 1 ? ns.join('') : ns.slice(0, -1).join(', ') + ' e ' + ns[ns.length - 1];

function textoResultado(e, eu) {
  const r = e.res, nn = nomeDe(e, r.narrador);
  const narr = eu === r.narrador ? 'sua carta' : `a carta de ${nn}`;
  if (r.caso === 'todos') return `Todo mundo achou ${narr}! Foi fácil demais 😅 — ${eu === r.narrador ? 'você fica' : `${nn} fica`} sem pontos e os outros ganham 2.`;
  if (r.caso === 'ninguem') return `Ninguém achou ${narr}! Foi difícil demais 🙈 — ${eu === r.narrador ? 'você fica' : `${nn} fica`} sem pontos e os outros ganham 2.`;
  const ac = r.acertaram.map(i => i === eu ? 'você' : nomeDe(e, i));
  return `${listaNomes(ac)} ${ac.length > 1 ? 'acharam' : 'achou'} ${narr}! 🎉`;
}

module.exports = {
  id: 'historias',
  nome: 'Contadores de Histórias',
  emoji: '🎨',
  descricao: 'Invente uma dica para uma carta mágica e tente adivinhar as cartas dos outros!',
  min: 3, max: 6, ordem: 30,

  iniciar(n, { nomes } = {}) {
    const e = {
      n, nomes: (nomes || []).slice(0, n),
      baralho: embaralhar(CARTAS.map(c => c.id)),
      maos: Array.from({ length: n }, () => []),
      pontos: Array(n).fill(0),
      narrador: Math.floor(Math.random() * n),
      rodada: 1,
      res: null,
    };
    novaRodada(e);
    comprar(e);
    return e;
  },

  visao(e, eu) {
    const souJogador = eu >= 0 && eu < e.n;
    const v = {
      fase: e.fase, rodada: e.rodada, narrador: e.narrador, dica: e.dica,
      placar: e.pontos.slice(), meta: META, baralho: e.baralho.length,
      mao: souJogador ? e.maos[eu].slice() : [],
      minhaCarta: souJogador ? e.jogadas[eu] : null,
      meuVoto: souJogador ? e.votos[eu] : null,
      jaAgiu: Array(e.n).fill(false),
      mesa: null, jogadasFeitas: 0, res: null,
    };
    const nn = nomeDe(e, e.narrador), souNarr = eu === e.narrador;
    if (e.fase === 'contar') {
      v.mensagem = souNarr ? 'Você conta a história! Escolha uma carta e invente uma dica ✨' : `${nn} está pensando numa história... 🤔`;
    } else if (e.fase === 'escolher') {
      v.jaAgiu = e.jogadas.map(c => c !== null);
      v.jogadasFeitas = e.jogadas.filter(c => c !== null).length;
      v.mensagem = souNarr ? `Os outros estão escolhendo cartas para a sua dica “${e.dica}”...`
        : !souJogador ? `Todos escolhem uma carta para a dica “${e.dica}”`
        : e.jogadas[eu] === null ? `Escolha uma carta que combine com: “${e.dica}”` : 'Boa! Esperando os outros escolherem... ⏳';
    } else if (e.fase === 'votar') {
      v.mesa = e.mesa.slice();
      v.jaAgiu = e.votos.map(c => c !== null);
      v.mensagem = souNarr ? 'Os outros estão tentando achar a sua carta... 🤞'
        : !souJogador ? `Qual é a carta de ${nn}?`
        : e.votos[eu] === null ? `Qual é a carta de ${nn}? Vote! 🗳️` : 'Voto dado! Esperando os outros... ⏳';
    } else {
      v.mesa = e.mesa.slice();
      v.res = e.res;
      v.jaAgiu = e.prontos.slice();
      const txt = textoResultado(e, eu);
      if (e.fase === 'fim') {
        const max = Math.max(...e.pontos);
        const venc = e.pontos.map((p, i) => p === max ? i : -1).filter(i => i >= 0);
        v.mensagem = `${txt} Fim de jogo! 🏁 ${venc.includes(eu) ? 'Você venceu! 🏆' : `${listaNomes(venc.map(i => nomeDe(e, i)))} ${venc.length > 1 ? 'venceram' : 'venceu'}!`}`;
      } else {
        v.mensagem = txt + (souJogador && !e.prontos[eu] ? ' Toque em “Próxima rodada”.' : '');
      }
    }
    return v;
  },

  pendentes(e) {
    if (e.fase === 'contar') return [e.narrador];
    if (e.fase === 'escolher') return outros(e).filter(i => e.jogadas[i] === null);
    if (e.fase === 'votar') return outros(e).filter(i => e.votos[i] === null);
    if (e.fase === 'resultado') return [...Array(e.n).keys()].filter(i => !e.prontos[i]);
    return [];
  },

  agir(e, eu, acao) {
    acao = acao || {};
    const carta = Number(acao.carta);
    if (e.fase === 'contar') {
      if (acao.tipo !== 'contar') return 'Agora é hora de contar a história!';
      if (eu !== e.narrador) return 'Não é você quem conta agora.';
      if (!e.maos[eu].includes(carta)) return 'Escolha uma carta da sua mão.';
      const dica = String(acao.dica || '').replace(/\s+/g, ' ').trim();
      if (!dica) return 'Escreva uma dica! ✏️';
      if (dica.length > MAX_DICA) return `A dica pode ter no máximo ${MAX_DICA} letras.`;
      e.dica = dica;
      e.jogadas[eu] = carta;
      e.maos[eu] = e.maos[eu].filter(c => c !== carta);
      e.fase = 'escolher';
      return null;
    }
    if (e.fase === 'escolher') {
      if (acao.tipo !== 'escolher') return 'Agora é hora de escolher uma carta.';
      if (eu === e.narrador) return 'Espere os outros escolherem.';
      if (e.jogadas[eu] !== null) return 'Você já escolheu!';
      if (!e.maos[eu].includes(carta)) return 'Escolha uma carta da sua mão.';
      e.jogadas[eu] = carta;
      e.maos[eu] = e.maos[eu].filter(c => c !== carta);
      if (e.jogadas.every(c => c !== null)) { e.mesa = embaralhar(e.jogadas.slice()); e.fase = 'votar'; }
      return null;
    }
    if (e.fase === 'votar') {
      if (acao.tipo !== 'votar') return 'Agora é hora de votar.';
      if (eu === e.narrador) return 'Quem conta a história não vota.';
      if (e.votos[eu] !== null) return 'Você já votou!';
      if (!e.mesa.includes(carta)) return 'Vote numa carta da mesa.';
      if (carta === e.jogadas[eu]) return 'Essa é a sua carta! Vote em outra. 😉';
      e.votos[eu] = carta;
      if (outros(e).every(i => e.votos[i] !== null)) pontuar(e);
      return null;
    }
    if (e.fase === 'resultado') {
      if (acao.tipo !== 'continuar') return 'Toque em “Próxima rodada”.';
      e.prontos[eu] = true;
      if (e.prontos.every(Boolean)) {
        e.narrador = (e.narrador + 1) % e.n;
        e.rodada++;
        novaRodada(e);
        comprar(e);
      }
      return null;
    }
    return 'O jogo acabou!';
  },

  fim(e) {
    if (e.fase !== 'fim') return null;
    const max = Math.max(...e.pontos);
    const vencedores = e.pontos.map((p, i) => p === max ? i : -1).filter(i => i >= 0);
    const texto = 'Placar: ' + e.pontos.map((p, i) => `${nomeDe(e, i)} ${p}`).join(' · ');
    return { vencedores, texto };
  },

  bot(e, eu) {
    if (e.fase === 'contar') {
      // escolhe uma carta e uma tag que combine com "algumas" cartas (nem óbvia, nem impossível)
      const opcoes = [];
      for (const c of e.maos[eu]) for (const t of CARTAS[c].tags) {
        const dica = t.replace(/-/g, ' ');
        const quantas = CARTAS.filter(x => combina(dica, x.id) > 0).length;
        opcoes.push({ c, dica, nota: Math.abs(quantas - 6) + Math.random() * 4 });
      }
      opcoes.sort((a, b) => a.nota - b.nota);
      const o = opcoes[0];
      let dica = o.dica;
      if (Math.random() < 0.25) {
        const outra = sortear(CARTAS[o.c].tags.filter(t => t.replace(/-/g, ' ') !== o.dica));
        if (outra) dica = `${o.dica} e ${outra.replace(/-/g, ' ')}`;
      }
      return { tipo: 'contar', carta: o.c, dica: dica.slice(0, MAX_DICA) };
    }
    if (e.fase === 'escolher') {
      let melhor = null, nota = -Infinity;
      for (const c of e.maos[eu]) {
        const s = combina(e.dica, c) + Math.random() * 1.5;
        if (s > nota) { nota = s; melhor = c; }
      }
      return { tipo: 'escolher', carta: melhor };
    }
    if (e.fase === 'votar') {
      let melhor = null, nota = -Infinity;
      for (const c of e.mesa) {
        if (c === e.jogadas[eu]) continue;
        const s = Math.min(combina(e.dica, c), 3) + Math.random() * 4;
        if (s > nota) { nota = s; melhor = c; }
      }
      return { tipo: 'votar', carta: melhor };
    }
    return { tipo: 'continuar' };
  },

  _combina: combina,
};
