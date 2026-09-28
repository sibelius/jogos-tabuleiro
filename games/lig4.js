// Lig 4 — quem alinhar 4 peças primeiro (na horizontal, vertical ou diagonal) vence.
const LIN = 6, COL = 7;

function vencedorEm(tab) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let l = 0; l < LIN; l++) for (let c = 0; c < COL; c++) {
    const p = tab[l][c];
    if (p < 0) continue;
    for (const [dl, dc] of dirs) {
      const linha = [[l, c]];
      for (let k = 1; k < 4; k++) {
        const ll = l + dl * k, cc = c + dc * k;
        if (ll < 0 || ll >= LIN || cc < 0 || cc >= COL || tab[ll][cc] !== p) break;
        linha.push([ll, cc]);
      }
      if (linha.length === 4) return { jogador: p, linha };
    }
  }
  return null;
}

const colunasLivres = tab => [...Array(COL).keys()].filter(c => tab[0][c] < 0);

function soltar(tab, c, p) {
  for (let l = LIN - 1; l >= 0; l--) if (tab[l][c] < 0) { tab[l][c] = p; return l; }
  return -1;
}

// ----- computador: minimax com poda alfa-beta -----
function pontuarJanela(j, eu) {
  const minhas = j.filter(x => x === eu).length, dele = j.filter(x => x === 1 - eu).length, vazias = j.filter(x => x < 0).length;
  if (minhas === 4) return 1000;
  if (minhas === 3 && vazias === 1) return 6;
  if (minhas === 2 && vazias === 2) return 2;
  if (dele === 3 && vazias === 1) return -8;
  return 0;
}
function avaliar(tab, eu) {
  let s = 0;
  for (let l = 0; l < LIN; l++) if (tab[l][3] === eu) s += 3;
  for (let l = 0; l < LIN; l++) for (let c = 0; c < COL; c++) {
    for (const [dl, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      const j = [];
      for (let k = 0; k < 4; k++) {
        const ll = l + dl * k, cc = c + dc * k;
        if (ll < 0 || ll >= LIN || cc < 0 || cc >= COL) break;
        j.push(tab[ll][cc]);
      }
      if (j.length === 4) s += pontuarJanela(j, eu);
    }
  }
  return s;
}
function minimax(tab, prof, alfa, beta, vez, eu) {
  const v = vencedorEm(tab);
  if (v) return v.jogador === eu ? 100000 + prof : -100000 - prof;
  const livres = colunasLivres(tab);
  if (!livres.length) return 0;
  if (prof === 0) return avaliar(tab, eu);
  const ordem = livres.sort((a, b) => Math.abs(3 - a) - Math.abs(3 - b));
  if (vez === eu) {
    let melhor = -Infinity;
    for (const c of ordem) {
      const l = soltar(tab, c, vez);
      melhor = Math.max(melhor, minimax(tab, prof - 1, alfa, beta, 1 - vez, eu));
      tab[l][c] = -1;
      alfa = Math.max(alfa, melhor);
      if (alfa >= beta) break;
    }
    return melhor;
  }
  let pior = Infinity;
  for (const c of ordem) {
    const l = soltar(tab, c, vez);
    pior = Math.min(pior, minimax(tab, prof - 1, alfa, beta, 1 - vez, eu));
    tab[l][c] = -1;
    beta = Math.min(beta, pior);
    if (alfa >= beta) break;
  }
  return pior;
}

module.exports = {
  id: 'lig4',
  nome: 'Lig 4',
  emoji: '🔴',
  descricao: 'Solte as peças e alinhe 4 da sua cor antes do adversário!',
  min: 2, max: 2, ordem: 10,

  iniciar() {
    return { tab: Array.from({ length: LIN }, () => Array(COL).fill(-1)), vez: 0, ultimo: null, vitoria: null, empate: false, jogadas: 0 };
  },

  visao(e, eu) {
    return { ...e, livres: colunasLivres(e.tab) };
  },

  pendentes(e) { return e.vitoria || e.empate ? [] : [e.vez]; },

  agir(e, eu, acao) {
    const c = Number(acao.coluna);
    if (!(c >= 0 && c < COL)) return 'Coluna inválida';
    if (e.tab[0][c] >= 0) return 'Essa coluna está cheia!';
    const l = soltar(e.tab, c, eu);
    e.ultimo = [l, c];
    e.jogadas++;
    const v = vencedorEm(e.tab);
    if (v) e.vitoria = v;
    else if (!colunasLivres(e.tab).length) e.empate = true;
    else e.vez = 1 - eu;
    return null;
  },

  fim(e) {
    if (e.vitoria) return { vencedores: [e.vitoria.jogador], texto: 'Quatro em linha!' };
    if (e.empate) return { vencedores: [], texto: 'O tabuleiro encheu.' };
    return null;
  },

  bot(e, eu) {
    const tab = e.tab.map(l => l.slice());
    let melhor = -Infinity, escolhas = [];
    for (const c of colunasLivres(tab)) {
      const l = soltar(tab, c, eu);
      const s = minimax(tab, 4, -Infinity, Infinity, 1 - eu, eu);
      tab[l][c] = -1;
      if (s > melhor) { melhor = s; escolhas = [c]; } else if (s === melhor) escolhas.push(c);
    }
    return { coluna: escolhas[Math.floor(Math.random() * escolhas.length)] };
  },
};
