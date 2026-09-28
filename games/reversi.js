// Reversi (Othello) — cerque as peças do adversário para virá-las para a sua cor!
const N = 8;
const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

// Quanto vale cada casa: cantos ótimos, casas vizinhas dos cantos (X e C) ruins.
const PESOS = [
  [100, -20, 10, 5, 5, 10, -20, 100],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [10, -2, 1, 1, 1, 1, -2, 10],
  [5, -2, 1, 0, 0, 1, -2, 5],
  [5, -2, 1, 0, 0, 1, -2, 5],
  [10, -2, 1, 1, 1, 1, -2, 10],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [100, -20, 10, 5, 5, 10, -20, 100],
];

const dentro = (l, c) => l >= 0 && l < N && c >= 0 && c < N;

// Casas que seriam viradas se `p` jogasse em (l, c).
function viradasEm(tab, l, c, p) {
  if (tab[l][c] >= 0) return [];
  const todas = [];
  for (const [dl, dc] of DIRS) {
    const linha = [];
    let ll = l + dl, cc = c + dc;
    while (dentro(ll, cc) && tab[ll][cc] === 1 - p) { linha.push([ll, cc]); ll += dl; cc += dc; }
    if (linha.length && dentro(ll, cc) && tab[ll][cc] === p) todas.push(...linha);
  }
  return todas;
}

function jogadasValidas(tab, p) {
  const r = [];
  for (let l = 0; l < N; l++) for (let c = 0; c < N; c++) if (tab[l][c] < 0 && viradasEm(tab, l, c, p).length) r.push([l, c]);
  return r;
}

function contar(tab) {
  const s = [0, 0];
  for (const linha of tab) for (const x of linha) if (x >= 0) s[x]++;
  return s;
}

function jogar(tab, l, c, p) {
  const v = viradasEm(tab, l, c, p);
  tab[l][c] = p;
  for (const [a, b] of v) tab[a][b] = p;
  return v;
}

// ----- computador -----
function avaliar(tab, eu) {
  const minhas = jogadasValidas(tab, eu).length, dele = jogadasValidas(tab, 1 - eu).length;
  if (!minhas && !dele) {
    const [a, b] = contar(tab), d = eu === 0 ? a - b : b - a;
    return d > 0 ? 10000 + d : d < 0 ? -10000 + d : 0;
  }
  let s = 0;
  for (let l = 0; l < N; l++) for (let c = 0; c < N; c++) {
    const x = tab[l][c];
    if (x === eu) s += PESOS[l][c]; else if (x === 1 - eu) s -= PESOS[l][c];
  }
  return s + 5 * (minhas - dele);
}

function minimax(tab, prof, alfa, beta, vez, eu) {
  if (prof === 0) return avaliar(tab, eu);
  const jog = jogadasValidas(tab, vez);
  if (!jog.length) {
    if (!jogadasValidas(tab, 1 - vez).length) return avaliar(tab, eu);
    return minimax(tab, prof - 1, alfa, beta, 1 - vez, eu); // passa a vez
  }
  const max = vez === eu;
  let melhor = max ? -Infinity : Infinity;
  for (const [l, c] of jog) {
    const copia = tab.map(x => x.slice());
    jogar(copia, l, c, vez);
    const s = minimax(copia, prof - 1, alfa, beta, 1 - vez, eu);
    if (max) { melhor = Math.max(melhor, s); alfa = Math.max(alfa, s); }
    else { melhor = Math.min(melhor, s); beta = Math.min(beta, s); }
    if (alfa >= beta) break;
  }
  return melhor;
}

function nomeDe(e, i) { return (e.nomes && e.nomes[i]) || `Jogador ${i + 1}`; }

module.exports = {
  id: 'reversi',
  nome: 'Reversi',
  emoji: '⚫',
  descricao: 'Cerque as peças do outro e vire tudo para a sua cor!',
  min: 2, max: 2, ordem: 60,

  iniciar(n, { nomes } = {}) {
    const tab = Array.from({ length: N }, () => Array(N).fill(-1));
    tab[3][3] = 1; tab[4][4] = 1; tab[3][4] = 0; tab[4][3] = 0;
    return { tab, vez: 0, ultimo: null, viradas: [], mensagem: null, acabou: false, jogadas: 0, nomes: nomes || [] };
  },

  visao(e, eu) {
    return {
      tab: e.tab,
      vez: e.vez,
      validas: !e.acabou && eu === e.vez ? jogadasValidas(e.tab, eu) : [],
      ultimo: e.ultimo,
      viradas: e.viradas,
      jogadas: e.jogadas,
      acabou: e.acabou,
      placar: contar(e.tab),
      mensagem: e.mensagem || undefined,
    };
  },

  pendentes(e) { return e.acabou ? [] : [e.vez]; },

  agir(e, eu, acao) {
    if (e.acabou) return 'O jogo já acabou!';
    if (eu !== e.vez) return 'Espere a sua vez!';
    const pos = acao && acao.pos;
    if (!Array.isArray(pos) || pos.length !== 2) return 'Jogada inválida';
    const l = Number(pos[0]), c = Number(pos[1]);
    if (!Number.isInteger(l) || !Number.isInteger(c) || !dentro(l, c)) return 'Casa inválida';
    if (e.tab[l][c] >= 0) return 'Essa casa já tem peça!';
    const v = jogar(e.tab, l, c, eu);
    if (!v.length) { e.tab[l][c] = -1; return 'Aí não vira nenhuma peça! Procure as bolinhas 😉'; }
    e.ultimo = [l, c];
    e.viradas = v;
    e.jogadas++;
    e.mensagem = null;
    const outro = 1 - eu;
    if (jogadasValidas(e.tab, outro).length) e.vez = outro;
    else if (jogadasValidas(e.tab, eu).length) {
      e.vez = eu;
      e.mensagem = `${nomeDe(e, outro)} não tinha jogada e passou a vez`;
    } else {
      e.acabou = true;
    }
    return null;
  },

  fim(e) {
    if (!e.acabou) return null;
    const [a, b] = contar(e.tab);
    if (a === b) return { vencedores: [], texto: `Empate! ${a} a ${b}.` };
    const g = a > b ? 0 : 1;
    return { vencedores: [g], texto: `${Math.max(a, b)} peças contra ${Math.min(a, b)}!` };
  },

  bot(e, eu) {
    const jog = jogadasValidas(e.tab, eu);
    const vazias = e.tab.flat().filter(x => x < 0).length;
    const prof = vazias <= 10 ? 4 : Math.random() < 0.5 ? 2 : 3;
    let melhor = -Infinity, escolha = jog[0];
    for (const [l, c] of jog) {
      const copia = e.tab.map(x => x.slice());
      jogar(copia, l, c, eu);
      const s = minimax(copia, prof - 1, -Infinity, Infinity, 1 - eu, eu) + Math.random() * 12;
      if (s > melhor) { melhor = s; escolha = [l, c]; }
    }
    return { pos: escolha };
  },

  _interno: { viradasEm, jogadasValidas, contar },
};
