// Damas (regras brasileiras) — tabuleiro 8x8, captura obrigatória pela maioria, dama voadora.
// Tabuleiro: tab[l][c], l = 0 é o topo (lado do assento 1), l = 7 é a base (lado do assento 0).
// Casas escuras: (l + c) % 2 === 1. Valores: 0 vazio, 1 pedra do 0, 2 dama do 0, 3 pedra do 1, 4 dama do 1.
const N = 8;
const DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const LIMITE_EMPATE = 20; // lances seguidos só de damas, sem captura

const dono = p => (p === 1 || p === 2 ? 0 : p === 3 || p === 4 ? 1 : -1);
const ehDama = p => p === 2 || p === 4;
const dentro = (l, c) => l >= 0 && l < N && c >= 0 && c < N;
const frente = j => (j === 0 ? -1 : 1);
const linhaDama = j => (j === 0 ? 0 : N - 1);

function tabuleiroInicial() {
  const tab = Array.from({ length: N }, () => Array(N).fill(0));
  for (let l = 0; l < N; l++) for (let c = 0; c < N; c++) {
    if ((l + c) % 2 !== 1) continue;
    if (l <= 2) tab[l][c] = 3;
    else if (l >= 5) tab[l][c] = 1;
  }
  return tab;
}

// Todas as sequências de captura a partir de (l, c). A peça sai da origem; peças capturadas
// continuam no tabuleiro até o fim do lance (bloqueiam e não podem ser puladas de novo).
function capturasDe(tab, l0, c0) {
  const p = tab[l0][c0], j = dono(p), dama = ehDama(p);
  const res = [];
  const capt = new Set();
  tab[l0][c0] = 0;
  const busca = (l, c, caminho, capturas) => {
    let achou = false;
    for (const [dl, dc] of DIRS) {
      if (dama) {
        let l1 = l + dl, c1 = c + dc;
        while (dentro(l1, c1) && tab[l1][c1] === 0) { l1 += dl; c1 += dc; }
        if (!dentro(l1, c1)) continue;
        const alvo = tab[l1][c1];
        if (dono(alvo) !== 1 - j || capt.has(l1 * N + c1)) continue;
        let l2 = l1 + dl, c2 = c1 + dc;
        while (dentro(l2, c2) && tab[l2][c2] === 0) {
          achou = true;
          capt.add(l1 * N + c1);
          busca(l2, c2, [...caminho, [l2, c2]], [...capturas, [l1, c1]]);
          capt.delete(l1 * N + c1);
          l2 += dl; c2 += dc;
        }
      } else {
        const l1 = l + dl, c1 = c + dc, l2 = l + 2 * dl, c2 = c + 2 * dc;
        if (!dentro(l2, c2) || tab[l2][c2] !== 0) continue;
        if (dono(tab[l1][c1]) !== 1 - j || capt.has(l1 * N + c1)) continue;
        achou = true;
        capt.add(l1 * N + c1);
        busca(l2, c2, [...caminho, [l2, c2]], [...capturas, [l1, c1]]);
        capt.delete(l1 * N + c1);
      }
    }
    if (!achou && capturas.length) res.push({ de: [l0, c0], caminho, capturas });
  };
  busca(l0, c0, [], []);
  tab[l0][c0] = p;
  return res;
}

function simplesDe(tab, l, c) {
  const p = tab[l][c], j = dono(p), res = [];
  for (const [dl, dc] of DIRS) {
    if (ehDama(p)) {
      let l1 = l + dl, c1 = c + dc;
      while (dentro(l1, c1) && tab[l1][c1] === 0) {
        res.push({ de: [l, c], caminho: [[l1, c1]], capturas: [] });
        l1 += dl; c1 += dc;
      }
    } else if (dl === frente(j)) {
      const l1 = l + dl, c1 = c + dc;
      if (dentro(l1, c1) && tab[l1][c1] === 0) res.push({ de: [l, c], caminho: [[l1, c1]], capturas: [] });
    }
  }
  return res;
}

// Lances legais do jogador j (já aplicando captura obrigatória e lei da maioria).
function lancesLegais(tab, j) {
  let capt = [];
  for (let l = 0; l < N; l++) for (let c = 0; c < N; c++) {
    if (dono(tab[l][c]) === j) capt.push(...capturasDe(tab, l, c));
  }
  if (capt.length) {
    const max = Math.max(...capt.map(m => m.capturas.length));
    return capt.filter(m => m.capturas.length === max);
  }
  const simples = [];
  for (let l = 0; l < N; l++) for (let c = 0; c < N; c++) {
    if (dono(tab[l][c]) === j) simples.push(...simplesDe(tab, l, c));
  }
  return simples;
}

// Aplica um lance no tabuleiro (muta). Devolve dados para desfazer.
function aplicar(tab, m) {
  const [l0, c0] = m.de;
  const p = tab[l0][c0], j = dono(p);
  const [lf, cf] = m.caminho[m.caminho.length - 1];
  const removidas = m.capturas.map(([l, c]) => [l, c, tab[l][c]]);
  tab[l0][c0] = 0;
  for (const [l, c] of m.capturas) tab[l][c] = 0;
  const promove = !ehDama(p) && lf === linhaDama(j);
  tab[lf][cf] = promove ? p + 1 : p;
  return { p, removidas, promove };
}
function desfazer(tab, m, d) {
  const [lf, cf] = m.caminho[m.caminho.length - 1];
  tab[lf][cf] = 0;
  for (const [l, c, v] of d.removidas) tab[l][c] = v;
  tab[m.de[0]][m.de[1]] = d.p;
}

const mesmo = (a, b) => a[0] === b[0] && a[1] === b[1];
function igual(m, acao) {
  if (!acao || !Array.isArray(acao.de) || !Array.isArray(acao.caminho)) return false;
  if (!mesmo(m.de, acao.de.map(Number)) || m.caminho.length !== acao.caminho.length) return false;
  return m.caminho.every((q, i) => Array.isArray(acao.caminho[i]) && mesmo(q, acao.caminho[i].map(Number)));
}

// ----- computador: minimax com poda alfa-beta -----
function avaliar(tab, eu) {
  let s = 0;
  for (let l = 0; l < N; l++) for (let c = 0; c < N; c++) {
    const p = tab[l][c];
    if (!p) continue;
    const j = dono(p);
    let v;
    if (ehDama(p)) v = 320;
    else {
      const avanco = j === 0 ? 7 - l : l; // 0..7
      v = 100 + avanco * 4;
      if (l === (j === 0 ? 7 : 0)) v += 6;          // guardar a última linha
    }
    if (c >= 2 && c <= 5 && l >= 2 && l <= 5) v += 4; // centro
    s += j === eu ? v : -v;
  }
  return s;
}
function minimax(tab, prof, alfa, beta, vez, eu) {
  const lances = lancesLegais(tab, vez);
  if (!lances.length) return vez === eu ? -100000 - prof : 100000 + prof;
  if (prof === 0) return avaliar(tab, eu);
  const max = vez === eu;
  let melhor = max ? -Infinity : Infinity;
  for (const m of lances) {
    const d = aplicar(tab, m);
    const s = minimax(tab, prof - 1, alfa, beta, 1 - vez, eu);
    desfazer(tab, m, d);
    if (max) { if (s > melhor) melhor = s; if (melhor > alfa) alfa = melhor; }
    else { if (s < melhor) melhor = s; if (melhor < beta) beta = melhor; }
    if (alfa >= beta) break;
  }
  return melhor;
}

function resumoLance(m) { return { de: m.de, caminho: m.caminho, capturas: m.capturas }; }

module.exports = {
  id: 'damas',
  nome: 'Damas',
  emoji: '⚪',
  descricao: 'Pule por cima das peças do adversário e chegue ao outro lado para virar dama 👑!',
  min: 2, max: 2, ordem: 50,

  // exportado para testes
  _interno: { lancesLegais, aplicar, capturasDe, avaliar },

  iniciar() {
    return {
      tab: tabuleiroInicial(), vez: 0, num: 0, partida: Math.random().toString(36).slice(2, 8),
      ultimo: null, capturadas: [0, 0], semCaptura: 0, vencedor: null, empate: false,
    };
  },

  visao(e, eu) {
    const v = { ...e };
    const fimJogo = e.vencedor !== null || e.empate;
    if (!fimJogo && eu === e.vez) {
      v.lances = lancesLegais(e.tab, eu).map(resumoLance);
      v.obrigatoria = v.lances.length > 0 && v.lances[0].capturas.length > 0;
      if (v.obrigatoria) {
        const n = v.lances[0].capturas.length;
        v.mensagem = n > 1 ? `Sua vez! Captura obrigatória: pegue ${n} peças! 💥` : 'Sua vez! Captura obrigatória! 💥';
      }
    } else {
      v.lances = [];
      v.obrigatoria = false;
    }
    if (!fimJogo && e.semCaptura >= LIMITE_EMPATE - 6 && !v.mensagem) {
      v.mensagem = `Só damas andando... faltam ${LIMITE_EMPATE - e.semCaptura} lances para dar empate 🤝`;
    }
    v.placar = e.capturadas.slice();
    return v;
  },

  pendentes(e) { return e.vencedor !== null || e.empate ? [] : [e.vez]; },

  agir(e, eu, acao) {
    if (eu !== e.vez) return 'Não é a sua vez!';
    const lances = lancesLegais(e.tab, eu);
    const m = lances.find(x => igual(x, acao));
    if (!m) {
      if (lances.length && lances[0].capturas.length) return 'Captura obrigatória! Você precisa capturar o máximo de peças.';
      return 'Esse movimento não vale!';
    }
    const d = aplicar(e.tab, m);
    e.capturadas[eu] += m.capturas.length;
    e.num++;
    e.ultimo = {
      jogador: eu, de: m.de, caminho: m.caminho, dama: ehDama(d.p),
      capturadas: d.removidas, promoveu: d.promove, num: e.num,
    };
    if (ehDama(d.p) && !m.capturas.length) e.semCaptura++;
    else e.semCaptura = 0;
    if (!lancesLegais(e.tab, 1 - eu).length) e.vencedor = eu;
    else if (e.semCaptura >= LIMITE_EMPATE) e.empate = true;
    else e.vez = 1 - eu;
    return null;
  },

  fim(e) {
    if (e.vencedor !== null) {
      const temPecas = e.tab.some(l => l.some(p => dono(p) === 1 - e.vencedor));
      return { vencedores: [e.vencedor], texto: temPecas ? 'O adversário ficou sem movimentos!' : 'Todas as peças do adversário foram capturadas!' };
    }
    if (e.empate) return { vencedores: [], texto: `${LIMITE_EMPATE} lances só de damas, sem capturas. Empate!` };
    return null;
  },

  bot(e, eu) {
    const tab = e.tab.map(l => l.slice());
    const lances = lancesLegais(tab, eu);
    if (lances.length === 1) return { de: lances[0].de, caminho: lances[0].caminho };
    const prof = lances.length > 12 ? 2 : 3; // + o lance da raiz = 3 a 4 jogadas de profundidade
    let melhor = -Infinity;
    const notas = lances.map(m => {
      const d = aplicar(tab, m);
      const s = minimax(tab, prof, -Infinity, Infinity, 1 - eu, eu) + Math.random() * 6;
      desfazer(tab, m, d);
      if (s > melhor) melhor = s;
      return s;
    });
    // um pouco de sorte: escolhe entre os lances quase tão bons quanto o melhor
    const bons = lances.filter((m, i) => notas[i] >= melhor - 8);
    const m = bons[Math.floor(Math.random() * bons.length)];
    return { de: m.de, caminho: m.caminho };
  },
};
