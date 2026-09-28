// Pontinhos (Dots and Boxes) — ligue os pontos e feche quadradinhos!
// h[l][c]: linha horizontal do ponto (l,c) ao (l,c+1)   — l 0..L, c 0..C-1
// v[l][c]: linha vertical do ponto (l,c) ao (l+1,c)     — l 0..L-1, c 0..C
// caixas[l][c]: dono do quadradinho (l,c)                — l 0..L-1, c 0..C-1

function tamanho(n) { return n <= 2 ? 5 : 6; }

function ladosDaCaixa(e, l, c) {
  return (e.h[l][c] >= 0) + (e.h[l + 1][c] >= 0) + (e.v[l][c] >= 0) + (e.v[l][c + 1] >= 0);
}

// Quadradinhos vizinhos de uma linha.
function caixasDaLinha(e, t, l, c) {
  const r = [];
  if (t === 'h') {
    if (l > 0) r.push([l - 1, c]);
    if (l < e.L) r.push([l, c]);
  } else {
    if (c > 0) r.push([l, c - 1]);
    if (c < e.C) r.push([l, c]);
  }
  return r;
}

function linhasLivres(e) {
  const r = [];
  for (let l = 0; l <= e.L; l++) for (let c = 0; c < e.C; c++) if (e.h[l][c] < 0) r.push({ linha: 'h', l, c });
  for (let l = 0; l < e.L; l++) for (let c = 0; c <= e.C; c++) if (e.v[l][c] < 0) r.push({ linha: 'v', l, c });
  return r;
}

const grade = (e, t) => (t === 'h' ? e.h : e.v);

// Coloca a linha e devolve os quadradinhos que ela fechou.
function marcar(e, t, l, c, p) {
  grade(e, t)[l][c] = p;
  const fechou = [];
  for (const [a, b] of caixasDaLinha(e, t, l, c)) {
    if (e.caixas[a][b] < 0 && ladosDaCaixa(e, a, b) === 4) { e.caixas[a][b] = p; fechou.push([a, b]); }
  }
  return fechou;
}

const fecha = (e, m) => caixasDaLinha(e, m.linha, m.l, m.c).some(([a, b]) => ladosDaCaixa(e, a, b) === 3);
const criaTres = (e, m) => caixasDaLinha(e, m.linha, m.l, m.c).some(([a, b]) => ladosDaCaixa(e, a, b) === 2);

// Quantos quadradinhos o próximo jogador consegue pegar em sequência depois da jogada m.
function entregaria(e, m) {
  const s = { L: e.L, C: e.C, h: e.h.map(x => x.slice()), v: e.v.map(x => x.slice()), caixas: e.caixas.map(x => x.slice()) };
  marcar(s, m.linha, m.l, m.c, 99);
  let total = 0;
  for (;;) {
    const livre = linhasLivres(s).find(x => fecha(s, x));
    if (!livre) return total;
    total += marcar(s, livre.linha, livre.l, livre.c, 98).length;
  }
}

function nomeDe(e, i) { return (e.nomes && e.nomes[i]) || `Jogador ${i + 1}`; }
const sorteia = a => a[Math.floor(Math.random() * a.length)];

module.exports = {
  id: 'pontinhos',
  nome: 'Pontinhos',
  emoji: '🟦',
  descricao: 'Ligue os pontinhos e feche quadrados para ganhar pontos!',
  min: 2, max: 4, ordem: 70,

  iniciar(n, { nomes } = {}) {
    const L = tamanho(n), C = L;
    return {
      n, L, C,
      h: Array.from({ length: L + 1 }, () => Array(C).fill(-1)),
      v: Array.from({ length: L }, () => Array(C + 1).fill(-1)),
      caixas: Array.from({ length: L }, () => Array(C).fill(-1)),
      vez: 0, ultimo: null, fechadas: [], jogadas: 0, mensagem: null, acabou: false, nomes: nomes || [],
    };
  },

  visao(e) {
    const placar = Array(e.n).fill(0);
    for (const linha of e.caixas) for (const x of linha) if (x >= 0) placar[x]++;
    return {
      L: e.L, C: e.C, h: e.h, v: e.v, caixas: e.caixas, vez: e.vez,
      ultimo: e.ultimo, fechadas: e.fechadas, jogadas: e.jogadas, acabou: e.acabou,
      placar, mensagem: e.mensagem || undefined,
    };
  },

  pendentes(e) { return e.acabou ? [] : [e.vez]; },

  agir(e, eu, acao) {
    if (e.acabou) return 'O jogo já acabou!';
    if (eu !== e.vez) return 'Espere a sua vez!';
    const t = acao && acao.linha, l = Number(acao && acao.l), c = Number(acao && acao.c);
    if (t !== 'h' && t !== 'v') return 'Linha inválida';
    const maxL = t === 'h' ? e.L : e.L - 1, maxC = t === 'h' ? e.C - 1 : e.C;
    if (!Number.isInteger(l) || !Number.isInteger(c) || l < 0 || c < 0 || l > maxL || c > maxC) return 'Linha inválida';
    if (grade(e, t)[l][c] >= 0) return 'Essa linha já foi desenhada!';
    const fechou = marcar(e, t, l, c, eu);
    e.ultimo = { linha: t, l, c };
    e.fechadas = fechou;
    e.jogadas++;
    if (!linhasLivres(e).length) { e.acabou = true; e.mensagem = null; return null; }
    if (fechou.length) {
      e.mensagem = `${nomeDe(e, eu)} fechou ${fechou.length === 2 ? 'dois quadradinhos' : 'um quadradinho'} e joga de novo! ⭐`;
    } else {
      e.mensagem = null;
      e.vez = (eu + 1) % e.n;
    }
    return null;
  },

  fim(e) {
    if (!e.acabou) return null;
    const placar = Array(e.n).fill(0);
    for (const linha of e.caixas) for (const x of linha) if (x >= 0) placar[x]++;
    const max = Math.max(...placar);
    const venc = placar.map((p, i) => (p === max ? i : -1)).filter(i => i >= 0);
    if (venc.length === e.n) return { vencedores: [], texto: `Empate! Todo mundo fez ${max} quadradinhos.` };
    return {
      vencedores: venc,
      texto: venc.length > 1 ? `Empate no topo com ${max} quadradinhos cada!` : `${max} quadradinhos fechados!`,
    };
  },

  bot(e) {
    const livres = linhasLivres(e);
    // 1) Fechar um quadradinho sempre que der.
    const fechar = livres.filter(m => fecha(e, m));
    if (fechar.length) return sorteia(fechar);
    // 2) Jogada segura: não deixar quadradinho com 3 lados (às vezes o robô se distrai).
    const seguras = livres.filter(m => !criaTres(e, m));
    if (seguras.length) return Math.random() < 0.06 ? sorteia(livres) : sorteia(seguras);
    // 3) Sem saída: entregar a menor corrente possível.
    let menor = Infinity, opcoes = [];
    for (const m of livres) {
      const q = entregaria(e, m);
      if (q < menor) { menor = q; opcoes = [m]; } else if (q === menor) opcoes.push(m);
    }
    return sorteia(opcoes);
  },
};
